-- ==========================================
-- SCRIPT DE CONFIGURATION : DERMATO-CHECK CMS
-- ==========================================

-- 1. CRÉATION TÂCHE POUR LES UUID & ROLES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Créer la table des profils si elle n'existe pas (pour lier avec Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'dermatologist', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sécurité (RLS) sur les profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Fonction utilitaire pour vérifier si l'utilisateur connecté est un Admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- 2. PARAMÈTRES DU SITE (Couleurs, SEO, Cache)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone." ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can modify settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- Insérer les paramètres par défaut
INSERT INTO public.site_settings (key, value) VALUES 
('theme', '{"primaryColor": "#059669"}'),
('seo', '{"title": "SkinCheck | Dermatologue virtuel professionnel", "description": "Obtenez une évaluation rapide et sécurisée", "keywords": "dermatologie, analyse peau, acne, telemedecine"}'),
('maintenance', '{"enabled": false}')
ON CONFLICT (key) DO NOTHING;


-- 3. ARTICLES DU BLOG (Posts)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_id UUID REFERENCES public.profiles(id),
    seo_title TEXT,
    seo_description TEXT,
    featured_image_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are viewable by everyone." ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins full access posts" ON public.posts FOR ALL USING (public.is_admin());


-- 4. PAGES STATIQUES
CREATE TABLE IF NOT EXISTS public.pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    content JSONB,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published pages viewable by everyone." ON public.pages FOR SELECT USING (status = 'published');
CREATE POLICY "Admins full access pages" ON public.pages FOR ALL USING (public.is_admin());

-- Insérer les pages par défaut
INSERT INTO public.pages (id, title, path, content) VALUES
('home', 'Accueil', '/', '[]'),
('about', 'À propos de nous', '/about', '[]'),
('legal', 'Mentions Légales', '/legal', '[]'),
('faq', 'Foire Aux Questions', '/faq', '[]')
ON CONFLICT (id) DO NOTHING;


-- 5. MÉDIATHÈQUE (fichiers images/vidéos)
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    alt_text TEXT,
    file_type TEXT,
    file_size INTEGER,
    url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media is viewable by everyone." ON public.media_library FOR SELECT USING (true);
CREATE POLICY "Admins full access media metadata" ON public.media_library FOR ALL USING (public.is_admin());


-- 6. STOCKAGE PHYSIQUE (Storage Bucket)
-- Tente de créer le dossier "media" public pour le stockage d'images
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Storage" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin Insert Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admin Update Storage" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admin Delete Storage" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.is_admin());
