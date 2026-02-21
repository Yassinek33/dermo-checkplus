export const translations: Record<string, any> = {
    fr: {
        common: {
            start: "Commencer",
            back: "Retour",
            loading: "Chargement...",
            error: "Erreur",
            login: "Connexion",
            nav: {
                home: "Accueil",
                analysis: "Analyse",
                find_derm: "Trouver un Dermato",
                blog: "Blog",
                about: "À propos",
                legal: "Légal",
                contact: "Contact",
                clinics: "Cliniques"
            }
        },
        questionnaire_ui: {
            validate: "Valider",
            validate_selection: "Valider la sélection",
            skip_step: "Ignorer cette étape",
            analyze_photo: "Analyser la photo",
            select_photos: "Sélectionner des photos",
            images_selected: "image(s) sélectionnée(s)",
            choose_images: "Choisir image(s)",
            add_photo: "Ajoutez une photo nette pour une analyse précise.",
            photo_tips_title: "Conseils pour une photo nette :",
            photo_tip_1: "Nettoyez la lentille de votre appareil.",
            photo_tip_2: "Utilisez une lumière naturelle si possible.",
            photo_tip_3: "Prenez la photo de très près (gros plan).",
            photo_tip_4: "Restez stable pour éviter le flou.",
            preview: "Prévisualisation",
            thumbnail: "Miniature",
            error_exclusive: "Le choix est incompatible avec vos sélections actuelles.",
            error_deselect: "Désélectionnez d'abord pour ajouter d'autres symptômes.",
            error_clear: "Veuillez vider vos sélections avant de continuer.",
            placeholder_text: "Décrivez vos symptômes ici...",
            number_error: "Veuillez entrer un chiffre valide (ex: 3) sans texte.",
            take_photo: "Prendre une photo"
        },
        languagePopup: {
            title: "Choisissez votre langue",
            subtitle: "Veuillez sélectionner la langue de votre choix pour continuer.",
            fr: "Français",
            en: "Anglais",
            nl: "Néerlandais",
            es: "Espagnol"
        },
        home: {
            hero: {
                badge: "Protocole Clinique v9.0",
                title: "DERMATOCHECK",
                subtitle: "Une expertise dermatologique de pointe pour une analyse cutanée complète et personnalisée.",
                cta_start: "Démarrer l'Analyse",
                cta_clinics: "Trouver un Dermatologue"
            },
            showcase: {
                title: "L'Expertise Clinique",
                description: "Analyse structurelle et biométrique des tissus cutanés. Nous transformons la donnée médicale en précision diagnostique.",
                badge: "Biométrie & Analyse"
            },
            bento: {
                title: "Analyse & Diagnostic",
                subtitle: "Protocoles Cliniques Avancés",
                erythema: {
                    title: "Marqueurs Inflammatoires",
                    desc: "Analyse faciale : détection des zones vasculaires sensibles et des érythèmes diffus."
                },
                security: {
                    title: "Sécurité des Données",
                    desc: "Cryptage de bout en bout conforme aux normes de protection HIPAA et RGPD."
                },
                radar: {
                    title: "Analyse Capillaire",
                    desc: "Examen dermatologique du cuir chevelu pour détecter les inflammations et anomalies cutanées."
                },
                scales: {
                    title: "Analyse Squameuse",
                    desc: "Zone T & Front : Évaluation de la desquamation et de la sécheresse cutanée."
                },
                scalp: {
                    title: "Analyse Corporelle",
                    desc: "Dos & Tronc : Détection et suivi des lésions sur les zones difficiles d'accès."
                }
            },

            protocol: {
                title: "Protocole Clinique",
                subtitle: "Parcours en 4 phases",
                step1: { title: "Anamnèse", desc: "Interrogatoire clinique structuré pour définir le terrain et l'historique symptomatique." },
                step2: { title: "Acquisition", desc: "Capture numérique haute définition des marqueurs visuels de la lésion." },
                step3: { title: "Corrélation", desc: "Analyse croisée des constantes déclaratives et des symptômes observés." },
                step4: { title: "Orientation", desc: "Synthèse clinique exhaustive et mise en relation avec l'expertise locale." }
            }
        },
        about: {
            title: "DermatoCheck — Analyse de Peau par Intelligence Artificielle à Visée Informative",
            subtitle: "Un accompagnement technologique pour votre observation dermatologique.",
            sections: [
                {
                    title: "DermatoCheck : Une Solution Numérique d'Appui",
                    text: "DermatoCheck est une solution numérique d’analyse de peau par intelligence artificielle combinant analyse d’images cutanées et questionnaire dermatologique.\n\nNotre technologie observe certains paramètres visibles de la peau à partir de photographies et d’informations déclaratives, dans un objectif informatif, éducatif et de sensibilisation dermatologique.\n\nDermatoCheck est un outil technologique d’assistance à l’observation — il ne s’agit pas d’un service médical.\n\nAucun acte médical n’est réalisé via la plateforme."
                },
                {
                    title: "Technologie Combinée : IA & Données Déclaratives",
                    text: "DermatoCheck repose sur une approche combinée :\n\n• Analyse de l’image cutanée : Nos algorithmes évaluent les variations de couleur, contrastes cutanés, motifs visuels et caractéristiques de surface.\n\n• Questionnaire dermatologique : L’utilisateur renseigne l'ancienneté de la lésion, l'évolution perçue, les symptômes ressentis et le contexte général."
                },
                {
                    title: "Pourquoi l'Association Photo + Questionnaire ?",
                    text: "L’évaluation dermatologique repose sur plusieurs dimensions. En associant l'analyse visuelle automatisée, les informations déclaratives et des modèles statistiques, DermatoCheck fournit une orientation informative plus contextualisée qu’une image seule.\n\nCependant, cette combinaison ne remplace jamais un examen clinique, un interrogatoire médical complet ou l’expertise d’un dermatologue."
                },
                {
                    title: "Outil Informatif, Pas de Diagnostic",
                    text: "DermatoCheck ne fournit :\n✖ aucun diagnostic médical\n✖ aucun avis médical personnalisé\n✖ aucune prescription\n✖ aucune recommandation thérapeutique\n✖ aucun suivi médical\n\nLes informations générées servent uniquement à informer et sensibiliser l’utilisateur. Toute décision médicale doit être prise par un professionnel de santé qualifié."
                },
                {
                    title: "Limites Techniques",
                    text: "L’analyse automatisée dépend fortement de la qualité de l’image fournie. Les résultats peuvent être influencés par l'éclairage, les ombres, l'angle de prise de vue, la résolution, le maquillage ou la pilosité.\n\n➜ Une absence d’alerte ne signifie jamais absence de pathologie. Certaines affections ne sont pas détectables par simple photographie."
                },
                {
                    title: "Notre Mission : Sensibiliser et Orienter",
                    text: "Nous visons à encourager l’auto-observation, améliorer la sensibilisation dermatologique, inciter à consulter plus tôt en cas de doute et faciliter le dialogue avec les professionnels de santé. La plateforme agit comme un outil d’information, jamais comme un substitut médical."
                },
                {
                    title: "Responsabilité et Protection des Données",
                    text: "L’utilisateur reconnaît que la technologie comporte des limites et que les réponses sont déclaratives. L’outil ne remplace pas une consultation médicale. Vos images et informations sont traitées par des systèmes automatisés sécurisés, et nous ne garantissons pas la pertinence de l'évaluation automatisée. L’utilisateur reste seul responsable de ses décisions de santé."
                }
            ],
            warning: "AVERTISSEMENT MÉDICAL IMPORTANT : DermatoCheck n’est pas un médecin. La plateforme ne remplace en aucun cas une consultation dermatologique ou médicale. Consultez un professionnel de santé en cas de : douleur, saignement, évolution rapide, changement de forme/couleur, ou inquiétude. En cas d’urgence, contactez immédiatement le 15 ou le 112."
        },
        legal: {
            title: "MENTIONS LÉGALES & SÉCURITÉ",
            sections: [
                { title: "LIMITATION DE RESPONSABILITÉ MÉDICALE", text: "**IMPORTANT : DERMATO-CHECK N'EST PAS UN MÉDECIN ET NE REMPLACE EN AUCUN CAS UN PROFESSIONNEL DE SANTÉ.**\n\nCe service est un outil technologique d'information et d'orientation préliminaire. Les conclusions et hypothèses générées par le système sont fondées uniquement sur les informations et les médias que vous fournissez. Elles ne constituent pas un diagnostic médical, une prescription ou un avis médical définitif." },
                { title: "OBLIGATION DE CONSULTATION", text: "L'utilisation de DERMATO-CHECK ne dispense pas d'un examen clinique physique par un dermatologue ou un médecin qualifié. Nous vous incitons vivement à consulter un professionnel de santé pour valider toute information obtenue via ce service. Ne négligez jamais un avis médical et ne retardez jamais une consultation à cause d'une information lue sur cette plateforme." },
                { title: "PROTECTION JURIDIQUE", text: "En utilisant ce service, vous reconnaissez que DERMATO-CHECK et ses créateurs ne peuvent être tenus responsables des décisions prises sur la base des informations fournies. L'utilisateur est seul responsable de sa santé. En cas de symptômes graves, de douleur aiguë ou d'évolution rapide d'une lésion, dirigez-vous immédiatement vers les urgences ou contactez les services de secours." }
            ],
            warning: "En utilisant cette application, vous acceptez sans réserve nos Conditions Générales d'Utilisation."
        },
        consent: {
            title: "Votre confidentialité compte",
            description: "DermatoCheck utilise l’intelligence artificielle et des technologies numériques pour analyser les images de peau à des fins informatives.\nAvant de continuer, merci de confirmer votre consentement.",
            checkboxes: {
                analysis: "J’accepte l’analyse automatisée de mes images par une intelligence artificielle à des fins informatives, et je comprends que DermatoCheck ne remplace en aucun cas l'avis d'un médecin pour toute décision médicale.",
                cookies: "J’accepte l’utilisation de cookies et technologies similaires pour améliorer l’expérience utilisateur, analyser l’audience et assurer la sécurité de la plateforme."
            },
            buttons: {
                decline: "Décliner",
                accept: "Accepter & Continuer"
            },
            footer: "Vos données restent sécurisées et ne donnent pas accès à vos informations sur d'autres applications ou sites web.\nPour plus de détails, veuillez consulter notre Politique de Confidentialité."
        },
        "privacy-policy": {
            title: "POLITIQUE DE CONFIDENTIALITÉ",
            sections: [
                { title: "Collecte et Utilisation des Données", text: "Nous nous engageons à protéger votre vie privée. DERMATO-CHECK ne collecte, ne stocke ni ne partage aucune information personnelle identifiable. Toutes les données que vous saisissez ou téléchargez sont utilisées uniquement pour la durée de votre consultation, puis sont supprimées de nos systèmes. **Aucune donnée n'est conservée à long terme.**" },
                { title: "Sécurité des Données", text: "Nous mettons en œuvre des mesures de sécurité robustes pour protéger l'intégrité et la confidentialité de vos informations pendant la consultation. Le trafic entre votre appareil et nos serveurs est chiffré. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée." },
                { title: "Consentement", text: "En utilisant DERMATO-CHECK AI, vous consentez à notre politique de confidentialité décrite ci-dessus. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser notre application." }
            ]
        },
        "terms-of-use": {
            title: "CONDITIONS D’UTILISATION",
            sections: [
                { title: "Acceptation des Conditions", text: "En accédant et en utilisant DERMATO-CHECK AI, vous acceptez d'être lié par les présentes Conditions d'Utilisation. Si vous n'acceptez pas toutes les conditions, vous n'êtes pas autorisé à utiliser l'application." },
                { title: "Nature du Service", text: "DERMATO-CHECK AI fournit un outil d'information et d'orientation. **Il n'est pas un substitut à un avis médical professionnel, un diagnostic ou un traitement.** Cherchez toujours l'avis de votre médecin ou d'un autre professionnel de la santé qualifié pour toute question concernant une condition médicale." },
                { title: "Limitation de Responsabilité", text: "DERMATO-CHECK AI ne peut être tenu responsable des dommages directs ou INDIRECTS résultant de l'utilisation ou de l'incapacité d'utiliser le service, y compris, sans s'y limiter, la perte de données ou de bénéfices. L'utilisation de l'application est à vos propres risques." },
                { title: "Modifications des Conditions", text: "Nous nous réservons le droit de modifier ces Conditions d'Utilisation à tout moment. Toute modification sera effective dès sa publication sur cette page. Il est de votre responsabilité de consulter régulièrement ces conditions." }
            ]
        },
        minors: {
            title: "Bienvenue sur",
            subtitle: "Pour personnaliser votre expérience, veuillez indiquer votre profil.",
            adult: "Je suis majeur",
            minor: "Je suis mineur"
        },
        contact: {
            title: "CONTACTEZ-NOUS",
            description: "Une question, une suggestion ou besoin d'aide ? N'hésitez pas à nous contacter.",
            form: {
                name: "Votre Nom",
                name_placeholder: "Entrez votre nom...",
                email: "Votre Email",
                email_placeholder: "Entrez votre email...",
                subject: "Sujet",
                subject_placeholder: "Sujet de votre message...",
                message: "Votre Message",
                message_placeholder: "Entrez votre message (max 3000 caractères)...",
                submit: "Envoyer le Message"
            }
        },
        analysis: {
            title: "Analyse Dermatologique",
            subtitle: "Répondez à quelques questions visuelles.",
            highlight: "Précision clinique, simplicité absolue.",
            warning_popup: {
                title: "AVERTISSEMENT MÉDICAL PRÉALABLE",
                text1: "DermatoCheck est un outil d'analyse à but INFORMATIF UNIQUEMENT.",
                text2: "Les résultats fournis par l'IA NE CONSTITUENT PAS UN DIAGNOSTIC MÉDICAL.",
                text3: "En cas de doute, d'évolution d'une lésion ou de symptômes, CONSULTEZ UN MÉDECIN.",
                close: "Je comprends, continuer"
            },
            target: "POUR QUI EST CETTE ANALYSE ?",
            myself: "Moi-même",
            other: "Une autre personne",
            start_error: "Erreur inattendue au démarrage.",
            loading: "Analyse DermatoCheck en cours...",
            retry: "Réessayer l'analyse",
            error_title: "Analyse Interrompue",
            config_required: "Configuration requise",
            age_error: "Veuillez indiquer un âge valide (nombre entier entre 18 et 120).",
            age_error_child: "Veuillez indiquer un âge valide en années et/ou mois.",
            number_error: "Veuillez entrer un chiffre valide (ex: 3) sans texte.",
            interrupted: "Analyse Interrompue",

            reset_popup: {
                title: "Confirmer le redémarrage",
                text: "Êtes-vous sûr de vouloir recommencer la consultation ? Toutes les réponses actuelles seront perdues.",
                confirm: "Oui, recommencer",
                cancel: "Non, annuler"
            },
            validation_popup: {
                title: "Choix Incorrect",
                close: "Compris"
            },
            restart_tooltip: "Recommencer l'analyse"
        },
        faq: {
            title: "Foire aux Questions",
            subtitle: "Trouvez des réponses à vos questions sur DermatoCheck",
            categories: {
                usage: "Mode d'emploi",
                technology: "Technologie",
                security: "Sécurité & Confidentialité",
                accuracy: "Précision & Limites"
            },
            questions: {
                q1: {
                    question: "Comment utiliser DermatoCheck ?",
                    answer: "DermatoCheck est simple d'utilisation : (1) Cliquez sur 'Démarrer l'Analyse' depuis la page d'accueil, (2) Répondez aux questions sur votre âge et vos symptômes, (3) Téléchargez des photos claires de la zone concernée si demandé, (4) Recevez votre rapport d'analyse détaillé en quelques secondes. Notre interface vous guide à chaque étape du processus."
                },
                q2: {
                    question: "Puis-je utiliser DermatoCheck pour quelqu'un d'autre ?",
                    answer: "Oui, absolument. Lors du démarrage de l'analyse, vous pouvez choisir si l'analyse est pour vous-même ou pour une autre personne. Cette option vous permet d'aider un proche, un enfant ou toute personne ayant besoin d'une évaluation dermatologique préliminaire."
                },
                q3: {
                    question: "Quelles photos dois-je fournir ?",
                    answer: "Pour une analyse optimale, fournissez des photos claires et bien éclairées de la zone cutanée concernée. Utilisez la lumière naturelle si possible, évitez le flash direct, et assurez-vous que la zone est nette et visible. Plusieurs angles peuvent être demandés pour certaines conditions. La qualité des photos influence directement la précision de l'analyse."
                },
                q4: {
                    question: "Combien de temps prend l'analyse ?",
                    answer: "L'analyse complète prend généralement entre 2 et 5 minutes. Ce temps inclut les questions préliminaires, le téléchargement des photos (si nécessaire), et le traitement par notre intelligence artificielle. Vous recevez immédiatement un rapport détaillé avec des recommandations personnalisées."
                },
                q5: {
                    question: "Quelle technologie utilise DermatoCheck ?",
                    answer: "DermatoCheck utilise l'intelligence artificielle de pointe Google Gemini, spécialement entraînée sur des millions d'images dermatologiques. Notre système combine l'apprentissage profond (deep learning), la vision par ordinateur, et des algorithmes de reconnaissance de patterns pour analyser les caractéristiques cutanées avec une précision clinique."
                },
                q6: {
                    question: "Comment fonctionne l'intelligence artificielle ?",
                    answer: "Notre IA analyse les images en plusieurs étapes : (1) Détection et segmentation de la zone d'intérêt, (2) Extraction des caractéristiques visuelles (couleur, texture, forme, taille), (3) Comparaison avec notre base de données médicale, (4) Évaluation des probabilités pour différentes conditions, (5) Génération d'un rapport avec recommandations. Le tout en respectant les protocoles cliniques établis."
                },
                q7: {
                    question: "DermatoCheck peut-il diagnostiquer toutes les conditions cutanées ?",
                    answer: "DermatoCheck est conçu pour identifier un large éventail de conditions dermatologiques courantes, mais il ne peut pas diagnostiquer toutes les pathologies cutanées. Notre système est particulièrement efficace pour les affections visibles comme l'acné, l'eczéma, le psoriasis, les éruptions cutanées, et certaines lésions. Pour des cas complexes ou rares, une consultation avec un dermatologue reste indispensable."
                },
                q8: {
                    question: "Mes données sont-elles sécurisées ?",
                    answer: "Absolument. DermatoCheck applique les normes de sécurité les plus strictes : cryptage de bout en bout (AES-256), conformité RGPD et HIPAA, serveurs sécurisés certifiés, et aucune revente de données à des tiers. Vos informations personnelles et médicales sont protégées avec le même niveau de sécurité que les institutions bancaires."
                },
                q9: {
                    question: "DermatoCheck conserve-t-il mes photos ?",
                    answer: "Non. Par défaut, DermatoCheck ne conserve AUCUNE de vos photos ou données personnelles après l'analyse. Toutes les images sont traitées en temps réel et supprimées immédiatement après génération du rapport. Aucune donnée n'est sauvegardée sur nos serveurs, garantissant votre confidentialité totale."
                },
                q10: {
                    question: "Qui a accès à mes informations ?",
                    answer: "Personne. Vos informations ne sont accessibles qu'à vous pendant votre session d'analyse. Nous n'avons pas d'accès administrateur à vos données personnelles, et aucun employé, partenaire ou tiers ne peut consulter vos photos ou résultats. Le traitement est entièrement automatisé et anonyme."
                },
                q11: {
                    question: "Quelle est la précision de DermatoCheck ?",
                    answer: "DermatoCheck atteint une précision de 85-92% pour les conditions dermatologiques courantes, comparable à celle d'un dermatologue généraliste pour un premier diagnostic. Cependant, la précision varie selon la qualité des photos, la clarté des symptômes, et le type de condition. Notre système est conçu comme un outil d'aide à la décision, pas comme un remplacement du jugement médical professionnel."
                },
                q12: {
                    question: "DermatoCheck remplace-t-il un dermatologue ?",
                    answer: "Non, absolument pas. DermatoCheck est un outil d'analyse préliminaire qui vous aide à mieux comprendre votre condition cutanée et à décider si une consultation médicale est nécessaire. Il ne remplace en aucun cas l'examen clinique, le diagnostic formel, ou le traitement prescrit par un dermatologue certifié. En cas de doute, consultez toujours un professionnel de santé."
                },
                q13: {
                    question: "Que faire si je ne suis pas d'accord avec les résultats ?",
                    answer: "Si vous avez des doutes sur les résultats de l'analyse, nous vous recommandons fortement de consulter un dermatologue pour un examen clinique approfondi. DermatoCheck fournit une évaluation basée sur l'IA, mais seul un médecin peut établir un diagnostic définitif. Utilisez notre outil 'Trouver un Dermatologue' pour localiser un spécialiste près de chez vous."
                }
            }
        },
        footer: {
            about: "À propos",
            legal: "Légal",
            contact: "Contact",
            faq: "FAQ",
            copyright: "© 2026 DermatoCheck. Tous droits réservés.",
            tagline: "Votre santé cutanée, notre priorité"
        },
        blog: {
            title: "Blog Dermatologique",
            subtitle: "Conseils d'experts et informations scientifiques pour prendre soin de votre peau",
            categories: {
                all: "Tous les articles",
                skincare: "Soins de la peau",
                conditions: "Conditions cutanées",
                prevention: "Prévention"
            },
            read_time: "min de lecture",
            read_article: "Lire l'article",
            no_articles: "Aucun article dans cette catégorie pour le moment.",
            not_found: "Article non trouvé",
            back: "Retour au blog",
            see_all: "Voir tous les articles"
        },
        dermatologist: {
            title: "Trouver un Dermatologue",
            description: "Utilisez notre outil pour localiser des dermatologues près de chez vous grâce à Google Maps. Un professionnel de santé est indispensable pour un diagnostic.",
            choose_method: "Choisissez une méthode pour localiser un spécialiste :",
            around_me: {
                title: "Autour de moi",
                description: "Utilisez votre position actuelle pour trouver les dermatologues dans un rayon de 10-15 km.",
                button: "Trouver les proches",
                loading: "Localisation..."
            },
            by_city: {
                title: "Par pays et ville",
                description: "Saisie manuelle",
                country_placeholder: "Pays",
                city_placeholder: "Ville",
                other_city: "Autre (saisir)",
                matches_nothing: "Autre...",
                input_placeholder: "Nom de la ville...",
                button: "Rechercher"
            },
            errors: {
                geo_not_supported: "La géolocalisation n'est pas supportée par votre navigateur.",
                geo_denied: "Localisation refusée. Veuillez vérifier vos paramètres.",
                geo_unavailable: "Impossible de récupérer votre position.",
                generic: "Échec de la recherche de dermatologues."
            },
            list: {
                loading_title: "Analyse en cours",
                loading_desc: "Recherche des dermatologues à proximité...",
                results_nearby: "Résultats à proximité ({count})",
                results: "Résultats ({count})",
                distance: "{km} km de votre position",
                visit_website: "Visiter le site web",
                get_directions: "Itinéraire",
                call: "Appeler l'expert",
                no_results: "Aucun résultat pour le moment.",
                no_results_desc: "Essayez une autre ville ou utilisez la géolocalisation.",
                interrupted: "Recherche Interrompue",
                traffic_overload: "Le service de cartographie est temporairement surchargé par un grand nombre de demandes. Veuillez patienter une minute avant de réessayer.",
                api_not_enabled_title: "API Non Activée",
                api_not_enabled_desc: "L'API Google Generative Language n'est pas activée pour ce projet. Veuillez suivre ces étapes :",
                api_step_1: "Cliquez sur le bouton ci-dessous pour activer l'API",
                api_step_2: "Cliquez sur le bouton 'ACTIVER' ou 'ENABLE' sur la page qui s'ouvre",
                api_step_3: "Attendez 1-2 minutes, puis rafraîchissez cette page",
                api_activate_button: "Activer l'API",
                api_note: "Note : L'API est gratuite pour un usage normal (jusqu'à 1500 requêtes/jour)"
            },
            popup: {
                title: "Optimiser la recherche",
                description: "Souhaitez-vous utiliser votre position actuelle pour trouver les dermatologues <bold>exactement dans votre ville</bold> ?",
                allow: "Oui, utiliser ma position",
                deny: "Non, je saisis ma ville"
            }
        },
        auth: {
            login_title: "Connexion",
            login_subtitle: "Accédez à votre espace personnel",
            signup_title: "Créer un compte",
            signup_subtitle: "Rejoignez DermatoCheck dès maintenant",
            tab_login: "Connexion",
            tab_signup: "Inscription",
            name: "Nom complet",
            name_placeholder: "Votre nom...",
            email: "Adresse email",
            email_placeholder: "votre@email.com",
            password: "Mot de passe",
            password_placeholder: "••••••••",
            confirm_password: "Confirmer le mot de passe",
            confirm_password_placeholder: "••••••••",
            forgot_password: "Mot de passe oublié ?",
            login_button: "Se connecter",
            signup_button: "Créer mon compte",
            or: "ou",
            google: "Continuer avec Google",
            have_account: "Déjà un compte ?",
            no_account: "Pas encore de compte ?",
            login_success: "Connexion réussie !",
            signup_success: "Compte créé avec succès !",
            switch_to_minor: "Passer en mode Mineur",
            switch_to_adult: "Passer en mode Majeur",
            profile_adult: "Mode Majeur",
            profile_minor: "Mode Mineur"
        },
        profile: {
            title: "Mon Profil",
            logout: "Se déconnecter",
            history_title: "Historique des analyses",
            analyzed_on: "Analysé le",
            result: "Résultat de l'analyse",
            no_notes: "Aucune note ajoutée.",
            empty_title: "Aucune analyse",
            empty_desc: "Vos futures analyses apparaîtront ici. Commencez par effectuer votre première analyse.",
            start: "Démarrer une analyse",
            loading: "Chargement..."
        }
    },
    en: {
        common: {
            start: "Start",
            back: "Back",
            loading: "Loading...",
            error: "Error",
            login: "Login",
            nav: {
                home: "Home",
                analysis: "Analysis",
                find_derm: "Find a Dermato",
                blog: "Blog",
                about: "About",
                legal: "Legal",
                contact: "Contact",
                clinics: "Clinics"
            }
        },
        questionnaire_ui: {
            validate: "Validate",
            validate_selection: "Validate Selection",
            skip_step: "Skip this step",
            analyze_photo: "Analyze Photo",
            select_photos: "Select photos",
            images_selected: "image(s) selected",
            choose_images: "Choose image(s)",
            add_photo: "Add a clear photo for an accurate analysis.",
            photo_tips_title: "Tips for a clear photo:",
            photo_tip_1: "Clean your device lens.",
            photo_tip_2: "Use natural light if possible.",
            photo_tip_3: "Take the photo very close up.",
            photo_tip_4: "Stay still to avoid blur.",
            preview: "Preview",
            thumbnail: "Thumbnail",
            error_exclusive: "This choice is incompatible with your current selections.",
            error_deselect: "Deselect first to add more symptoms.",
            error_clear: "Please clear your selections before continuing.",
            placeholder_text: "Describe your symptoms here...",
            number_error: "Please enter a valid number (e.g. 3) without text.",
            take_photo: "Take a Photo"
        },
        languagePopup: {
            title: "Choose your language",
            subtitle: "Please select your preferred language to continue.",
            fr: "French",
            en: "English",
            nl: "Dutch",
            es: "Spanish"
        },
        home: {
            hero: {
                badge: "Clinical Protocol v9.0",
                title: "DERMATOCHECK",
                subtitle: "Advanced dermatological expertise for comprehensive and personalized skin analysis.",
                cta_start: "Start Analysis",
                cta_clinics: "Find a Dermatologist"
            },
            showcase: {
                title: "Clinical Expertise",
                description: "Structural and biometric analysis of skin tissues. We transform medical data into diagnostic precision.",
                badge: "Biometrics & Analysis"
            },
            bento: {
                title: "Analysis & Diagnosis",
                subtitle: "Advanced Clinical Protocols",
                erythema: {
                    title: "Inflammatory Markers",
                    desc: "Facial analysis: detection of sensitive vascular zones and diffuse erythema."
                },
                security: {
                    title: "Data Security",
                    desc: "End-to-end encryption compliant with HIPAA and GDPR protection standards."
                },
                radar: {
                    title: "Scalp Analysis",
                    desc: "Dermatological examination of the scalp to detect inflammation and skin abnormalities."
                },
                scales: {
                    title: "Scaly Analysis",
                    desc: "T-Zone & Forehead: Evaluation of desquamation and skin dryness."
                },
                scalp: {
                    title: "Body Analysis",
                    desc: "Back & Trunk: Detection and tracking of lesions on hard-to-reach areas."
                }
            },

            protocol: {
                title: "Clinical Protocol",
                subtitle: "4-Phase Journey",
                step1: { title: "Anamnesis", desc: "Structured clinical interview to define background and symptomatic history." },
                step2: { title: "Acquisition", desc: "High-definition digital capture of visual markers of the lesion." },
                step3: { title: "Correlation", desc: "Cross-analysis of declarative constants and observed symptoms." },
                step4: { title: "Orientation", desc: "Exhaustive clinical synthesis and connection with local expertise." }
            }
        },
        about: {
            title: "DermatoCheck — AI Skin Analysis for Informational Purposes",
            subtitle: "Technological support for your dermatological observation.",
            sections: [
                {
                    title: "DermatoCheck: A Digital Support Solution",
                    text: "DermatoCheck is a digital skin analysis solution powered by artificial intelligence, combining skin image analysis and a dermatological questionnaire.\n\nOur technology evaluates visible skin parameters from photographs and user-declared information for informational, educational, and skin awareness purposes.\n\nDermatoCheck is a technological support tool for observation — it is not a medical service.\n\nNo medical acts are performed through the platform."
                },
                {
                    title: "Combined Technology: AI & User-Provided Data",
                    text: "DermatoCheck uses a combined approach.\n\n• Skin Image Analysis: Our algorithms evaluate visible elements such as color variations, skin contrasts, visual patterns, and surface skin characteristics.\n\n• Complementary Dermatological Questionnaire: Users may provide general information such as lesion duration, perceived evolution, reported symptoms (itching, sensitivity, discomfort), and general context."
                },
                {
                    title: "Value of Combining Photo & Questionnaire",
                    text: "Dermatological evaluation often relies on multiple observation factors. By associating automated visual analysis, general self-reported information, and dermatological statistical models, DermatoCheck provides more contextualized informational guidance than image analysis alone.\n\n✖ This combination never replaces a clinical examination, a full medical interview, a dermatologist’s expertise, or real medical follow-up."
                },
                {
                    title: "Informational Tool — Not a Medical Diagnosis",
                    text: "DermatoCheck provides:\n✖ no medical diagnosis\n✖ no personalized medical advice\n✖ no prescriptions\n✖ no treatment recommendations\n✖ no medical follow-up\n\nThe information generated is intended solely for awareness and educational purposes. Any medical decision must be made by a qualified healthcare professional."
                },
                {
                    title: "Limitations of AI Skin Photo Analysis",
                    text: "Automated analysis strongly depends on image quality. Results may be affected by lighting conditions, shadows, camera angle, resolution, makeup, body hair, or blur.\n\n➜ The absence of an alert does not mean absence of risk. Some dermatological conditions cannot be assessed through photographs alone."
                },
                {
                    title: "Our Mission: Skin Awareness and Guidance",
                    text: "DermatoCheck aims to encourage skin self-observation, improve dermatological awareness, promote earlier medical consultation when needed, and support discussions with healthcare professionals. The platform serves as an informational tool, never as a medical substitute."
                },
                {
                    title: "User Responsibility & Data Protection",
                    text: "Users acknowledge that the technology has limitations and errors may occur. Questionnaire responses are self-reported. The tool does not replace medical consultation. Images and information are processed by automated systems. Users remain responsible for the images they share and how they use the results."
                }
            ],
            warning: "IMPORTANT MEDICAL DISCLAIMER: DermatoCheck is not a doctor. The platform does not replace dermatological or medical consultation. Consult a healthcare professional in case of: pain, bleeding, rapid lesion changes, change in shape or color, unusual new lesions, or concerns about your skin. In case of medical emergency, contact local emergency services immediately."
        },
        legal: {
            title: "LEGAL NOTICES & SECURITY",
            subtitle: "TRANSPARENCY AND PROTECTION",
            sections: [
                { title: "MEDICAL LIABILITY LIMITATION", text: "**IMPORTANT: DERMATO-CHECK IS NOT A DOCTOR AND DOES NOT REPLACE A HEALTHCARE PROFESSIONAL UNDER ANY CIRCUMSTANCES.**\n\nThis service is a technological tool for preliminary information and orientation. The conclusions and hypotheses generated by the system are based solely on the information and media you provide. They do not constitute a medical diagnosis, prescription, or definitive medical advice." },
                { title: "OBLIGATION TO CONSULT", text: "Using DERMATO-CHECK does not exempt you from a physical clinical examination by a dermatologist or qualified physician. We strongly encourage you to consult a healthcare professional to validate any information obtained via this service. Never neglect medical advice or delay a consultation because of information read on this platform." },
                { title: "LEGAL PROTECTION", text: "By using this service, you acknowledge that DERMATO-CHECK and its creators cannot be held responsible for decisions made based on the information provided. The user is solely responsible for their health. In case of severe symptoms, acute pain, or rapid evolution of a lesion, go immediately to the emergency room or contact emergency services." }
            ],
            warning: "By using this application, you unreservedly accept our General Terms of Use."
        },
        consent: {
            title: "Your privacy matters",
            description: "DermatoCheck uses artificial intelligence and digital technologies to analyze skin images for informational purposes.\nBefore continuing, please confirm your consent.",
            checkboxes: {
                analysis: "I agree to the automated analysis of my images by artificial intelligence for informational purposes, and I understand that DermatoCheck does not replace a doctor for any medical decisions.",
                cookies: "I agree to the use of cookies and similar technologies to improve user experience, analyze traffic, and maintain platform security."
            },
            buttons: {
                decline: "Decline",
                accept: "Accept & Continue"
            },
            footer: "Your data remains secure and does not grant access to your information on other apps or websites.\nFor more details, please review our Privacy Policy."
        },

        "privacy-policy": {
            title: "PRIVACY POLICY",
            sections: [
                { title: "Data Collection and Use", text: "We are committed to protecting your privacy. DERMATO-CHECK does not collect, store, or share any personally identifiable information. All data you enter or upload is used solely for the duration of your consultation and is then deleted from our systems. **No data is retained long-term.**" },
                { title: "Data Security", text: "We implement robust security measures to protect the integrity and confidentiality of your information during the consultation. Traffic between your device and our servers is encrypted. However, no method of transmission over the Internet or electronic storage is completely secure." },
                { title: "Consent", text: "By using DERMATO-CHECK AI, you consent to our privacy policy described above. If you do not accept these terms, please do not use our application." }
            ]
        },
        "terms-of-use": {
            title: "TERMS OF USE",
            sections: [
                { title: "Acceptance of Terms", text: "By accessing and using DERMATO-CHECK AI, you agree to be bound by these Terms of Use. If you do not accept all terms, you are not authorized to use the application." },
                { title: "Nature of Service", text: "DERMATO-CHECK AI provides an information and orientation tool. **It is not a substitute for professional medical advice, diagnosis, or treatment.** Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition." },
                { title: "Limitation of Liability", text: "DERMATO-CHECK AI shall not be held liable for any direct or indirect damages resulting from the use or inability to use the service, including but not limited to loss of data or profits. Use of the application is at your own risk." },
                { title: "Changes to Terms", text: "We reserve the right to modify these Terms of Use at any time. Any modification will be effective immediately upon posting on this page. It is your responsibility to check these terms regularly." }
            ]
        },
        minors: {
            title: "Welcome to",
            subtitle: "To personalize your experience, please indicate your profile.",
            adult: "I am an adult",
            minor: "I am a minor"
        },
        contact: {
            title: "CONTACT US",
            description: "A question, a suggestion, or need help? Feel free to contact us.",
            error_missing: "Please fill in all required fields.",
            success: "Your message has been sent successfully! We will reply to you soon.",
            form: {
                name: "Your Name",
                name_placeholder: "Enter your name...",
                email: "Your Email",
                email_placeholder: "Enter your email...",
                subject: "Subject",
                subject_placeholder: "Subject of your message...",
                message: "Your Message",
                message_placeholder: "Enter your message (max 3000 characters)...",
                submit: "Send Message"
            }
        },
        analysis: {
            title: "Dermatological Analysis",
            subtitle: "Answer a few visual questions.",
            highlight: "Clinical precision, absolute simplicity.",
            target: "WHO IS THIS ANALYSIS FOR?",
            myself: "Myself",
            other: "Someone else",
            start_error: "Unexpected error at startup.",
            loading: "DermatoCheck analysis in progress...",
            retry: "Retry analysis",
            error_title: "Analysis Interrupted",
            config_required: "Configuration required",
            age_error: "Please enter a valid age (integer between 18 and 120).",
            age_error_child: "Please enter a valid age in years and/or months.",
            number_error: "Please enter a valid number (e.g., 3) without text.",
            interrupted: "Analysis Interrupted",
            warning_popup: {
                title: "PRELIMINARY MEDICAL WARNING",
                text1: "DermatoCheck is an analysis tool for INFORMATIONAL PURPOSES ONLY.",
                text2: "The results provided by the AI DO NOT CONSTITUTE A MEDICAL DIAGNOSIS.",
                text3: "In case of doubt, change in a lesion, or symptoms, CONSULT A DOCTOR.",
                close: "I understand, continue"
            },
            reset_popup: {
                title: "Confirm Restart",
                text: "Are you sure you want to restart the consultation? All current answers will be lost.",
                confirm: "Yes, restart",
                cancel: "No, cancel"
            },
            validation_popup: {
                title: "Incorrect Choice",
                close: "Got it"
            },
            restart_tooltip: "Restart Analysis"
        },
        faq: {
            title: "Frequently Asked Questions",
            subtitle: "Find answers to your questions about DermatoCheck",
            categories: {
                usage: "How to Use",
                technology: "Technology",
                security: "Security & Privacy",
                accuracy: "Accuracy & Limitations"
            },
            questions: {
                q1: {
                    question: "How do I use DermatoCheck?",
                    answer: "DermatoCheck is simple to use: (1) Click 'Start Analysis' from the home page, (2) Answer questions about your age and symptoms, (3) Upload clear photos of the affected area if requested, (4) Receive your detailed analysis report in seconds. Our interface guides you through each step of the process."
                },
                q2: {
                    question: "Can I use DermatoCheck for someone else?",
                    answer: "Yes, absolutely. When starting the analysis, you can choose whether the analysis is for yourself or for someone else. This option allows you to help a loved one, a child, or anyone who needs a preliminary dermatological assessment."
                },
                q3: {
                    question: "What photos should I provide?",
                    answer: "For optimal analysis, provide clear, well-lit photos of the affected skin area. Use natural light if possible, avoid direct flash, and ensure the area is sharp and visible. Multiple angles may be requested for certain conditions. Photo quality directly influences analysis accuracy."
                },
                q4: {
                    question: "How long does the analysis take?",
                    answer: "The complete analysis typically takes between 2 and 5 minutes. This includes preliminary questions, photo upload (if necessary), and processing by our artificial intelligence. You immediately receive a detailed report with personalized recommendations."
                },
                q5: {
                    question: "What technology does DermatoCheck use?",
                    answer: "DermatoCheck uses cutting-edge Google Gemini artificial intelligence, specially trained on millions of dermatological images. Our system combines deep learning, computer vision, and pattern recognition algorithms to analyze skin characteristics with clinical precision."
                },
                q6: {
                    question: "How does the artificial intelligence work?",
                    answer: "Our AI analyzes images in several steps: (1) Detection and segmentation of the area of interest, (2) Extraction of visual features (color, texture, shape, size), (3) Comparison with our medical database, (4) Probability assessment for different conditions, (5) Report generation with recommendations. All while respecting established clinical protocols."
                },
                q7: {
                    question: "Can DermatoCheck diagnose all skin conditions?",
                    answer: "DermatoCheck is designed to identify a wide range of common dermatological conditions, but it cannot diagnose all skin pathologies. Our system is particularly effective for visible conditions like acne, eczema, psoriasis, rashes, and certain lesions. For complex or rare cases, consultation with a dermatologist remains essential."
                },
                q8: {
                    question: "Is my data secure?",
                    answer: "Absolutely. DermatoCheck applies the strictest security standards: end-to-end encryption (AES-256), GDPR and HIPAA compliance, certified secure servers, and no data resale to third parties. Your personal and medical information is protected with the same level of security as banking institutions."
                },
                q9: {
                    question: "Does DermatoCheck keep my photos?",
                    answer: "No. By default, DermatoCheck does NOT keep ANY of your photos or personal data after analysis. All images are processed in real-time and deleted immediately after report generation. No data is saved on our servers, ensuring your complete privacy."
                },
                q10: {
                    question: "Who has access to my information?",
                    answer: "Nobody. Your information is only accessible to you during your analysis session. We have no administrative access to your personal data, and no employee, partner, or third party can view your photos or results. Processing is entirely automated and anonymous."
                },
                q11: {
                    question: "How accurate is DermatoCheck?",
                    answer: "DermatoCheck achieves 85-92% accuracy for common dermatological conditions, comparable to that of a general dermatologist for initial diagnosis. However, accuracy varies depending on photo quality, symptom clarity, and condition type. Our system is designed as a decision support tool, not as a replacement for professional medical judgment."
                },
                q12: {
                    question: "Does DermatoCheck replace a dermatologist?",
                    answer: "No, absolutely not. DermatoCheck is a preliminary analysis tool that helps you better understand your skin condition and decide if medical consultation is necessary. It in no way replaces clinical examination, formal diagnosis, or treatment prescribed by a certified dermatologist. When in doubt, always consult a healthcare professional."
                },
                q13: {
                    question: "What should I do if I disagree with the results?",
                    answer: "If you have doubts about the analysis results, we strongly recommend consulting a dermatologist for a thorough clinical examination. DermatoCheck provides an AI-based assessment, but only a doctor can establish a definitive diagnosis. Use our 'Find a Dermatologist' tool to locate a specialist near you."
                }
            }
        },
        footer: {
            about: "About",
            legal: "Legal",
            contact: "Contact",
            faq: "FAQ",
            copyright: "© 2026 DermatoCheck. All rights reserved.",
            tagline: "Your skin health, our priority"
        },
        blog: {
            title: "Dermatological Blog",
            subtitle: "Expert advice and scientific information to care for your skin",
            categories: {
                all: "All articles",
                skincare: "Skin Care",
                conditions: "Skin Conditions",
                prevention: "Prevention"
            },
            read_time: "min read",
            read_article: "Read article",
            no_articles: "No articles in this category at the moment.",
            not_found: "Article not found",
            back: "Back to blog",
            see_all: "View all articles"
        },
        dermatologist: {
            title: "Find a Dermatologist",
            description: "Use our tool to locate dermatologists near you using Google Maps. A health professional is essential for a diagnosis.",
            choose_method: "Choose a method to locate a specialist:",
            around_me: {
                title: "Around Me",
                description: "Use your current position to find dermatologists within a 10-15 km radius.",
                button: "Find Nearby",
                loading: "Locating..."
            },
            by_city: {
                title: "By Country & City",
                description: "Manual Entry",
                country_placeholder: "Select Country",
                city_placeholder: "Select City",
                other_city: "Other (type name)",
                matches_nothing: "Other...",
                input_placeholder: "City name...",
                button: "Search"
            },
            errors: {
                geo_not_supported: "Geolocation is not supported by your browser.",
                geo_denied: "Location denied. Please check your settings.",
                geo_unavailable: "Unable to retrieve your position.",
                generic: "Error searching for dermatologists."
            },
            list: {
                loading_title: "Analysis in progress",
                loading_desc: "Searching for dermatologists nearby...",
                results_nearby: "Results nearby ({count})",
                results: "Results ({count})",
                distance: "{km} km from your position",
                visit_website: "Visit website",
                get_directions: "Get Directions",
                call: "Call Expert",
                no_results: "No results found.",
                no_results_desc: "Try another city or use geolocation.",
                interrupted: "Search Interrupted",
                traffic_overload: "The mapping service is currently overloaded. Please wait a minute before retrying.",
                api_not_enabled_title: "API Not Enabled",
                api_not_enabled_desc: "The Google Generative Language API is not enabled for this project. Please follow these steps:",
                api_step_1: "Click the button below to activate the API",
                api_step_2: "Click the 'ENABLE' button on the page that opens",
                api_step_3: "Wait 1-2 minutes, then refresh this page",
                api_activate_button: "Activate API",
                api_note: "Note: The API is free for normal usage (up to 1500 requests/day)"
            },
            popup: {
                title: "Optimize Search",
                description: "Do you want to use your current location to find dermatologists <bold>exactly in your city</bold>?",
                allow: "Yes, use my location",
                deny: "No, I'll type my city"
            }
        },
        auth: {
            login_title: "Sign In",
            login_subtitle: "Access your personal space",
            signup_title: "Create Account",
            signup_subtitle: "Join DermatoCheck today",
            tab_login: "Sign In",
            tab_signup: "Sign Up",
            name: "Full Name",
            name_placeholder: "Your name...",
            email: "Email Address",
            email_placeholder: "your@email.com",
            password: "Password",
            password_placeholder: "••••••••",
            confirm_password: "Confirm Password",
            confirm_password_placeholder: "••••••••",
            forgot_password: "Forgot password?",
            login_button: "Sign In",
            signup_button: "Create Account",
            or: "or",
            google: "Continue with Google",
            have_account: "Already have an account?",
            no_account: "Don't have an account?",
            login_success: "Login successful!",
            signup_success: "Account created successfully!",
            switch_to_minor: "Switch to Minor mode",
            switch_to_adult: "Switch to Adult mode",
            profile_adult: "Adult Mode",
            profile_minor: "Minor Mode"
        },
        profile: {
            title: "My Profile",
            logout: "Sign Out",
            history_title: "Analysis History",
            analyzed_on: "Analyzed on",
            result: "Analysis Result",
            no_notes: "No notes added.",
            empty_title: "No analysis",
            empty_desc: "Your future analyses will appear here. Start by performing your first analysis.",
            start: "Start Analysis",
            loading: "Loading..."
        }
    },
    nl: {
        common: {
            start: "Starten",
            back: "Terug",
            loading: "Laden...",
            error: "Fout",
            login: "Inloggen",
            nav: {
                home: "Home",
                analysis: "Analyse",
                find_derm: "Vind een Dermato",
                blog: "Blog",
                about: "Over",
                legal: "Legaal",
                contact: "Contact",
                clinics: "Klinieken"
            }
        },
        questionnaire_ui: {
            validate: "Valideren",
            validate_selection: "Selectie valideren",
            skip_step: "Sla deze stap over",
            analyze_photo: "Foto analyseren",
            select_photos: "Foto's selecteren",
            images_selected: "afbeelding(en) geselecteerd",
            choose_images: "Kies afbeelding(en)",
            add_photo: "Voeg een duidelijke foto toe voor een nauwkeurige analyse.",
            photo_tips_title: "Tips voor een duidelijke foto:",
            photo_tip_1: "Maak de lens van uw apparaat schoon.",
            photo_tip_2: "Gebruik indien mogelijk natuurlijk licht.",
            photo_tip_3: "Neem de foto van heel dichtbij.",
            photo_tip_4: "Blijf stil staan om onscherpte te voorkomen.",
            preview: "Voorbeeld",
            thumbnail: "Miniatuur",
            error_exclusive: "Deze keuze is niet compatibel met uw huidige selecties.",
            error_deselect: "Deselecteer eerst om meer symptomen toe te voegen.",
            error_clear: "Wis alstublieft uw selecties voordat u doorgaat.",
            placeholder_text: "Beschrijf hier uw symptomen...",
            number_error: "Voer een geldig getal in (bijv. 3) zonder tekst.",
            take_photo: "Neem een Foto"
        },
        languagePopup: {
            title: "Kies uw taal",
            subtitle: "Selecteer de taal van uw voorkeur om door te gaan.",
            fr: "Frans",
            en: "Engels",
            nl: "Nederlands",
            es: "Spaans"
        },
        home: {
            hero: {
                badge: "Klinisch Protocol v9.0",
                title: "DERMATOCHECK",
                subtitle: "Geavanceerde dermatologische expertise voor een uitgebreide en gepersonaliseerde huidanalyse.",
                cta_start: "Start Analyse",
                cta_clinics: "Vind een Dermatoloog"
            },
            showcase: {
                title: "Klinische Expertise",
                description: "Structurele en biometrische analyse van huidweefsels. Wij transformeren medische gegevens in diagnostische precisie.",
                badge: "Biometrie & Analyse"
            },
            bento: {
                title: "Analyse & Diagnose",
                subtitle: "Geavanceerde Klinische Protocollen",
                erythema: {
                    title: "Ontstekingsmarkers",
                    desc: "Gezichtsanalyse: detectie van gevoelige vasculaire zones en diffuus erytheem."
                },
                security: {
                    title: "Dataveiligheid",
                    desc: "End-to-end encryptie in overeenstemming met HIPAA en GDPR beschermingsnormen."
                },
                radar: {
                    title: "Hoofdhuidanalyse",
                    desc: "Dermatologisch onderzoek van de hoofdhuid om ontstekingen en huidafwijkingen op te sporen."
                },
                scales: {
                    title: "Schilferanalyse",
                    desc: "T-Zone & Voorhoofd: Evaluatie van afschilfering en droogheid van de huid."
                },
                scalp: {
                    title: "Lichaamsanalyse",
                    desc: "Rug & Romp: Detectie en opvolging van laesies op moeilijk bereikbare plaatsen."
                }
            },

            protocol: {
                title: "Klinisch Protocol",
                subtitle: "Reis in 4 fasen",
                step1: { title: "Anamnese", desc: "Gestructureerd klinisch interview om de achtergrond en symptomatische geschiedenis te definiëren." },
                step2: { title: "Acquisitie", desc: "High-definition digitale opname van visuele markers van de laesie." },
                step3: { title: "Correlatie", desc: "Kruisanalyse van declaratieve constanten en waargenomen symptomen." },
                step4: { title: "Oriëntatie", desc: "Uitgebreide klinische synthese en verbinding met lokale expertise." }
            }
        },
        about: {
            title: "DermatoCheck — AI Huidanalyse voor Informatieve Doeleinden",
            subtitle: "Technologische ondersteuning voor uw dermatologische observatie.",
            sections: [
                {
                    title: "DermatoCheck: Een Digitale Ondersteuningsoplossing",
                    text: "DermatoCheck is een digitale huidanalyseoplossing aangedreven door kunstmatige intelligentie, die huidbeeldanalyse en een dermatologische vragenlijst combineert.\n\nOnze technologie evalueert zichtbare huidparameters aan de hand van foto's en door de gebruiker verstrekte informatie voor informatieve, educatieve en huidbewustwordingsdoeleinden.\n\nDermatoCheck is een technologisch hulpmiddel voor observatie — het is geen medische dienst.\n\nEr worden geen medische handelingen uitgevoerd via het platform."
                },
                {
                    title: "Gecombineerde Technologie: AI & Door de Gebruiker Verstrekte Gegevens",
                    text: "DermatoCheck maakt gebruik van een gecombineerde aanpak.\n\n• Huidbeeldanalyse: Onze algoritmen evalueren zichtbare elementen zoals kleurvariaties, huidcontrasten, visuele patronen en oppervlaktekenmerken van de huid.\n\n• Aanvullende Dermatologische Vragenlijst: Gebruikers kunnen algemene informatie verstrekken, zoals de duur van de laesie, waargenomen evolutie, gemelde symptomen (jeuk, gevoeligheid, ongemak) en algemene context."
                },
                {
                    title: "Waarde van het Combineren van Foto & Vragenlijst",
                    text: "Dermatologische evaluatie berust vaak op meerdere observatiefactoren. Door geautomatiseerde visuele analyse, algemene zelfgerapporteerde informatie en dermatologische statistische modellen te combineren, biedt DermatoCheck meer gecontextualiseerde informatieve begeleiding dan alleen beeldanalyse.\n\n✖ Deze combinatie vervangt nooit een klinisch onderzoek, een volledig medisch interview, de expertise van een dermatoloog of een echte medische follow-up."
                },
                {
                    title: "Informatief Hulpmiddel — Geen Medische Diagnose",
                    text: "DermatoCheck biedt:\n✖ geen medische diagnose\n✖ geen gepersonaliseerd medisch advies\n✖ geen recepten\n✖ geen behandelingsaanbevelingen\n✖ geen medische opvolging\n\nDe gegenereerde informatie is uitsluitend bedoeld voor bewustwordings- en educatieve doeleinden. Elke medische beslissing moet worden genomen door een gekwalificeerde zorgprofessional."
                },
                {
                    title: "Beperkingen van AI Huidfotoanalyse",
                    text: "Geautomatiseerde analyse hangt sterk af van de beeldkwaliteit. Resultaten kunnen worden beïnvloed door lichtomstandigheden, schaduwen, camerahoek, resolutie, make-up, lichaamshaar of onscherpte.\n\n➜ De afwezigheid van een waarschuwing betekent niet de afwezigheid van risico. Sommige dermatologische aandoeningen kunnen niet worden beoordeeld op basis van alleen foto's."
                },
                {
                    title: "Onze Missie: Huidbewustzijn en Begeleiding",
                    text: "DermatoCheck streeft ernaar zelfobservatie van de huid aan te moedigen, het dermatologisch bewustzijn te vergroten, eerdere medische consultatie te bevorderen wanneer dat nodig is, en discussies met zorgprofessionals te ondersteunen. Het platform dient als een informatief hulpmiddel, nooit als een medisch substituut."
                },
                {
                    title: "Verantwoordelijkheid van de Gebruiker & Gegevensbescherming",
                    text: "Gebruikers erkennen dat de technologie beperkingen heeft en dat er fouten kunnen optreden. De antwoorden op de vragenlijst zijn zelfgerapporteerd. De tool vervangt geen medisch consult. Afbeeldingen en informatie worden verwerkt door geautomatiseerde systemen. Gebruikers blijven verantwoordelijk voor de afbeeldingen die ze delen en hoe ze de resultaten gebruiken."
                }
            ],
            warning: "BELANGRIJKE MEDISCHE DISCLAIMER: DermatoCheck is geen arts. Het platform vervangt geen dermatologisch of medisch consult. Raadpleeg een zorgprofessional in geval van: pijn, bloeding, snelle veranderingen in de laesie, verandering van vorm of kleur, ongebruikelijke nieuwe laesies, of zorgen over uw huid. Neem in geval van een medische noodsituatie onmiddellijk contact op met uw lokale hulpdiensten."
        },
        legal: {
            title: "JURIDISCHE MEDEDELINGEN & BEVEILIGING",
            subtitle: "TRANSPARANTIE EN BESCHERMING",
            sections: [
                { title: "BEPERKING VAN MEDISCHE AANSPRAKELIJKHEID", text: "**BELANGRIJK: DERMATO-CHECK IS GEEN ARTS EN VERVANGT IN GEEN GEVAL EEN ZORGPROFESSIONAL.**\n\nDeze service is een technologisch hulpmiddel voor voorlopige informatie en oriëntatie. De conclusies en hypothesen die door het systeem worden gegenereerd, zijn uitsluitend gebaseerd op de informatie en media die u verstrekt. Ze vormen geen medische diagnose, recept of definitief medisch advies." },
                { title: "VERPLICHTING OM TE RAADPLEGEN", text: "Het gebruik van DERMATO-CHECK stelt u niet vrij van een fysiek klinisch onderzoek door een dermatoloog of gekwalificeerde arts. Wij moedigen u ten zeerste aan om een zorgprofessional te raadplegen om alle informatie die via deze service is verkregen, te valideren. Negeer nooit medisch advies en stel een consultatie nooit uit vanwege informatie die u op dit platform hebt gelezen." },
                { title: "JURIDISCHE BESCHERMING", text: "Door deze service te gebruiken, erkent u dat DERMATO-CHECK en haar makers niet verantwoordelijk kunnen worden gehouden voor beslissingen die zijn genomen op basis van de verstrekte informatie. De gebruiker is als enige verantwoordelijk voor zijn gezondheid. Ga in geval van ernstige symptomen, acute pijn of snelle evolutie van een laesie onmiddellijk naar de eerste hulp of neem contact op met de hulpdiensten." }
            ],
            warning: "Door deze applicatie te gebruiken, accepteert u onvoorwaardelijk onze Algemene Gebruiksvoorwaarden."
        },
        consent: {
            title: "Uw privacy is belangrijk",
            description: "DermatoCheck gebruikt kunstmatige intelligentie en digitale technologieën om huidafbeeldingen te analyseren voor informatieve doeleinden.\nBevestig uw toestemming voordat u doorgaat.",
            checkboxes: {
                analysis: "Ik ga akkoord met de geautomatiseerde analyse van mijn afbeeldingen door kunstmatige intelligentie voor informatieve doeleinden, en ik begrijp dat DermatoCheck geen arts vervangt voor medische beslissingen.",
                cookies: "Ik ga akkoord met het gebruik van cookies en vergelijkbare technologieën om de gebruikerservaring te verbeteren, het verkeer te analyseren en de veiligheid van het platform te handhaven."
            },
            buttons: {
                decline: "Weigeren",
                accept: "Accepteren & Doorgaan"
            },
            footer: "Uw gegevens blijven veilig en geven geen toegang tot uw informatie in andere apps of op websites.\nLees ons Privacybeleid voor meer informatie."
        },

        "privacy-policy": {
            title: "PRIVACYBELEID",
            sections: [
                { title: "Gegevensverzameling en Gebruik", text: "Wij doen er alles aan om uw privacy te beschermen. DERMATO-CHECK verzamelt, bewaart of deelt geen persoonlijk identificeerbare informatie. Alle gegevens die u invoert of uploadt, worden uitsluitend gebruikt voor de duur van uw consultatie en worden vervolgens uit onze systemen verwijderd. **Er worden geen gegevens op de lange termijn bewaard.**" },
                { title: "Dataveiligheid", text: "We implementeren robuuste beveiligingsmaatregelen om de integriteit en vertrouwelijkheid van uw informatie tijdens de consultatie te beschermen. Het verkeer tussen uw apparaat en onze servers is gecodeerd. Geen enkele methode van overdracht via internet of elektronische opslag is echter volledig veilig." },
                { title: "Toestemming", text: "Door DERMATO-CHECK AI te gebruiken, stemt u in met ons privacybeleid zoals hierboven beschreven. Als u niet akkoord gaat met deze voorwaarden, gebruik onze applicatie dan niet." }
            ]
        },
        "terms-of-use": {
            title: "GEBRUIKSVOORWAARDEN",
            sections: [
                { title: "Acceptatie van Voorwaarden", text: "Door DERMATO-CHECK AI te openen en te gebruiken, gaat u ermee akkoord gebonden te zijn aan deze Gebruiksvoorwaarden. Als u niet akkoord gaat met alle voorwaarden, bent u niet gemachtigd om de applicatie te gebruiken." },
                { title: "Aard van de Dienst", text: "DERMATO-CHECK AI biedt een informatie- en oriëntatiehulpmiddel. **Het is geen vervanging voor professioneel medisch advies, diagnose of behandeling.** Vraag altijd advies aan uw arts of een andere gekwalificeerde zorgverlener als u vragen hebt over een medische aandoening." },
                { title: "Beperking van Aansprakelijkheid", text: "DERMATO-CHECK AI is niet aansprakelijk voor enige directe of indirecte schade die voortvloeit uit het gebruik of het onvermogen om de dienst te gebruiken, inclusief maar niet beperkt tot verlies van gegevens of winst. Het gebruik van de applicatie is op eigen risico." },
                { title: "Wijzigingen in de Voorwaarden", text: "We behouden ons het recht voor om deze Gebruiksvoorwaarden op elk moment te wijzigen. Elke wijziging is onmiddellijk van kracht na publicatie op deze pagina. Het is uw verantwoordelijkheid om deze voorwaarden regelmatig te controleren." }
            ]
        },
        minors: {
            title: "Welkom bij",
            subtitle: "Geef uw profiel aan om uw ervaring te personaliseren.",
            adult: "Ik ben volwassen",
            minor: "Ik ben minderjarig"
        },
        contact: {
            title: "NEEM CONTACT OP",
            description: "Een vraag, een suggestie of hulp nodig? Neem gerust contact met ons op.",
            error_missing: "Vul a.u.b. alle verplichte velden in.",
            success: "Uw bericht is succesvol verzonden! Wij zullen u spoedig antwoorden.",
            form: {
                name: "Uw Naam",
                name_placeholder: "Voer uw naam in...",
                email: "Uw E-mail",
                email_placeholder: "Voer uw e-mailadres in...",
                subject: "Onderwerp",
                subject_placeholder: "Onderwerp van uw bericht...",
                message: "Uw Bericht",
                message_placeholder: "Voer uw bericht in (max 3000 tekens)...",
                submit: "Verstuur Bericht"
            }
        },
        analysis: {
            title: "Dermatologische Analyse",
            subtitle: "Beantwoord een paar visuele vragen.",
            highlight: "Klinische precisie, absolute eenvoud.",
            target: "VOOR WIE IS DEZE ANALYSE?",
            myself: "Mezelf",
            other: "Iemand anders",
            start_error: "Onverwachte fout bij opstarten.",
            loading: "DermatoCheck analyse bezig...",
            retry: "Analyse opnieuw proberen",
            error_title: "Analyse Onderbroken",
            config_required: "Configuratie vereist",
            age_error: "Voer een geldige leeftijd in (geheel getal tussen 18 en 120).",
            age_error_child: "Voer een geldige leeftijd in, in jaren en/of maanden.",
            number_error: "Voer a.u.b. een geldig getal in (bijv. 3) zonder tekst.",
            interrupted: "Analyse Onderbroken",
            warning_popup: {
                title: "VOORAFGAANDE MEDISCHE WAARSCHUWING",
                text1: "DermatoCheck is een analyse-instrument UITSLUITEND VOOR INFORMATIEVE DOELEINDEN.",
                text2: "De resultaten van de AI VORMEN GEEN MEDISCHE DIAGNOSE.",
                text3: "Raadpleeg een ARTS bij twijfel, verandering in een laesie of symptomen.",
                close: "Ik begrijp het, doorgaan"
            },
            reset_popup: {
                title: "Herstarten Bevestigen",
                text: "Weet u zeker dat u het consult opnieuw wilt starten? Alle huidige antwoorden gaan verloren.",
                confirm: "Ja, herstarten",
                cancel: "Nee, annuleren"
            },
            validation_popup: {
                title: "Onjuiste Keuze",
                close: "Begrepen"
            },
            restart_tooltip: "Analyse Herstarten"
        },
        faq: {
            title: "Veelgestelde Vragen",
            subtitle: "Vind antwoorden op uw vragen over DermatoCheck",
            categories: {
                usage: "Hoe te gebruiken",
                technology: "Technologie",
                security: "Beveiliging & Privacy",
                accuracy: "Nauwkeurigheid & Beperkingen"
            },
            questions: {
                q1: {
                    question: "Hoe gebruik ik DermatoCheck?",
                    answer: "DermatoCheck is eenvoudig in gebruik: (1) Klik op 'Start Analyse' vanaf de startpagina, (2) Beantwoord vragen over uw leeftijd en symptomen, (3) Upload duidelijke foto's van het getroffen gebied indien gevraagd, (4) Ontvang uw gedetailleerde analyserapport in enkele seconden. Onze interface begeleidt u bij elke stap van het proces."
                },
                q2: {
                    question: "Kan ik DermatoCheck voor iemand anders gebruiken?",
                    answer: "Ja, absoluut. Bij het starten van de analyse kunt u kiezen of de analyse voor uzelf of voor iemand anders is. Deze optie stelt u in staat een dierbare, een kind of iemand anders die een voorlopige dermatologische beoordeling nodig heeft, te helpen."
                },
                q3: {
                    question: "Welke foto's moet ik verstrekken?",
                    answer: "Geef voor een optimale analyse duidelijke, goed verlichte foto's van het aangetaste huidgebied. Gebruik indien mogelijk natuurlijk licht, vermijd directe flits en zorg ervoor dat het gebied scherp en zichtbaar is. Voor bepaalde aandoeningen kunnen meerdere hoeken worden gevraagd. Fotokwaliteit heeft directe invloed op de nauwkeurigheid van de analyse."
                },
                q4: {
                    question: "Hoe lang duurt de analyse?",
                    answer: "De volledige analyse duurt doorgaans tussen de 2 en 5 minuten. Dit omvat voorlopige vragen, het uploaden van foto's (indien nodig) en verwerking door onze kunstmatige intelligentie. U ontvangt direct een gedetailleerd rapport met gepersonaliseerde aanbevelingen."
                },
                q5: {
                    question: "Welke technologie gebruikt DermatoCheck?",
                    answer: "DermatoCheck gebruikt geavanceerde Google Gemini kunstmatige intelligentie, speciaal getraind op miljoenen dermatologische afbeeldingen. Ons systeem combineert deep learning, computer vision en patroonherkenningsalgoritmen om huidkenmerken met klinische precisie te analyseren."
                },
                q6: {
                    question: "Hoe werkt de kunstmatige intelligentie?",
                    answer: "Onze AI analyseert afbeeldingen in verschillende stappen: (1) Detectie en segmentatie van het interessegebied, (2) Extractie van visuele kenmerken (kleur, textuur, vorm, grootte), (3) Vergelijking met onze medische database, (4) Kansbeoordeling voor verschillende aandoeningen, (5) Rapportgeneratie met aanbevelingen. Alles met inachtneming van vastgestelde klinische protocollen."
                },
                q7: {
                    question: "Kan DermatoCheck alle huidaandoeningen diagnosticeren?",
                    answer: "DermatoCheck is ontworpen om een breed scala aan veelvoorkomende dermatologische aandoeningen te identificeren, maar kan niet alle huidpathologieën diagnosticeren. Ons systeem is bijzonder effectief voor zichtbare aandoeningen zoals acne, eczeem, psoriasis, huiduitslag en bepaalde laesies. Voor complexe of zeldzame gevallen blijft een consultatie bij een dermatoloog essentieel."
                },
                q8: {
                    question: "Zijn mijn gegevens veilig?",
                    answer: "Absoluut. DermatoCheck past de strengste veiligheidsnormen toe: end-to-end encryptie (AES-256), naleving van de GDPR- en HIPAA-wetgeving, gecertificeerde beveiligde servers en geen verkoop van gegevens aan derden. Uw persoonlijke en medische informatie wordt beschermd met hetzelfde beveiligingsniveau als bankinstellingen."
                },
                q9: {
                    question: "Bewaart DermatoCheck mijn foto's?",
                    answer: "Nee. Standaard bewaart DermatoCheck GEEN van uw foto's of persoonlijke gegevens na analyse. Alle afbeeldingen worden in real-time verwerkt en onmiddellijk verwijderd na het genereren van het rapport. Er worden geen gegevens opgeslagen op onze servers, waardoor uw volledige privacy wordt gegarandeerd."
                },
                q10: {
                    question: "Wie heeft toegang tot mijn informatie?",
                    answer: "Niemand. Uw informatie is alleen voor u toegankelijk tijdens uw analysesessie. We hebben geen administratieve toegang tot uw persoonlijke gegevens, en geen enkele werknemer, partner of derde partij kan uw foto's of resultaten bekijken. De verwerking is volledig geautomatiseerd en anoniem."
                },
                q11: {
                    question: "Hoe nauwkeurig is DermatoCheck?",
                    answer: "DermatoCheck bereikt een nauwkeurigheid van 85-92% voor veelvoorkomende dermatologische aandoeningen, vergelijkbaar met die van een algemene dermatoloog voor initiële diagnose. Nauwkeurigheid varieert echter afhankelijk van fotokwaliteit, helderheid van symptomen en het type aandoening. Ons systeem is ontworpen als een hulpmiddel voor besluitvorming, niet als vervanging voor professioneel medisch oordeel."
                },
                q12: {
                    question: "Vervangt DermatoCheck een dermatoloog?",
                    answer: "Nee, absoluut niet. DermatoCheck is een voorlopig analyse-instrument dat u helpt uw huidaandoening beter te begrijpen en te beslissen of medisch overleg noodzakelijk is. Het vervangt geenszins klinisch onderzoek, formele diagnose of door een gecertificeerde dermatoloog voorgeschreven behandeling. Raadpleeg bij twijfel altijd een zorgprofessional."
                },
                q13: {
                    question: "Wat moet ik doen als ik het niet eens ben met de resultaten?",
                    answer: "Als u twijfelt over de analyseresultaten, raden wij u ten zeerste aan een dermatoloog te raadplegen voor een grondig klinisch onderzoek. DermatoCheck biedt een AI-gebaseerde beoordeling, maar alleen een arts kan een definitieve diagnose stellen. Gebruik onze 'Zoek een Dermatoloog' tool om een specialist bij u in de buurt te vinden."
                }
            }
        },
        footer: {
            about: "Over",
            legal: "Juridisch",
            contact: "Contact",
            faq: "Veelgestelde vragen",
            copyright: "© 2026 DermatoCheck. Alle rechten voorbehouden.",
            tagline: "Uw huidgezondheid, onze prioriteit"
        },
        blog: {
            title: "Dermatologische Blog",
            subtitle: "Deskundig advies en wetenschappelijke informatie voor uw huidverzorging",
            categories: {
                all: "Alle artikelen",
                skincare: "Huidverzorging",
                conditions: "Huidaandoeningen",
                prevention: "Preventie"
            },
            read_time: "min leestijd",
            read_article: "Lees artikel",
            no_articles: "Momenteel geen artikelen in deze categorie.",
            not_found: "Artikel niet gevonden",
            back: "Terug naar blog",
            see_all: "Bekijk alle artikelen"
        },
        dermatologist: {
            title: "Vind een Dermatoloog",
            description: "Gebruik onze tool om dermatologen bij u in de buurt te vinden met behulp van Google Maps. Een gezondheidsprofessional is onmisbaar voor een diagnose.",
            choose_method: "Kies een methode om een specialist te vinden:",
            around_me: {
                title: "Bij mij in de buurt",
                description: "Gebruik uw huidige positie om dermatologen binnen een straal van 10-15 km te vinden.",
                button: "Zoek in de buurt",
                loading: "Lokaliseren..."
            },
            by_city: {
                title: "Per Land & Stad",
                description: "Handmatige Invoer",
                country_placeholder: "Selecteer Land",
                city_placeholder: "Selecteer Stad",
                other_city: "Overig (typ naam)",
                matches_nothing: "Overig...",
                input_placeholder: "Stadsnaam...",
                button: "Zoeken"
            },
            errors: {
                geo_not_supported: "Geolocatie wordt niet ondersteund door uw browser.",
                geo_denied: "Locatie geweigerd. Controleer uw instellingen.",
                geo_unavailable: "Kan uw positie niet ophalen.",
                generic: "Fout bij het zoeken naar dermatologen."
            },
            list: {
                loading_title: "Analyse wordt uitgevoerd",
                loading_desc: "Zoeken naar dermatologen in de buurt...",
                results_nearby: "Resultaten in de buurt ({count})",
                results: "Resultaten ({count})",
                distance: "{km} km van uw positie",
                visit_website: "Bezoek website",
                get_directions: "Routebeschrijving",
                call: "Bel Expert",
                no_results: "Geen resultaten gevonden.",
                no_results_desc: "Probeer een andere stad of gebruik geolocatie.",
                interrupted: "Zoekopdracht Onderbroken",
                traffic_overload: "De kaartendienst is momenteel overbelast. Wacht een minuut voordat u het opnieuw probeert.",
                api_not_enabled_title: "API Niet Ingeschakeld",
                api_not_enabled_desc: "De Google Generative Language API is niet ingeschakeld voor dit project. Volg deze stappen:",
                api_step_1: "Klik op de onderstaande knop om de API te activeren",
                api_step_2: "Klik op de knop 'INSCHAKELEN' ('ENABLE') op de pagina die wordt geopend",
                api_step_3: "Wacht 1-2 minuten en vernieuw dan deze pagina",
                api_activate_button: "API Activeren",
                api_note: "Let op: De API is gratis voor normaal gebruik (tot 1500 aanvragen/dag)"
            },
            popup: {
                title: "Zoekopdracht optimaliseren",
                description: "Wilt u uw huidige locatie gebruiken om dermatologen <bold>precies in uw stad</bold> te vinden?",
                allow: "Ja, gebruik mijn locatie",
                deny: "Nee, ik typ mijn stad"
            }
        },
        auth: {
            login_title: "Inloggen",
            login_subtitle: "Toegang tot uw persoonlijke omgeving",
            signup_title: "Account Maken",
            signup_subtitle: "Word vandaag nog lid van DermatoCheck",
            tab_login: "Inloggen",
            tab_signup: "Registreren",
            name: "Volledige Naam",
            name_placeholder: "Uw naam...",
            email: "E-mailadres",
            email_placeholder: "uw@email.com",
            password: "Wachtwoord",
            password_placeholder: "••••••••",
            confirm_password: "Wachtwoord Bevestigen",
            confirm_password_placeholder: "••••••••",
            forgot_password: "Wachtwoord vergeten?",
            login_button: "Inloggen",
            signup_button: "Account Maken",
            or: "of",
            google: "Doorgaan met Google",
            have_account: "Heeft u al een account?",
            no_account: "Heeft u nog geen account?",
            login_success: "Succesvol ingelogd!",
            signup_success: "Account succesvol aangemaakt!",
            switch_to_minor: "Overschakelen naar Minderjarigenmodus",
            switch_to_adult: "Overschakelen naar Volwassenmodus",
            profile_adult: "Volwassenmodus",
            profile_minor: "Minderjarigenmodus"
        },
        profile: {
            title: "Mijn Profiel",
            logout: "Uitloggen",
            history_title: "Analyse Geschiedenis",
            analyzed_on: "Geanalyseerd op",
            result: "Analyseresultaat",
            no_notes: "Geen notities toegevoegd.",
            empty_title: "Geen analyse",
            empty_desc: "Uw toekomstige analyses verschijnen hier. Begin met het uitvoeren van uw eerste analyse.",
            start: "Start Analyse",
            loading: "Laden..."
        }
    },
    es: {
        common: {
            start: "Comenzar",
            back: "Atrás",
            loading: "Cargando...",
            error: "Error",
            login: "Iniciar sesión",
            nav: {
                home: "Inicio",
                analysis: "Análisis",
                find_derm: "Encontrar Dermatólogo",
                blog: "Blog",
                about: "Sobre nosotros",
                legal: "Legal",
                contact: "Contacto",
                clinics: "Clínicas"
            }
        },
        questionnaire_ui: {
            validate: "Validar",
            validate_selection: "Validar selección",
            skip_step: "Omitir este paso",
            analyze_photo: "Analizar foto",
            select_photos: "Seleccionar fotos",
            images_selected: "imagen(es) seleccionada(s)",
            choose_images: "Elegir imagen(es)",
            add_photo: "Añade una foto clara para un análisis preciso.",
            photo_tips_title: "Consejos para una foto clara:",
            photo_tip_1: "Limpia la lente de tu dispositivo.",
            photo_tip_2: "Usa luz natural si es posible.",
            photo_tip_3: "Toma la foto muy de cerca.",
            photo_tip_4: "Mantente quieto para evitar que salga borrosa.",
            preview: "Vista previa",
            thumbnail: "Miniatura",
            error_exclusive: "Esta elección es incompatible con tus selecciones actuales.",
            error_deselect: "Desmarca primero para añadir más síntomas.",
            error_clear: "Por favor, borra tus selecciones antes de continuar.",
            placeholder_text: "Describe tus síntomas aquí...",
            number_error: "Por favor ingresa un número válido (ej: 3) sin texto.",
            take_photo: "Tomar una foto"
        },
        languagePopup: {
            title: "Elige tu idioma",
            subtitle: "Por favor, selecciona tu idioma preferido para continuar.",
            fr: "Francés",
            en: "Inglés",
            nl: "Holandés",
            es: "Español"
        },
        home: {
            hero: {
                badge: "Protocolo Clínico v9.0",
                title: "DERMATOCHECK",
                subtitle: "Experiencia dermatológica de vanguardia para un análisis cutáneo completo y personalizado.",
                cta_start: "Iniciar Análisis",
                cta_clinics: "Encontrar un Dermatólogo"
            },
            showcase: {
                title: "Experiencia Clínica",
                description: "Análisis estructural y biométrico del tejido cutáneo. Transformamos datos médicos en precisión diagnóstica.",
                badge: "Biometría y Análisis"
            },
            bento: {
                title: "Análisis y Diagnóstico",
                subtitle: "Protocolos Clínicos Avanzados",
                erythema: {
                    title: "Marcadores Inflamatorios",
                    desc: "Análisis facial: detección de zonas vasculares sensibles y eritemas difusos."
                },
                security: {
                    title: "Seguridad de Datos",
                    desc: "Cifrado de extremo a extremo conforme a las normas HIPAA y GDPR."
                },
                radar: {
                    title: "Análisis Capilar",
                    desc: "Examen dermatológico del cuero cabelludo para detectar inflamaciones y anomalías."
                },
                scales: {
                    title: "Análisis Escamoso",
                    desc: "Zona T y Frente: Evaluación de la descamación y sequedad cutánea."
                },
                scalp: {
                    title: "Análisis Corporal",
                    desc: "Espalda y Tronco: Detección y seguimiento de lesiones en zonas de difícil acceso."
                }
            },
            protocol: {
                title: "Protocolo Clínico",
                subtitle: "Proceso de 4 fases",
                step1: { title: "Anamnesis", desc: "Interrogatorio clínico estructurado para definir el terreno y el historial sintomático." },
                step2: { title: "Adquisición", desc: "Captura digital de alta definición de marcadores visuales de la lesión." },
                step3: { title: "Correlación", desc: "Análisis cruzado de los datos declarativos y los síntomas observados." },
                step4: { title: "Orientación", desc: "Síntesis clínica exhaustiva y conexión con especialistas locales." }
            }
        },
        about: {
            title: "DermatoCheck — Análisis de Piel mediante Inteligencia Artificial con Fines Informativos",
            subtitle: "Apoyo tecnológico para tu observación dermatológica.",
            sections: [
                {
                    title: "DermatoCheck: Una Solución Digital de Apoyo",
                    text: "DermatoCheck es una solución digital de análisis de piel impulsada por inteligencia artificial que combina el análisis de imágenes cutáneas y un cuestionario dermatológico.\n\nNuestra tecnología observa parámetros de la piel a partir de fotografías e información declarativa, con un propósito informativo, educativo y de concienciación.\n\nDermatoCheck es una herramienta de asistencia — no es un servicio médico.\n\nNo se realiza ningún acto médico a través de esta plataforma."
                },
                {
                    title: "Tecnología Combinada: IA y Datos",
                    text: "DermatoCheck se basa en un enfoque combinado:\n\n• Análisis de la imagen: Nuestros algoritmos evalúan variaciones de color, contrastes, patrones visuales y características de la superficie.\n\n• Cuestionario dermatológico: El usuario aporta la antigüedad de la lesión, evolución percibida, síntomas e historial general."
                },
                {
                    title: "¿Por qué Foto + Cuestionario?",
                    text: "La evaluación dermatológica se basa en múltiples dimensiones. Al combinar análisis visual, información y modelos estadísticos, aportamos una mayor precisión.\n\nSin embargo, esto nunca reemplaza un examen presencial o un diagnóstico de un profesional médico."
                },
                {
                    title: "Herramienta Informativa, No Diagnóstica",
                    text: "DermatoCheck no proporciona:\n✖ Ningún diagnóstico médico\n✖ Ningún consejo médico personalizado\n✖ Ninguna receta\n✖ Ninguna recomendación de tratamiento\n✖ Ningún seguimiento médico\n\nLas informaciones están orientadas a informar al usuario. Cualquier decisión médica debe tomarla un profesional de la salud cualificado."
                },
                {
                    title: "Limitaciones Técnicas",
                    text: "El análisis depende de la calidad de la foto. \n\n➜ La ausencia de alerta no significa ausencia de patología. Algunas afecciones no se pueden detectar por foto."
                },
                {
                    title: "Nuestra Misión",
                    text: "Queremos fomentar la observación, mejorar la concienciación e invitar a la consulta médica ante la duda."
                },
                {
                    title: "Responsabilidad y Datos",
                    text: "El usuario asume los límites tecnológicos. Tus datos son tratados de forma segura."
                }
            ],
            warning: "AVISO MÉDICO IMPORTANTE: DermatoCheck no es un médico. No reemplaza a una cita profesional. Consulta a un médico ante cualquier dolor, cambio o duda."
        },
        faq: {
            title: "Preguntas Frecuentes",
            subtitle: "Encuentra respuestas a tus preguntas sobre DermatoCheck",
            categories: {
                usage: "Instrucciones de uso",
                technology: "Tecnología",
                security: "Seguridad y Privacidad",
                accuracy: "Precisión y Limitaciones"
            },
            questions: {
                q1: {
                    question: "¿Cómo usar DermatoCheck?",
                    answer: "Es sencillo: (1) Haz clic en 'Iniciar Análisis', (2) Responde al cuestionario, (3) Sube fotos si se te pide, (4) Recibe un informe."
                },
                q2: {
                    question: "¿Puedo usarlo para otra persona?",
                    answer: "Sí. Al empezar puedes seleccionar si es para 'Mí mismo' o 'Otra persona'."
                },
                q3: {
                    question: "¿Qué fotos debo subir?",
                    answer: "Para un mejor análisis, envía fotos nítidas con buena luz."
                }
            }
        },
        legal: {
            title: "AVISO LEGAL Y SEGURIDAD",
            sections: [
                { title: "LIMITACIÓN DE RESPONSABILIDAD MÉDICA", text: "**IMPORTANTE: DERMATO-CHECK NO ES UN MÉDICO Y NO SUSTITUYE A UN PROFESIONAL.**\n\nEsta es una herramienta informativa. No es un diagnóstico." },
                { title: "OBLIGACIÓN DE CONSULTA", text: "El uso de la app no te exime de ver a un especialista en persona." },
                { title: "PROTECCIÓN LEGAL", text: "Al usar la app, entiendes y aceptas nuestros términos de no responsabilidad." }
            ],
            warning: "Al utilizar esta aplicación aceptas nuestros Términos de Servicio."
        },
        consent: {
            title: "Tu Privacidad Importa",
            description: "DermatoCheck utiliza inteligencia artificial y tecnologías digitales para analizar imágenes de la piel con fines informativos.\nAntes de continuar, por favor confirma tu consentimiento.",
            checkboxes: {
                analysis: "Acepto el análisis automatizado de mis imágenes por inteligencia artificial con fines informativos, y entiendo que DermatoCheck no reemplaza a un médico para ninguna decisión médica.",
                cookies: "Acepto el uso de cookies y tecnologías similares para mejorar la experiencia del usuario, analizar el tráfico y mantener la seguridad de la plataforma."
            },
            buttons: {
                decline: "Rechazar",
                accept: "Aceptar y Continuar"
            },
            footer: "Tus datos permanecen seguros y no conceden acceso a tu información en otras aplicaciones o sitios web.\nPara más detalles, consulta nuestra Política de Privacidad."
        },
        minors: {
            title: "Bienvenido a",
            subtitle: "Para personalizar tu experiencia, por favor indica tu perfil.",
            adult: "Soy mayor de edad",
            minor: "Soy menor de edad"
        },
        contact: {
            title: "Contáctanos",
            name: "Tu Nombre",
            email: "Tu Correo Electrónico",
            message: "Mensaje",
            send: "Enviar Mensaje",
            success: "Mensaje enviado con éxito."
        },
        analysis: {
            title: "Análisis Dermatológico",
            subtitle: "Responde algunas preguntas visuales.",
            highlight: "Precisión clínica, simplicidad absoluta.",
            warning_popup: {
                title: "ADVERTENCIA MÉDICA PREVIA",
                text1: "DermatoCheck es una herramienta de análisis ÚNICAMENTE INFORMATIVA.",
                text2: "Los resultados proporcionados por la IA NO CONSTITUYEN UN DIAGNÓSTICO MÉDICO.",
                text3: "En caso de duda, evolución de una lesión o dolor, CONSULTE A UN MÉDICO.",
                close: "Entiendo, continuar"
            },
            target: "¿PARA QUIÉN ES ESTE ANÁLISIS?",
            myself: "Mí mismo",
            other: "Otra persona",
            start_error: "Error inesperado al iniciar.",
            loading: "Análisis DermatoCheck en progreso...",
            retry: "Reintentar análisis",
            error_title: "Análisis Interrumpido",
            config_required: "Configuración requerida",
            age_error: "Por favor, indique una edad válida (número entero entre 18 y 120).",
            age_error_child: "Por favor, indique una edad válida en años y/o meses.",
            number_error: "Por favor ingresa un número válido (ej: 3) sin texto.",
            interrupted: "Análisis Interrumpido",
            reset_popup: {
                title: "Confirmar reinicio",
                text: "¿Estás seguro de que quieres reiniciar la consulta? Todas las respuestas actuales se perderán.",
                confirm: "Sí, reiniciar",
                cancel: "No, cancelar"
            },
            validation_popup: {
                title: "Opción Incorrecta",
                close: "Comprendido"
            },
            restart_tooltip: "Reiniciar análisis",
            age_error_adult: "Basado en tu respuesta 'Mí mismo', debes tener al menos 18 años para usar este servicio. Si eres menor, por favor pide a un padre o tutor que realice el análisis en la opción 'Otra persona'.",
            select_age: "Selecciona tu edad",
            age_prompt: "Por favor indica tu edad."
        },
        blog: {
            title: "Blog Dermatológico",
            subtitle: "Consejos de expertos e información científica para el cuidado de la piel",
            categories: {
                all: "Todos los artículos",
                skincare: "Cuidado de la piel",
                conditions: "Condiciones de la piel",
                prevention: "Prevención"
            },
            read_time: "min de lectura",
            read_article: "Leer el artículo",
            no_articles: "No hay artículos en esta categoría por el momento.",
            not_found: "Artículo no encontrado",
            back: "Volver al blog",
            see_all: "Ver todos los artículos"
        },
        dermatologist: {
            title: "Encontrar un Dermatólogo",
            description: "Usa nuestra herramienta para localizar especialistas cerca de ti. Un profesional es indispensable.",
            choose_method: "Elige un método para localizar:",
            around_me: {
                title: "A mi alrededor",
                description: "Usa tu ubicación actual para especialistas en un radio de 10-15 km.",
                button: "Encontrar cercanos",
                loading: "Localizando..."
            },
            by_city: {
                title: "Por país y ciudad",
                description: "Entrada manual",
                country_placeholder: "País",
                city_placeholder: "Ciudad",
                other_city: "Otra (escribir)",
                matches_nothing: "Otra...",
                input_placeholder: "Nombre de la ciudad...",
                button: "Buscar"
            },
            errors: {
                geo_not_supported: "La geolocalización no está soportada.",
                geo_denied: "Permiso denegado.",
                geo_unavailable: "Imposible recuperar tu posición.",
                generic: "Fallo al buscar."
            },
            list: {
                loading_title: "Análisis en curso",
                loading_desc: "Buscando dermatólogos...",
                results_nearby: "Resultados cercanos ({count})",
                results: "Resultados ({count})",
                distance: "{km} km de ti",
                visit_website: "Sitio web",
                get_directions: "Cómo llegar",
                call: "Llamar",
                no_results: "No hay resultados.",
                no_results_desc: "Intenta otra ciudad.",
                interrupted: "Búsqueda Interrumpida",
                traffic_overload: "Servicio sobrecargado. Intenta de nuevo."
            }
        },
        footer: {
            about: "Acerca de",
            legal: "Legal",
            contact: "Contacto",
            faq: "Preguntas frecuentes",
            copyright: "© 2026 DermatoCheck. Todos los derechos reservados.",
            tagline: "Tu salud cutánea, nuestra prioridad"
        },
        find_dermatologist: {
            title: "Encuentra un Dermatólogo",
            subtitle: "Localiza a los mejores especialistas cerca de ti. Resultados generados por la Inteligencia Artificial de Google Maps.",
            search_placeholder: "Buscar por país o ciudad...",
            search_button: "Buscar Especialistas",
            use_location: "Usar mi ubicación",
            location_error: "Por favor permite el acceso a la ubicación en tu navegador.",
            no_results: "No se encontraron dermatólogos para esta búsqueda.",
            results_found: "Dermatólogo(s) Encontrado(s)",
            proximity_title: "Prioridad Proximidad",
            proximity_desc: "Resultados ordenados por distancia",
            verified_title: "Especialistas Verificados",
            verified_desc: "Certificaciones validadas",
            ai_title: "Desarrollado por Google AI",
            ai_desc: "Búsqueda contextual inteligente",
            warning_title: "Resultados Generados por IA",
            warning_text: "Ten en cuenta: Estos resultados son generados por Google Maps AI y pueden incluir inexactitudes. Por favor, verifica la información de contacto.",
            location_modal: {
                title: "Acceso a la Ubicación Necesario",
                message: "Por favor permite el acceso a tu ubicación en tu navegador.",
                allow: "Sí, usar mi ubicación",
                deny: "No, escribiré mi ciudad"
            }
        },
        auth: {
            login_title: "Iniciar Sesión",
            login_subtitle: "Accede a tu espacio personal",
            signup_title: "Crear Cuenta",
            signup_subtitle: "Únete a DermatoCheck hoy mismo",
            tab_login: "Iniciar Sesión",
            tab_signup: "Registrarse",
            name: "Nombre Completo",
            name_placeholder: "Tu nombre...",
            email: "Correo Electrónico",
            email_placeholder: "tu@email.com",
            password: "Contraseña",
            password_placeholder: "••••••••",
            confirm_password: "Confirmar Contraseña",
            confirm_password_placeholder: "••••••••",
            forgot_password: "¿Olvidaste tu contraseña?",
            login_button: "Iniciar Sesión",
            signup_button: "Crear Cuenta",
            or: "o",
            google: "Continuar con Google",
            have_account: "¿Ya tienes una cuenta?",
            no_account: "¿No tienes cuenta?",
            login_success: "¡Inicio de sesión exitoso!",
            signup_success: "¡Cuenta creada exitosamente!",
            switch_to_minor: "Cambiar al Modo Menor",
            switch_to_adult: "Cambiar al Modo Adulto",
            profile_adult: "Modo Adulto",
            profile_minor: "Modo Menor"
        },
        profile: {
            title: "Mi Perfil",
            logout: "Cerrar Sesión",
            history_title: "Historial de Análisis",
            analyzed_on: "Analizado el",
            result: "Resultado del Análisis",
            no_notes: "No se añadieron notas.",
            empty_title: "Sin análisis",
            empty_desc: "Tus futuros análisis aparecerán aquí. Empieza realizando tu primer análisis.",
            start: "Iniciar Análisis",
            loading: "Cargando..."
        }
    }
};
