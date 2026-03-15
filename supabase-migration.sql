-- ══════════════════════════════════════════════════════════════════════
-- DermatoCheck — SEO Platform Integration Migration
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ══════════════════════════════════════════════════════════════════════

-- ─── 1. CATEGORIES TABLE ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed existing categories
INSERT INTO categories (name, slug, language, sort_order) VALUES
  ('Soins de la peau', 'skincare', 'fr', 1),
  ('Conditions cutanées', 'conditions', 'fr', 2),
  ('Prévention', 'prevention', 'fr', 3)
ON CONFLICT (slug) DO NOTHING;

-- RLS: public read, authenticated insert/update
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Categories are viewable by everyone'
  ) THEN
    CREATE POLICY "Categories are viewable by everyone"
      ON categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Categories insertable by authenticated'
  ) THEN
    CREATE POLICY "Categories insertable by authenticated"
      ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Categories updatable by authenticated'
  ) THEN
    CREATE POLICY "Categories updatable by authenticated"
      ON categories FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ─── 2. ENRICH POSTS TABLE ─────────────────────────────────────────

ALTER TABLE posts ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS secondary_keywords TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'article';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS read_time INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Index for fast lookups by language and source
CREATE INDEX IF NOT EXISTS idx_posts_language ON posts(language);
CREATE INDEX IF NOT EXISTS idx_posts_source ON posts(source);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);

-- ══════════════════════════════════════════════════════════════════════
-- DONE — Verify with:
--   SELECT * FROM categories;
--   SELECT column_name FROM information_schema.columns WHERE table_name = 'posts';
-- ══════════════════════════════════════════════════════════════════════
