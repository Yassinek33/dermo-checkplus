import { createClient } from '@supabase/supabase-js';

// Configuration derived from your provided key
const supabaseUrl = 'https://jsxvixqkkwqrsnsstclt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeHZpeHFra3dxcnNuc3N0Y2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTY5NDgsImV4cCI6MjA4NjczMjk0OH0.5O5vGDtEI2_0FLfGBs7fgtM82XUeRpl1ZJFcBBhS728';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAdmin() {
    console.log("Logging in with old credentials to update...");

    // Login with old
    const loginRes = await supabase.auth.signInWithPassword({
        email: 'admin_check@dermato-check.com',
        password: 'AdminPassword123!'
    });

    if (loginRes.error) {
        console.error("Login failed, user might not exist or password changed:", loginRes.error.message);
        return;
    }

    // Update email and password
    const { data, error } = await supabase.auth.updateUser({
        email: 'admin@dermatocheck.com',
        password: 'Yassinek33*'
    });

    if (error) {
        console.error("Failed to update user:", error.message);
    } else {
        console.log("SUCCESS! Credentials updated.");
    }
}

updateAdmin();
