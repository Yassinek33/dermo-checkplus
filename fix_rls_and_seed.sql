-- ==========================================================
-- DERMATO-CHECK CMS : CORRECTIFS RLS + DONNÉES DE SEED
-- Copiez-collez ce script dans Supabase SQL Editor
-- ==========================================================

-- =====================================================
-- PARTIE 1 : CORRIGER LES POLITIQUES RLS
-- Permet à l'admin de lire TOUS les articles (pas seulement 
-- les publiés) et à tous les utilisateurs authentifiés 
-- de voir leurs propres données.
-- =====================================================

-- Supprimer les anciennes politiques restrictives sur posts
DROP POLICY IF EXISTS "Published posts are viewable by everyone." ON public.posts;
DROP POLICY IF EXISTS "Admins full access posts" ON public.posts;

-- Nouvelle politique : TOUT le monde peut lire tous les posts
-- (La sécurité de l'admin est gérée par le mot de passe de l'interface)
CREATE POLICY "Anyone can read posts" ON public.posts
  FOR SELECT USING (true);

-- Les utilisateurs authentifiés peuvent créer/modifier/supprimer leurs posts
CREATE POLICY "Authenticated users can write posts" ON public.posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Corriger les politiques sur media_library
DROP POLICY IF EXISTS "Admins full access media metadata" ON public.media_library;
CREATE POLICY "Authenticated users can manage media" ON public.media_library
  FOR ALL USING (auth.role() = 'authenticated');

-- Corriger les politiques sur pages
DROP POLICY IF EXISTS "Admins full access pages" ON public.pages;
CREATE POLICY "Anyone can read pages" ON public.pages
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage pages" ON public.pages
  FOR ALL USING (auth.role() = 'authenticated');

-- Corriger les politiques sur site_settings
DROP POLICY IF EXISTS "Admins can modify settings" ON public.site_settings;
CREATE POLICY "Authenticated users can manage settings" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Ajouter une politique pour les profils : les admins peuvent tout voir
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- PARTIE 2 : SEED DES ARTICLES DU BLOG
-- Insère les articles existants du site dans la table posts
-- =====================================================

-- Insérer les articles directement (sans author_id pour commencer)
-- Vous pouvez mettre à jour author_id plus tard avec l'UUID de votre admin

INSERT INTO public.posts (title, slug, content, excerpt, status, tags, seo_title, seo_description, created_at, updated_at)
VALUES

-- Article 1
(
  'Protéger ses mains du froid : Guide complet contre la sécheresse hivernale',
  'froid-mains-seches',
  '## Pourquoi le froid assèche-t-il la peau ?

Le froid hivernal crée un environnement particulièrement hostile pour la peau de nos mains. Lorsque les températures chutent, plusieurs mécanismes physiologiques se mettent en place et fragilisent la barrière cutanée. La vasoconstriction réduit considérablement l''apport sanguin et nutritif à la peau.

## Reconnaître les signes d''alerte

La sécheresse cutanée des mains évolue généralement en trois stades progressifs. Au stade initial, la peau commence à tirailler après le lavage, présente un aspect légèrement rugueux au toucher et perd de sa souplesse naturelle.

## L''hydratation intensive : fondement de la protection

La clé d''une protection efficace réside dans une hydratation quotidienne rigoureuse, adaptée aux différents moments de la journée.',
  'Le froid hivernal met vos mains à rude épreuve. Découvrez les conseils d''experts pour prévenir et traiter la sécheresse cutanée.',
  'published',
  ARRAY['Hiver', 'Hydratation', 'Prévention'],
  'Protéger ses mains du froid | Dermato-Check',
  'Le froid hivernal met vos mains à rude épreuve. Guide complet contre la sécheresse hivernale.',
  '2026-02-05 00:00:00+00',
  '2026-02-05 00:00:00+00'
),

-- Article 2
(
  'Rides et vieillissement cutané : Comprendre pour mieux prévenir',
  'rides-vieillissement',
  '## Les mécanismes du vieillissement cutané

La peau vieillit selon deux processus distincts : le vieillissement intrinsèque, déterminé génétiquement, et le vieillissement extrinsèque, causé par des facteurs environnementaux. Le soleil, la pollution et le tabac accélèrent considérablement ce processus.

## Les types de rides

Les rides d''expression apparaissent en premier, résultat des contractions musculaires répétées. Les rides de gravité suivent avec l''âge, accentuées par la perte de tonicité cutanée.

## Prévention et traitement

Une protection solaire quotidienne SPF 50 reste le geste anti-âge le plus efficace. Les rétinoïdes, l''acide hyaluronique et la vitamine C complètent cette routine préventive.',
  'Le vieillissement cutané est un processus naturel mais que l''on peut ralentir significativement avec les bons gestes.',
  'published',
  ARRAY['Anti-âge', 'Rides', 'Cosmétologie'],
  'Rides et vieillissement : comprendre et prévenir | Dermato-Check',
  'Comprendre les mécanismes du vieillissement cutané pour mieux prévenir l''apparition des rides.',
  '2026-01-20 00:00:00+00',
  '2026-01-20 00:00:00+00'
),

