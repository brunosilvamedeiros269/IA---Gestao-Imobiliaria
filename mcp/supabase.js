import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env.local in the root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const server = new Server(
    {
        name: "supabase-mcp-server-local",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "supabase_list_tables",
                description: "List all tables in the public schema.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "supabase_get_table_schema",
                description: "Get the schema/columns of a specific table.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tableName: {
                            type: "string",
                            description: "The name of the table.",
                        },
                    },
                    required: ["tableName"],
                },
            },
            {
                name: "supabase_execute_query",
                description: "Execute a read-only SQL query on the database.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The SQL query to execute (SELECT only).",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "supabase_get_user_by_email",
                description: "Get user details from Auth by email.",
                inputSchema: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                            description: "The user's email address.",
                        },
                    },
                    required: ["email"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "supabase_list_tables") {
            const { data, error } = await supabase
                .rpc("list_public_tables"); // Preferred if exists

            if (error) {
                // Fallback: try information_schema if exposed
                const { data: data2, error: error2 } = await supabase
                    .from("tables")
                    .select("table_name")
                    .eq("table_schema", "public");
                
                if (error2) throw new Error("Could not list tables. Ensure 'list_public_tables' RPC exists or 'information_schema.tables' is exposed. Error: " + error2.message);
                return {
                    content: [{ type: "text", text: JSON.stringify(data2, null, 2) }],
                };
            }
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }

        if (name === "supabase_get_table_schema") {
            const { data, error } = await supabase
                .rpc("get_table_schema", { table_name: args.tableName });

            // Fallback if RPC doesn't exist: use information_schema
            if (error) {
                const { data: cols, error: colError } = await supabase
                    .from("information_schema.columns")
                    .select("column_name, data_type, is_nullable")
                    .eq("table_name", args.tableName)
                    .eq("table_schema", "public");
                
                if (colError) throw colError;
                return {
                    content: [{ type: "text", text: JSON.stringify(cols, null, 2) }],
                };
            }

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }

        if (name === "supabase_execute_query") {
            // Very basic safety check
            if (!args.query.toLowerCase().trim().startsWith("select")) {
                throw new Error("Only SELECT queries are allowed for safety via this tool.");
            }

            const { data, error } = await supabase.rpc("execute_sql", { sql_query: args.query });
            
            if (error) {
                // If RPC execute_sql is not available, we can't run raw SQL easily via JS client without it.
                // Suggesting the user to use the available supabase-mcp-server tool instead if they want full SQL access.
                return {
                    content: [{ type: "text", text: `Error: SQL execution requires a dedicated 'execute_sql' RPC or using the official supabase-mcp-server. Error detail: ${error.message}` }],
                    isError: true
                };
            }

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }

        if (name === "supabase_get_user_by_email") {
            const { data, error } = await supabase.auth.admin.listUsers();
            if (error) throw error;

            const user = data.users.find(u => u.email === args.email);
            return {
                content: [{ type: "text", text: JSON.stringify(user || { message: "User not found" }, null, 2) }],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
        return {
            content: [{ type: "text", text: `Supabase MCP Error: ${error.message}` }],
            isError: true,
        };
    }
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Supabase MCP server running on stdio");
}

run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
