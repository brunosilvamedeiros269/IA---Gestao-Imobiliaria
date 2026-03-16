const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config(); // Fallback to .env

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

// ---- API Callers ---- //
async function createIssue(title, description, issueTypeName, parentKey = null) {
    try {
        const fields = {
            project: { key: PROJECT_KEY },
            summary: title,
            description: adfDoc(description),
            issuetype: { name: issueTypeName }
        };

        if (parentKey) {
            fields.parent = { key: parentKey };
        }

        const res = await fetch(`https://${SITE}/rest/api/3/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ fields })
        });

        const data = await res.json();
        if (!res.ok) {
            console.error(`Error creating ${issueTypeName}:`, JSON.stringify(data, null, 2));
            process.exit(1);
        }
        console.log(`Successfully created ${issueTypeName}: ${data.key} - https://${SITE}/browse/${data.key}`);
        return data.key;
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

async function listEpics() {
    try {
        // Build JQL to find all Epics in the project
        const jql = `project = ${PROJECT_KEY} AND issuetype = Epic`;
        const res = await fetch(`https://${SITE}/rest/api/3/search/jql`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ jql, fields: ["summary"] })
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("Error listing epics:", data);
            return;
        }

        console.log(`--- EPICS for ${PROJECT_KEY} ---`);
        for (const issue of data.issues) {
            console.log(`[${issue.key}] ${issue.fields.summary}`);
        }
        console.log(`------------------------------`);
    } catch (err) {
        console.error(err.message);
    }
}

async function listStoriesWithoutEpic() {
    try {
        // Encontra histórias sem parent (épico)
        const jql = `project = ${PROJECT_KEY} AND issuetype = Historia AND parent is EMPTY`;
        const res = await fetch(`https://${SITE}/rest/api/3/search/jql`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ jql, fields: ["summary"] })
        });
        const data = await res.json();
        if (!res.ok) {
            console.error("Error searching:", data);
            return;
        }

        console.log("--- Unlinked Stories ---");
        for (const issue of data.issues) {
            console.log(`[${issue.key}] ${issue.fields.summary}`);
        }
    } catch (err) {
        console.error(err);
    }
}

async function linkStoryToEpic(storyKey, epicKey) {
    try {
        const payload = {
            fields: {
                parent: { key: epicKey }
            }
        };

        const res = await fetch(`https://${SITE}/rest/api/3/issue/${storyKey}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const data = await res.json();
            console.error("Error linking to epic:", JSON.stringify(data, null, 2));
            process.exit(1);
        }
        console.log(`Successfully linked ${storyKey} to Epic ${epicKey}`);
    } catch (err) {
        console.error(err.message);
    }
}

async function transitionIssue(issueKey, statusName) {
    try {
        const transitionMap = {
            "Idea": "11",
            "Por hacer": "21",
            "En curso": "31",
            "Pruebas": "41",
            "Finalizado": "51"
        };
        const transitionId = transitionMap[statusName];
        if (!transitionId) {
            console.error(`Invalid status: ${statusName}. Valid statuses: Idea, Por hacer, En curso, Pruebas, Finalizado.`);
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
    const epic = args[3];

    if (!title || !epic) {
        console.error("⛔ AGILE VIOLATION: Cannot create a story without linking it to an Epic.");
        console.log("Usage: node scripts/jira.js create-story \"Title\" \"Description\" EPIC-KEY");
        console.log("Run 'node scripts/jira.js list-epics' to see available Epics.");
        process.exit(1);
    }

    createIssue(title, desc, "Historia", epic);

} else if (command === "create-epic") {
    const title = args[1];
    const desc = args[2] || "";
    if (!title) {
        console.log("Usage: node scripts/jira.js create-epic \"Title\" \"Description\"");
        process.exit(1);
    }
    createIssue(title, desc, "Epic");

} else if (command === "list-epics") {
    listEpics();
} else if (command === "list-orphans") {
    listStoriesWithoutEpic();
} else if (command === "link-epic") {
    const storyKey = args[1];
    const epicKey = args[2];
    if (!storyKey || !epicKey) {
        console.log("Usage: node scripts/jira.js link-epic STORY-KEY EPIC-KEY");
        process.exit(1);
    }
    linkStoryToEpic(storyKey, epicKey);
} else if (command === "transition") {
    const issueKey = args[1];
    const status = args[2];

    if (!issueKey || !status) {
        console.log("Usage: node scripts/jira.js transition ISSUE-KEY \"Status\"");
        process.exit(1);
    }
    transitionIssue(issueKey, status);
} else {
    console.log("Invalid command. Available: create-story, create-epic, list-epics, list-orphans, link-epic, transition");
    process.exit(1);
}
