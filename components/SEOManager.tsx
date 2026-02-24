import { useEffect } from 'react';

const seoData: Record<string, { title: string; description: string }> = {
    'home': {
        title: 'DermatoCheck — Analyse Dermatologique par IA | Diagnostic Cutané Gratuit',
        description: 'Analysez votre lésion cutanée par IA en 5 minutes. Questionnaire clinique en 15 étapes + analyse photo = rapport médical personnalisé. Diagnostic dermatologique en ligne, gratuit, sécurisé. RGPD conforme. Disponible en FR, NL, EN, ES.'
    },
    'questionnaire': {
        title: 'Analyse Dermatologique Gratuite par IA — DermatoCheck',
        description: 'Démarrez votre analyse cutanée gratuite. Photo + 15 questions cliniques : âge, sexe, antécédents, symptômes, évolution. Rapport personnalisé en moins de 5 minutes. Sans rendez-vous, sans ordonnance.'
    },
    'find-dermatologist': {
        title: 'Trouver un Dermatologue Près de Chez Vous | DermatoCheck',
        description: 'Trouvez un dermatologue qualifié près de chez vous. Annuaire dermatologues Belgique, France, Pays-Bas. Prise de rendez-vous rapide. Complétez votre analyse IA avec une consultation professionnelle.'
    },
    'blog': {
        title: 'Blog Dermatologie — Conseils Peau & Maladies Cutanées | DermatoCheck',
        description: 'Guides dermatologiques, conseils peau, maladies cutanées expliquées. Eczéma, psoriasis, mélanome, acné, taches, lésions. Rédigé avec expertise médicale. Disponible en 4 langues.'
    },
    'about': {
        title: 'À Propos de DermatoCheck — IA Médicale & Dermatologie en Ligne',
        description: 'DermatoCheck est une plateforme d\'analyse dermatologique par intelligence artificielle. Notre mission : rendre le diagnostic cutané accessible, rapide et sécurisé pour tous, partout dans le monde.'
    },
    'faq': {
        title: 'FAQ — Questions Fréquentes sur DermatoCheck | Analyse Peau par IA',
        description: 'Toutes vos questions sur DermatoCheck : comment fonctionne l\'analyse IA, est-ce un diagnostic médical, confidentialité des données, langues disponibles, maladies détectées. Réponses claires et transparentes.'
    },
    'contact': {
        title: 'Contact DermatoCheck — Support & Assistance',
        description: 'Contactez l\'équipe DermatoCheck pour toute question sur votre analyse dermatologique, vos données personnelles ou un partenariat médical. Réponse sous 24h.'
    },
    'legal': {
        title: 'Mentions Légales & Politique de Confidentialité | DermatoCheck',
        description: 'Mentions légales, conditions d\'utilisation et politique de confidentialité de DermatoCheck. Conformité RGPD, protection des données médicales, droits des utilisateurs.'
    },
    'privacy-policy': {
        title: 'Mentions Légales & Politique de Confidentialité | DermatoCheck',
        description: 'Mentions légales, conditions d\'utilisation et politique de confidentialité de DermatoCheck. Conformité RGPD, protection des données médicales, droits des utilisateurs.'
    },
    'terms-of-use': {
        title: 'Mentions Légales & Politique de Confidentialité | DermatoCheck',
        description: 'Mentions légales, conditions d\'utilisation et politique de confidentialité de DermatoCheck. Conformité RGPD, protection des données médicales, droits des utilisateurs.'
    }
};

interface SEOManagerProps {
    currentPageId: string;
}

export const SEOManager = ({ currentPageId }: SEOManagerProps) => {
    useEffect(() => {
        let currentSeo = seoData[currentPageId];

        // If not found, use Home as a fallback base
        if (!currentSeo) {
            currentSeo = seoData['home'];
        }

        // Update document title
        document.title = currentSeo.title;

        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', currentSeo.description);
        } else {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            metaDesc.setAttribute('content', currentSeo.description);
            document.head.appendChild(metaDesc);
        }
    }, [currentPageId]);

    return null;
};
