require('dotenv').config();

const SITE = process.env.ATLASSIAN_SITE;
const EMAIL = process.env.ATLASSIAN_EMAIL;
const TOKEN = process.env.ATLASSIAN_API_TOKEN;
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "SCRUM";

if (!SITE || !EMAIL || !TOKEN) {
    console.error("Missing Jira credentials in .env");
    process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(EMAIL + ':' + TOKEN).toString('base64');
const headers = {
    'Authorization': authHeader,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

function adfDoc(text) {
    const lines = text.split('\n');
    const content = [];
    for (let line of lines) {
        if (line.trim() !== '') {
            content.push({
                type: "paragraph",
                content: [{ type: "text", text: line }]
            });
        }
    }
    return {
        type: "doc",
        version: 1,
        content: content.length > 0 ? content : [{ type: "paragraph", content: [{ type: "text", text: " " }] }]
    };
}

async function createStory(title, description, parentEpic = null) {
    try {
        const fields = {
            project: { key: PROJECT_KEY },
            summary: title,
            description: adfDoc(description),
            issuetype: { name: "Historia" } // Mapped to 10005
        };

        if (parentEpic) {
            fields.parent = { key: parentEpic };
        }

        const res = await fetch(`https://${SITE}/rest/api/3/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ fields })
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("Error creating issue:", JSON.stringify(data, null, 2));
            process.exit(1);
        }
        console.log(`Successfully created story: ${data.key}`);
        console.log(`URL: https://${SITE}/browse/${data.key}`);
        return data.key;
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

async function transitionIssue(issueKey, statusName) {
    try {
        // ID mapping defined manually based on output
        const transitionMap = {
            "Idea": "11",
            "Por hacer": "21",
            "En curso": "31",
            "Pruebas": "41",
            "Finalizado": "51"
        };

        const transitionId = transitionMap[statusName];
        if (!transitionId) {
            console.error(`Invalid status: ${statusName}. Valid statuses are: Idea, Por hacer, En curso, Pruebas, Finalizado.`);
            process.exit(1);
        }

        const payload = { transition: { id: transitionId } };

        const res = await fetch(`https://${SITE}/rest/api/3/issue/${issueKey}/transitions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Failed to transition issue ${issueKey} to '${statusName}'. Status: ${res.status}`, errorText);
            process.exit(1);
        }

        console.log(`Successfully transitioned ${issueKey} to '${statusName}'`);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
const command = args[0];

if (command === "create-story") {
    const title = args[1];
    const desc = args[2] || "";
    const epic = args[3] || null;

    if (!title) {
        console.log("Usage: node scripts/jira.js create-story \"Title\" \"Description\" [Epic Key]");
        process.exit(1);
    }

    createStory(title, desc, epic);

} else if (command === "transition") {
    const issueKey = args[1];
    const status = args[2];

    if (!issueKey || !status) {
        console.log("Usage: node scripts/jira.js transition ISSUE-KEY \"Status\"");
        console.log("Valid Statuses: Idea, Por hacer, En curso, Pruebas, Finalizado");
        process.exit(1);
    }

    transitionIssue(issueKey, status);
} else {
    console.log("Invalid command. Available: create-story, transition");
    process.exit(1);
}