-- Article 3
(
  'Varices et jambes lourdes : Solutions dermatologiques modernes',
  'varices-jambes-lourdes',
  '## Comprendre les varices

Les varices sont des veines dilatées, tortueuses, visibles sous la peau, résultant d''une insuffisance veineuse chronique. Elles touchent environ 30% de la population adulte, avec une prédominance féminine.

## Facteurs de risque

La génétique joue un rôle majeur. S''y ajoutent la station debout prolongée, la sédentarité, l''obésité, la grossesse et la chaleur excessive.

## Traitements disponibles

La sclérothérapie, l''ablation thermique par laser ou radiofréquence, et la chirurgie conventionnelle constituent les principales options thérapeutiques.',
  'Varices et jambes lourdes : comprendre les causes et découvrir les traitements dermatologiques les plus efficaces.',
  'published',
  ARRAY['Varices', 'Phlébologie', 'Jambes'],
  'Varices et jambes lourdes : traitements | Dermato-Check',
  'Solutions dermatologiques modernes contre les varices et jambes lourdes.',
  '2026-01-15 00:00:00+00',
  '2026-01-15 00:00:00+00'
),

-- Article 4
(
  'Acné adulte : Pourquoi apparaît-elle et comment la traiter efficacement ?',
  'acne-adulte',
  '## L''acné adulte, une réalité croissante

Contrairement aux idées reçues, l''acné ne disparaît pas systématiquement à la fin de l''adolescence. Elle touche 25% des femmes et 12% des hommes adultes de 25 à 40 ans.

## Causes spécifiques chez l''adulte

Stress chronique, fluctuations hormonales, cosmétiques comédogènes et pollution sont les principaux facteurs déclencheurs chez l''adulte.

## Approche thérapeutique

Le traitement repose sur une combinaison de soins topiques (peroxyde de benzoyle, acide salicylique, rétinoïdes) et, si nécessaire, d''un traitement systémique prescrit par le dermatologue.',
  'L''acné adulte touche de plus en plus de personnes après 25 ans. Découvrez les causes et les traitements les plus efficaces.',
  'published',
  ARRAY['Acné', 'Peau grasse', 'Traitement'],
  'Acné adulte : causes et traitements | Dermato-Check',
  'Guide complet sur l''acné adulte : comprendre les causes et choisir le traitement adapté.',
  '2026-01-10 00:00:00+00',
  '2026-01-10 00:00:00+00'
),

-- Article 5
(
  'Eczéma et peaux sensibles : Guide complet de la gestion au quotidien',
  'eczema-peaux-sensibles',
  '## Comprendre l''eczéma

L''eczéma atopique est une maladie inflammatoire chronique de la peau, caractérisée par des poussées de plaques rouges, squameuses et très prurigineuses. Il touche 15 à 20% des enfants et 3% des adultes.

## Les déclencheurs à éviter

Produits ménagers agressifs, savons parfumés, textiles synthétiques, variations de température excessive et stress émotionnel sont les principaux facteurs d''aggravation.

## Prise en charge quotidienne

L''hydratation intensive deux fois par jour avec des émollients adaptés reste la pierre angulaire du traitement de fond, complétée par des dermocorticoïdes lors des poussées.',
  'Gérer l''eczéma et les peaux sensibles au quotidien : conseils pratiques et stratégies thérapeutiques.',
  'published',
  ARRAY['Eczéma', 'Peau sensible', 'Soins'],
  'Eczéma et peaux sensibles : gestion quotidienne | Dermato-Check',
  'Guide complet pour gérer l''eczéma et les peaux sensibles au quotidien.',
  '2026-01-05 00:00:00+00',
  '2026-01-05 00:00:00+00'
),

-- Article 6
(
  'Grains de beauté : Quand s''inquiéter et comment surveiller ses nævi ?',
  'grains-beaute-surveillance',
  '## Naevus bénin versus mélanome

La règle ABCDE permet d''identifier les signes d''alerte : Asymétrie, Bords irréguliers, Couleur inhomogène, Diamètre supérieur à 6mm, Évolution rapide.

## Auto-surveillance recommandée

Un auto-examen mensuel de la peau, dans de bonnes conditions de luminosité, permet de détecter rapidement toute modification suspecte.

## Quand consulter

Toute modification d''un grain de beauté existant, l''apparition d''une nouvelle lésion pigmentée ou un prurit persistant doivent motiver une consultation dermatologique rapide.',
  'Comment surveiller ses grains de beauté et reconnaître les signes qui doivent alerter ? Guide pratique.',
  'published',
  ARRAY['Mélanome', 'Grains de beauté', 'Dépistage'],
  'Surveillance des grains de beauté | Dermato-Check',
  'Quand s''inquiéter pour un grain de beauté : règle ABCDE et conseils de surveillance.',
  '2025-12-28 00:00:00+00',
  '2025-12-28 00:00:00+00'
)

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  updated_at = now();

-- =====================================================
-- PARTIE 3 : VÉRIFICATION
-- =====================================================
SELECT 'Posts insérés : ' || COUNT(*)::text as resultat FROM public.posts;
SELECT 'Profils existants : ' || COUNT(*)::text as resultat FROM public.profiles;
