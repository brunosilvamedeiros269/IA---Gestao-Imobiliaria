require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listTables() {
    try {
        console.log('--- TABLES (via known tables test) ---');
        const tables = ['agencies', 'users_profile', 'properties', 'leads'];
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
            if (!error) {
                console.log(`[OK] ${table}`);
            } else {
                console.log(`[ERR] ${table}: ${error.message}`);
            }
        }
    } catch (err) {
        console.error("Error: " + err.message);
    }
}

async function getUser(email) {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;

        const user = data.users.find(u => u.email === email);
        if (user) {
            console.log('--- USER FOUND ---');
            console.log(`ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Created: ${user.created_at}`);
        } else {
            console.log('User not found.');
        }
    } catch (err) {
        console.error(err.message);
    }
}

async function createAdmin(email, password, fullName) {
    try {
        console.log(`--- CREATING ADMIN: ${email} ---`);
        
        // 1. Delete if exists
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = usersData.users.find(u => u.email === email);
        if (existingUser) {
            console.log(`Deleting existing user ${existingUser.id}...`);
            await supabase.auth.admin.deleteUser(existingUser.id);
        }

        // 2. Create User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) throw authError;
        const user = authData.user;
        console.log(`User created: ${user.id}`);

        // 3. Get Agency
        const { data: agency } = await supabase.from('agencies').select('id').limit(1).single();
        if (!agency) throw new Error("No agency found to link user");

        // 4. Create Profile
        const { error: profileError } = await supabase.from('users_profile').upsert({
            id: user.id,
            agency_id: agency.id,
            full_name: fullName,
            role: 'admin'
        });

        if (profileError) throw profileError;
        console.log(`Profile created/updated for ${fullName}`);
        console.log('--- DONE ---');

    } catch (err) {
        console.error("Error: " + err.message);
    }
}

const args = process.argv.slice(2);
const command = args[0];

if (command === "list-tables") {
    listTables();
} else if (command === "get-user") {
    const email = args[1];
    if (!email) {
        console.log("Usage: node scripts/supabase.js get-user email@example.com");
        process.exit(1);
    }
    getUser(email);
} else if (command === "create-admin") {
    const email = args[1] || 'admin@antigravity.ia';
    const password = args[2] || 'admin123';
    const fullName = args[3] || 'Antigravity Admin';
    createAdmin(email, password, fullName);
} else {
    console.log("Available commands: list-tables, get-user, create-admin");
    process.exit(1);
}
