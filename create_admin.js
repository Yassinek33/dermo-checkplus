const { createClient } = require('@supabase/supabase-js');

// Configuration derived from your provided key
const supabaseUrl = 'https://jsxvixqkkwqrsnsstclt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeHZpeHFra3dxcnNuc3N0Y2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTY5NDgsImV4cCI6MjA4NjczMjk0OH0.5O5vGDtEI2_0FLfGBs7fgtM82XUeRpl1ZJFcBBhS728';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log("Signing up admin_check@dermato-check.com...");
  const { data, error } = await supabase.auth.signUp({
    email: 'admin_check@dermato-check.com',
    password: 'AdminPassword123!',
    options: {
        data: {
            full_name: 'Administrateur Principal'
        }
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
        console.log("User already exists. Attempting login to set role...");
        const loginRes = await supabase.auth.signInWithPassword({
            email: 'admin_check@dermato-check.com',
            password: 'AdminPassword123!'
        });
        if (loginRes.error) {
            console.error("Login failed:", loginRes.error.message);
            return;
        }
        console.log("Logged in. Updating role...");
        const updateRes = await supabase.from('profiles').update({ role: 'admin' }).eq('id', loginRes.data.user.id);
        if (updateRes.error) {
            console.error("Failed to update role:", updateRes.error.message);
        } else {
            console.log("SUCCESS! Admin account is ready.");
        }
        return;
    }
    console.error("Signup failed:", error.message);
    return;
  }

  console.log("Signed up! User ID:", data.user.id);
  console.log("Updating role to admin...");
  
  // Update role to admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', data.user.id);

  if (updateError) {
    console.error("Failed to set admin role:", updateError.message);
  } else {
    console.log("SUCCESS! Admin account created and configured.");
  }
}

createAdmin();
