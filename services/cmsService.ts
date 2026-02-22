import { supabase } from './supabaseClient';
import { blogArticlesFR } from '../data/blogArticles';

// --- Types ---
export interface SiteSettings {
    theme?: { primaryColor: string; secondaryColor?: string; accentColor?: string; };
    seo?: { title: string; description: string; keywords: string };
    maintenance?: { enabled: boolean };
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: 'draft' | 'published';
    author_id: string;
    seo_title: string;
    seo_description: string;
    featured_image_url: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    author_name?: string; // Appended from profiles
}

export interface Page {
    id: string;
    title: string;
    path: string;
    content: any; // JSONB
    status: 'draft' | 'published';
    updated_at: string;
}

export interface MediaItem {
    id: string;
    name: string;
    alt_text: string;
    file_type: string;
    file_size: number;
    url: string;
    uploaded_by: string;
    created_at: string;
}

export interface Profile {
    id: string;
    full_name: string;
    role: 'patient' | 'dermatologist' | 'admin';
    created_at: string;
    email?: string;
}

// --- CMS Service API ---
export const cmsService = {
    // === SETTINGS ===
    async getSettings(): Promise<SiteSettings> {
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) {
            console.error('Error fetching settings:', error);
            return {};
        }

        const settings: any = {};
        data?.forEach((row: any) => {
            settings[row.key] = row.value;
        });
        return settings;
    },

    async updateSetting(key: string, value: any) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });
        if (error) throw error;
    },

    // === POSTS (Blog) ===
    async getPosts(status?: 'draft' | 'published'): Promise<Post[]> {
        let query = supabase.from('posts').select(`*, profiles(full_name)`).order('created_at', { ascending: false });
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) {
            console.warn('Supabase posts fetch error, using local data:', error.message);
            // Fallback to local blog articles data
            return blogArticlesFR.map(a => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                content: a.content,
                excerpt: a.excerpt,
                status: 'published' as const,
                author_id: '',
                seo_title: a.title,
                seo_description: a.excerpt,
                featured_image_url: '',
                tags: a.tags,
                created_at: a.date + 'T00:00:00Z',
                updated_at: a.date + 'T00:00:00Z',
                author_name: a.author
            }));
        }

        // If Supabase returns empty, fall back to local data
        if (!data || data.length === 0) {
            console.info('Supabase posts table is empty, using local blog data as fallback');
            return blogArticlesFR.map(a => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                content: a.content,
                excerpt: a.excerpt,
                status: 'published' as const,
                author_id: '',
                seo_title: a.title,
                seo_description: a.excerpt,
                featured_image_url: '',
                tags: a.tags,
                created_at: a.date + 'T00:00:00Z',
                updated_at: a.date + 'T00:00:00Z',
                author_name: a.author
            }));
        }

        return (data || []).map((row: any) => ({
            ...row,
            author_name: row.profiles?.full_name || 'Admin'
        }));
    },

    async getPostBySlug(slug: string): Promise<Post | null> {
        const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single();
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    },

    async savePost(post: Partial<Post>) {
        // Auto-generate slug if missing
        if (!post.slug && post.title) {
            post.slug = post.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        // Detect valid UUID (local fallback data has IDs like "1", "2")
        const isValidUUID = !!post.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(post.id!);

        // Whitelist ONLY actual posts table columns — strip joined 'profiles', 'author_name', etc.
        const payload: any = {
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            status: post.status,
            seo_title: post.seo_title,
            seo_description: post.seo_description,
            featured_image_url: post.featured_image_url,
            tags: post.tags,
            updated_at: new Date().toISOString()
        };

        // Only include author_id if it looks like a valid UUID
        if (post.author_id && /^[0-9a-f]{8}-/.test(post.author_id)) {
            payload.author_id = post.author_id;
        }

        if (isValidUUID) {
            // Update existing Supabase record by UUID
            payload.id = post.id;
            const { data, error } = await supabase
                .from('posts')
                .upsert(payload, { onConflict: 'id' })
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            // No valid UUID: find existing by slug or insert new
            const { data: existing } = await supabase
                .from('posts')
                .select('id')
                .eq('slug', payload.slug)
                .maybeSingle();

            if (existing) {
                // Update the existing DB record by slug
                const { data, error } = await supabase
                    .from('posts')
                    .update(payload)
                    .eq('slug', payload.slug)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                // Insert brand new record
                const { data, error } = await supabase
                    .from('posts')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }
        }
    },


    async deletePost(id: string) {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
    },

    // === PAGES ===
    async getPages(): Promise<Page[]> {
        const { data, error } = await supabase.from('pages').select('*').order('title');
        if (error) throw error;
        return data || [];
    },

    async savePage(page: Partial<Page>) {
        const { error } = await supabase
            .from('pages')
            .upsert({ ...page, updated_at: new Date().toISOString() });
        if (error) throw error;
    },

    // === MEDIA ===
    async getMedia(): Promise<MediaItem[]> {
        const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async uploadMedia(file: File, userId: string): Promise<MediaItem> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

        // 3. Save to Database
        const { data: dbData, error: dbError } = await supabase
            .from('media_library')
            .insert([{
                name: file.name,
                alt_text: file.name.split('.')[0],
                file_type: file.type,
                file_size: file.size,
                url: publicUrl,
                uploaded_by: userId
            }])
            .select()
            .single();

        if (dbError) throw dbError;
        return dbData;
    },

    async deleteMedia(id: string, url: string) {
        // Extract filename from URL
        const fileName = url.split('/').pop();
        if (fileName) {
            await supabase.storage.from('media').remove([fileName]);
        }
        const { error } = await supabase.from('media_library').delete().eq('id', id);
        if (error) throw error;
    },

    // === AUTH & PROFILES ===
    async getProfiles(): Promise<Profile[]> {
        // Need to hit the profiles table. We don't have email in profiles by default unless we join auth.users via a secure RPC
        // But for now, we just get the profiles
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async updateProfileRole(userId: string, role: string) {
        const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
        if (error) throw error;
    },

    async isAdmin(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return false;

        // Use the Postgres function we created
        const { data, error } = await supabase.rpc('is_admin');
        if (error) {
            console.error("Error checking admin status:", error);
            return false;
        }
        return data; // Returns boolean
    },

    // === DASHBOARD STATS ===
    async getDashboardStats() {
        // Run concurrent counts
        const [postsRes, usersRes, mediaRes] = await Promise.all([
            supabase.from('posts').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('media_library').select('*', { count: 'exact', head: true })
        ]);

        // If posts count is 0 or errored, use local blog articles count
        const remotePostCount = postsRes.count || 0;
        const localPostCount = blogArticlesFR.length;
        const totalPosts = remotePostCount > 0 ? remotePostCount : localPostCount;

        return {
            totalPosts,
            totalUsers: usersRes.count || 0,
            totalMedia: mediaRes.count || 0
        };
    }
};
