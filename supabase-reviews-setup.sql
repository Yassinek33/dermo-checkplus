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
  approved    BOOLEAN       DEFAULT false,
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
-- Seed: reviews across all 4 languages
-- ============================================================

-- French (FR)
INSERT INTO public.reviews (author_name, rating, comment, language, approved) VALUES
  ('Sophie M.', 5, 'Très impressionnée par la précision de l''analyse. L''IA a immédiatement identifié la nature de ma lésion et m''a conseillé de consulter rapidement. Excellent outil !', 'fr', true),
  ('Marc T.',   4, 'Application très professionnelle. Le rapport PDF généré m''a permis d''avoir un vrai support visuel lors de ma consultation médicale. Je recommande.', 'fr', true),
  ('Amina K.',  5, 'En tant que maman, pouvoir vérifier une éruption cutanée à 23h sans aller aux urgences, c''est précieux. Résultat clair en 5 minutes.', 'fr', true),
  ('Julien D.', 4, 'Un grain de beauté me préoccupait depuis des semaines. L''analyse m''a orienté vers un dermatologue rapidement, et il s''est avéré bénin. Quel soulagement !', 'fr', true),
  ('Claire B.',  5, 'J''ai découvert DermatoCheck par une amie dermatologue. L''outil est fiable, rapide et gratuit. Je l''utilise régulièrement pour surveiller mes taches.', 'fr', true),
  ('Thomas R.',  4, 'Très pratique quand on habite loin d''un dermatologue. Le questionnaire est bien structuré et le rapport est complet. Bravo.', 'fr', true),
  ('Nadia S.',   5, 'Mon fils de 8 ans avait une plaque rouge sur le bras. En quelques minutes j''ai su que ce n''était pas urgent. Merci pour ce service gratuit !', 'fr', true),
  ('Pierre L.',  5, 'Interface intuitive, analyse rapide et précise. J''ai partagé le rapport avec mon médecin traitant qui a été impressionné par la qualité.', 'fr', true),
  ('Fatima E.',  4, 'Première fois que j''utilise un outil d''IA pour la santé. Le résultat m''a rassurée et m''a évité un déplacement inutile aux urgences.', 'fr', true);

-- English (EN)
INSERT INTO public.reviews (author_name, rating, comment, language, approved) VALUES
  ('Rachel W.',  5, 'I had a mole that changed colour and was terrified. DermatoCheck''s report gave me the confidence to book a dermatologist the same week.', 'en', true),
  ('David H.',   4, 'Living in a rural area, seeing a skin specialist takes months. This tool gave me a solid first assessment I could share with my GP.', 'en', true),
  ('Priya N.',   5, 'My eczema flared up badly and I didn''t know if it was serious. Got a clear, detailed report in under 5 minutes — completely free.', 'en', true),
  ('Emma L.',    5, 'Absolutely brilliant tool. Fast, accurate and multilingual. It gave me peace of mind within minutes. Highly recommend to everyone.', 'en', true),
  ('James K.',   4, 'As a nurse, I appreciate the clinical rigour behind the questionnaire. The AI analysis is surprisingly thorough for a free tool.', 'en', true),
  ('Sarah M.',   5, 'My daughter had a suspicious rash at 11pm. Instead of panicking, I used DermatoCheck and knew it wasn''t urgent. Lifesaver for parents.', 'en', true),
  ('Michael C.', 4, 'Shared my report with my dermatologist and she said the assessment was spot-on. Very impressed by the quality of this free service.', 'en', true),
  ('Aisha T.',   5, 'I''ve been monitoring a mole for months. DermatoCheck helps me track changes and decide when to see my doctor. Incredibly useful.', 'en', true),
  ('Tom B.',     5, 'Simple, fast, and reassuring. The AI picked up on details I would have missed. Great initiative from a medical team.', 'en', true);

-- Spanish (ES)
INSERT INTO public.reviews (author_name, rating, comment, language, approved) VALUES
  ('Elena G.',   5, 'Tenía un lunar que me preocupaba mucho. El informe de DermatoCheck fue tan detallado que mi dermatólogo lo usó como referencia en la consulta.', 'es', true),
  ('Andrés P.',  4, 'Conseguir cita con un dermatólogo en mi ciudad es casi imposible. Esta herramienta me dio tranquilidad mientras esperaba meses para la consulta.', 'es', true),
  ('Isabel R.',  5, 'Mi bebé tenía una erupción rara a las 11 de la noche. En 5 minutos supe que no era grave. Herramienta imprescindible para padres.', 'es', true),
  ('Carlos M.',  5, 'Increíble que una herramienta así sea gratuita. El cuestionario es muy completo y el análisis de la IA es sorprendentemente preciso.', 'es', true),
  ('Lucía F.',   4, 'Llevo meses vigilando unas manchas en la espalda. DermatoCheck me ayuda a decidir cuándo ir al médico. Muy recomendable.', 'es', true),
  ('Miguel A.',  5, 'Vivo en zona rural sin acceso fácil a un dermatólogo. Esta aplicación me dio una primera evaluación profesional en minutos. Excelente.', 'es', true),
  ('Ana V.',     4, 'Como enfermera, valoro mucho la rigurosidad clínica del cuestionario. Los resultados son coherentes y bien explicados.', 'es', true),
  ('Roberto S.', 5, 'Mi madre tenía miedo de un lunar que le cambió de color. Le hice el análisis y pudimos actuar rápido. Gracias DermatoCheck.', 'es', true),
  ('Carmen D.',  5, 'Interfaz muy intuitiva, disponible en español y resultados inmediatos. Compartí el informe con mi médico y quedó impresionado.', 'es', true);

-- Dutch (NL)
INSERT INTO public.reviews (author_name, rating, comment, language, approved) VALUES
  ('Lotte V.',   5, 'Een moedervlek op mijn rug veranderde van kleur. DermatoCheck gaf me binnen minuten een duidelijk rapport, waardoor ik meteen een afspraak maakte bij de dermatoloog.', 'nl', true),
  ('Pieter J.',  4, 'Als zelfstandige heb ik geen tijd om wekenlang op een afspraak te wachten. Deze tool gaf me direct een betrouwbare eerste beoordeling.', 'nl', true),
  ('Femke D.',   5, 'Mijn dochtertje had plots rode vlekjes. Om 22u kon ik snel checken of het ernstig was. Geruststelling in 5 minuten, helemaal gratis.', 'nl', true),
  ('Willem K.',  5, 'Indrukwekkend hoe nauwkeurig de AI-analyse is. Ik heb het rapport gedeeld met mijn huisarts en die was onder de indruk. Aanrader!', 'nl', true),
  ('Sofie B.',   4, 'Ik had al maanden last van een rode plek die niet wegging. DermatoCheck adviseerde me om naar een dermatoloog te gaan. Bleek eczeem te zijn.', 'nl', true),
  ('Jan M.',     5, 'Als verpleegkundige waardeer ik de klinische aanpak van de vragenlijst. De resultaten zijn genuanceerd en goed onderbouwd.', 'nl', true),
  ('Emma H.',    4, 'Heel handig dat het ook in het Nederlands beschikbaar is. De analyse was snel en het rapport was duidelijk en professioneel.', 'nl', true),
  ('Bart T.',    5, 'Mijn moeder had schrik van een donkere vlek op haar arm. In 5 minuten hadden we een duidelijk rapport. Fantastische gratis service.', 'nl', true),
  ('Lisa R.',    5, 'Eenvoudig te gebruiken, snelle resultaten en volledig gratis. Ik gebruik het nu regelmatig om mijn moedervlekken in de gaten te houden.', 'nl', true);
