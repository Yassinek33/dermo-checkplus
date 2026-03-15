-- ============================================================
-- DermatoCheck — Table "blog_comments" (commentaires articles)
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug  TEXT          NOT NULL,
  user_id       UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name   TEXT          NOT NULL CHECK (char_length(author_name) BETWEEN 2 AND 50),
  content       TEXT          NOT NULL CHECK (char_length(content) BETWEEN 10 AND 1000),
  language      TEXT          DEFAULT 'fr' CHECK (language IN ('fr', 'nl', 'en', 'es')),
  approved      BOOLEAN       DEFAULT false,
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- Index for fast approved comments lookup per article
CREATE INDEX IF NOT EXISTS blog_comments_article_approved_idx
  ON public.blog_comments (article_slug, approved, created_at DESC);

-- Index for admin panel: list pending comments
CREATE INDEX IF NOT EXISTS blog_comments_pending_idx
  ON public.blog_comments (approved, created_at DESC)
  WHERE approved = false;

-- Enable Row Level Security
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read approved comments
CREATE POLICY "Public can read approved comments"
  ON public.blog_comments FOR SELECT
  USING (approved = true);

-- Policy: authenticated users can insert their own comment (max 1 per article per 60s via app logic)
CREATE POLICY "Auth users can insert comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- Policy: admins can manage all comments (approve, delete, etc.)
CREATE POLICY "Admins can manage comments"
  ON public.blog_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
