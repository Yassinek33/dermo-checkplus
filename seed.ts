import { createClient } from '@supabase/supabase-js';
import { blogArticlesFR } from './data/blogArticles.js';

const supabaseUrl = 'https://jsxvixqkkwqrsnsstclt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeHZpeHFra3dxcnNuc3N0Y2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTY5NDgsImV4cCI6MjA4NjczMjk0OH0.5O5vGDtEI2_0FLfGBs7fgtM82XUeRpl1ZJFcBBhS728';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Logging in as admin...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@dermatocheck.com',
        password: 'Yassinek33*'
    });
    
    if (authError) {
        // Fallback to the original admin if the update failed
        const { error: fallbackError } = await supabase.auth.signInWithPassword({
            email: 'admin_check@dermato-check.com', 
            password: 'AdminPassword123!'
        });
        if (fallbackError) {
             console.error("Could not authenticate as admin.", fallbackError.message);
             return;
        }
    }
    
    const { data: userData } = await supabase.auth.getUser();
    const author_id = userData.user.id;

    console.log("Seeding posts...");
    for (const article of blogArticlesFR) {
        const { error } = await supabase.from('posts').upsert({
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            status: 'published',
            author_id: author_id,
            tags: article.tags
        }, { onConflict: 'slug' });
        
        if (error) console.error("Error inserting", article.slug, error);
        else console.log("Inserted", article.slug);
    }
    console.log("Done!");
}
seed();
