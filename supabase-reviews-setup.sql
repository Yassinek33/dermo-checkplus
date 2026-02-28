-- ============================================================
-- DermatoCheck — Table "reviews" (avis utilisateurs)
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT          NOT NULL,
  rating      INTEGER       NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  language    TEXT          DEFAULT 'fr' CHECK (language IN ('fr', 'nl', 'en', 'es')),
  approved    BOOLEAN       DEFAULT true,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Index for fast approved reviews lookup
CREATE INDEX IF NOT EXISTS reviews_approved_created_idx
  ON public.reviews (approved, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read approved reviews
CREATE POLICY "Public can read approved reviews"
  ON public.reviews FOR SELECT
  USING (approved = true);

-- Policy: authenticated users can insert their own review
CREATE POLICY "Auth users can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Policy: admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- Seed: 3 example reviews to start with content
-- ============================================================
INSERT INTO public.reviews (author_name, rating, comment, language, approved) VALUES
  ('Sophie M.', 5, 'Très impressionnée par la précision de l''analyse. L''IA a immédiatement identifié la nature de ma lésion et m''a conseillé de consulter rapidement. Excellent outil !', 'fr', true),
  ('Marc T.',   4, 'Application très professionnelle. Le rapport PDF généré m''a permis d''avoir un vrai support visuel lors de ma consultation médicale. Je recommande.', 'fr', true),
  ('Emma L.',   5, 'Absolutely brilliant tool. Fast, accurate and multilingual. It gave me peace of mind within minutes. Highly recommend to everyone.', 'en', true);
