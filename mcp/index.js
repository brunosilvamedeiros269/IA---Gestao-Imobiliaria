import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Environment variables
const ATLASSIAN_SITE = process.env.ATLASSIAN_SITE;
const ATLASSIAN_EMAIL = process.env.ATLASSIAN_EMAIL;
const ATLASSIAN_API_TOKEN = process.env.ATLASSIAN_API_TOKEN;

if (!ATLASSIAN_SITE || !ATLASSIAN_EMAIL || !ATLASSIAN_API_TOKEN) {
    console.error("Missing required environment variables: ATLASSIAN_SITE, ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN");
    process.exit(1);
}

// Axios instance with Basic Auth
const jiraApi = axios.create({
    baseURL: `https://${ATLASSIAN_SITE}/rest/api/3`,
    headers: {
        'Authorization': `Basic ${Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

const server = new Server(
    {
        name: "jira-mcp-server",
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
                name: "jira_get_issue",
                description: "Get details of a Jira issue by its key/ID (e.g., PROJ-123).",
                inputSchema: {
                    type: "object",
                    properties: {
                        issueKey: {
                            type: "string",
                            description: "The key of the Jira issue to retrieve.",
                        },
                    },
                    required: ["issueKey"],
                },
            },
            {
                name: "jira_search",
                description: "Search for Jira issues using JQL (Jira Query Language).",
                inputSchema: {
                    type: "object",
                    properties: {
                        jql: {
                            type: "string",
                            description: "The JQL query string.",
                        },
                        maxResults: {
                            type: "number",
                            description: "Maximum number of results to return.",
                            default: 50,
                        },
                    },
                    required: ["jql"],
                },
            },
            {
                name: "jira_add_comment",
                description: "Add a comment to an existing Jira issue.",
                inputSchema: {
                    type: "object",
                    properties: {
                        issueKey: {
                            type: "string",
                            description: "The key of the Jira issue to comment on.",
                        },
                        commentText: {
                            type: "string",
                            description: "The text of the comment to add.",
                        },
                    },
                    required: ["issueKey", "commentText"],
                },
            },
            {
                name: "jira_create_issue",
                description: "Create a new Jira issue.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectKey: {
                            type: "string",
                            description: "The key of the project to create the issue in (e.g., PROJ).",
                        },
                        summary: {
                            type: "string",
                            description: "The summary/title of the issue.",
                        },
                        description: {
                            type: "string",
                            description: "The description of the issue.",
                        },
                        issueTypeName: {
                            type: "string",
                            description: "The name of the issue type (e.g., Task, Bug, Story).",
                            default: "Task",
                        },
                    },
                    required: ["projectKey", "summary", "description", "issueTypeName"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "jira_get_issue") {
            const response = await jiraApi.get(`/issue/${args.issueKey}`);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }

        if (name === "jira_search") {
            const response = await jiraApi.get('/search', {
                params: {
                    jql: args.jql,
                    maxResults: args.maxResults || 50,
                }
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        }

        if (name === "jira_add_comment") {
            // Jira API v3 requires Atlassian Document Format for comments
            const body = {
                body: {
                    type: "doc",
                    version: 1,
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    text: args.commentText,
                                    type: "text",
                                },
                            ],
                        },
                    ],
                },
            };
            const response = await jiraApi.post(`/issue/${args.issueKey}/comment`, body);
            return {
                content: [
                    {
                        type: "text",
                        text: `Comment added successfully to ${args.issueKey}. ID: ${response.data.id}`,
                    },
                ],
            };
        }

        if (name === "jira_create_issue") {
            const requestBody = {
                fields: {
                    project: {
                        key: args.projectKey,
                    },
                    summary: args.summary,
                    description: {
                        type: "doc",
                        version: 1,
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: args.description,
                                    },
                                ],
                            },
                        ],
                    },
                    issuetype: {
                        name: args.issueTypeName,
                    },
                },
            };

            const response = await jiraApi.post('/issue', requestBody);
            return {
                content: [
                    {
                        type: "text",
                        text: `Issue created successfully. Key: ${response.data.key}, ID: ${response.data.id}`,
                    },
                ],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Jira API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data) || error.message}`,
                    },
                ],
                isError: true,
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Error parsing request or executing tool: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Jira MCP server running on stdio");
}

run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
