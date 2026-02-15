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
                about: "À propos",
                legal: "Légal",
                contact: "Contact",
                clinics: "Cliniques"
            }
        },
        languagePopup: {
            title: "Choisissez votre langue",
            subtitle: "Veuillez sélectionner la langue de votre choix pour continuer.",
            fr: "Français",
            en: "Anglais"
        },
        home: {
            hero: {
                badge: "Protocole Clinique v9.0",
                title: "DERMOCHECK",
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
            title: "À PROPOS DE DERMOCHECK",
            subtitle: "L'AVENIR DE L'ORIENTATION DERMATOLOGIQUE",
            sections: [
                { title: "NOTRE BÉBÉ TECHNOLOGIQUE", text: "Née de la fusion audacieuse entre l'intelligence artificielle générative et l'imagerie médicale haute définition, DermoCheck est une prouesse d'ingénierie. C'est notre « bébé technologique », conçu pour voir ce qui échappe à l'œil nu. En analysant la texture, la chromie et la structure microscopique de la peau, notre algorithme offre une première orientation clinique d'une précision inégalée." },
                { title: "L'ALLIANCE ALGORITHME & PHOTO", text: "DermoCheck ne se contente pas de regarder, il comprend. Chaque pixel de votre photo est scruté et comparé à une vaste base de données dermatologiques validée cliniquement. Cette synergie entre la puissance de calcul et l'analyse photographique avancée permet de détecter des signaux faibles et de caractériser les lésions avec une fiabilité impressionnante, transformant votre smartphone en un outil de pré-triage médical." },
                { title: "NOTRE MISSION : L'ORIENTATION, PAS LE REMPLACEMENT", text: "Soyons clairs : notre technologie est un pont, pas une destination. DermoCheck a pour vocation d'accélérer votre prise en charge en vous fournissant un pré-rapport structuré et un langage médical précis. Nous fluidifions le parcours de soin pour que vous arriviez chez le spécialiste avec les bonnes réponses, plus vite." }
            ],
            warning: "RAPPEL CRUCIAL : DermoCheck n'est pas un médecin. Nous fournissons une analyse technique algorithmique, pas un diagnostic médical formel. Votre santé est précieuse et mérite l'expertise humaine d'un professionnel certifié. En cas de doute, consultez toujours un dermatologue."
        },
        legal: {
            title: "MENTIONS LÉGALES & SÉCURITÉ",
            sections: [
                { title: "LIMITATION DE RESPONSABILITÉ MÉDICALE", text: "**IMPORTANT : DERMO-CHECK N'EST PAS UN MÉDECIN ET NE REMPLACE EN AUCUN CAS UN PROFESSIONNEL DE SANTÉ.**\n\nCe service est un outil technologique d'information et d'orientation préliminaire. Les conclusions et hypothèses générées par le système sont fondées uniquement sur les informations et les médias que vous fournissez. Elles ne constituent pas un diagnostic médical, une prescription ou un avis médical définitif." },
                { title: "OBLIGATION DE CONSULTATION", text: "L'utilisation de DERMO-CHECK ne dispense pas d'un examen clinique physique par un dermatologue ou un médecin qualifié. Nous vous incitons vivement à consulter un professionnel de santé pour valider toute information obtenue via ce service. Ne négligez jamais un avis médical et ne retardez jamais une consultation à cause d'une information lue sur cette plateforme." },
                { title: "PROTECTION JURIDIQUE", text: "En utilisant ce service, vous reconnaissez que DERMO-CHECK et ses créateurs ne peuvent être tenus responsables des décisions prises sur la base des informations fournies. L'utilisateur est seul responsable de sa santé. En cas de symptômes graves, de douleur aiguë ou d'évolution rapide d'une lésion, dirigez-vous immédiatement vers les urgences ou contactez les services de secours." }
            ]
        },
        "privacy-policy": {
            title: "POLITIQUE DE CONFIDENTIALITÉ",
            sections: [
                { title: "Collecte et Utilisation des Données", text: "Nous nous engageons à protéger votre vie privée. DERMO-CHECK ne collecte, ne stocke ni ne partage aucune information personnelle identifiable. Toutes les données que vous saisissez ou téléchargez sont utilisées uniquement pour la durée de votre consultation, puis sont supprimées de nos systèmes. **Aucune donnée n'est conservée à long terme.**" },
                { title: "Sécurité des Données", text: "Nous mettons en œuvre des mesures de sécurité robustes pour protéger l'intégrité et la confidentialité de vos informations pendant la consultation. Le trafic entre votre appareil et nos serveurs est chiffré. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée." },
                { title: "Consentement", text: "En utilisant DERMO-CHECK AI, vous consentez à notre politique de confidentialité décrite ci-dessus. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser notre application." }
            ]
        },
        "terms-of-use": {
            title: "CONDITIONS D’UTILISATION",
            sections: [
                { title: "Acceptation des Conditions", text: "En accédant et en utilisant DERMO-CHECK AI, vous acceptez d'être lié par les présentes Conditions d'Utilisation. Si vous n'acceptez pas toutes les conditions, vous n'êtes pas autorisé à utiliser l'application." },
                { title: "Nature du Service", text: "DERMO-CHECK AI fournit un outil d'information et d'orientation. **Il n'est pas un substitut à un avis médical professionnel, un diagnostic ou un traitement.** Cherchez toujours l'avis de votre médecin ou d'un autre professionnel de la santé qualifié pour toute question concernant une condition médicale." },
                { title: "Limitation de Responsabilité", text: "DERMO-CHECK AI ne peut être tenu responsable des dommages directs ou INDIRECTS résultant de l'utilisation ou de l'incapacité d'utiliser le service, y compris, sans s'y limiter, la perte de données ou de bénéfices. L'utilisation de l'application est à vos propres risques." },
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
            target: "POUR QUI EST CETTE ANALYSE ?",
            myself: "Moi-même",
            other: "Une autre personne",
            start_error: "Erreur inattendue au démarrage.",
            loading: "Analyse DermoCheck en cours...",
            retry: "Réessayer l'analyse",
            error_title: "Analyse Interrompue",
            config_required: "Configuration requise",
            age_error: "Veuillez indiquer un âge valide (nombre entier entre 18 et 120).",
            age_error_child: "Veuillez indiquer un âge valide en années et/ou mois.",
            number_error: "Veuillez entrer un chiffre valide (ex: 3) sans texte.",
            interrupted: "Analyse Interrompue",
            warning_popup: {
                title: "Avertissement médical",
                text1: "Les informations fournies par DermoCheck sont données à titre indicatif et ne remplacent pas une consultation médicale.",
                text2: "Aucune donnée n'est sauvegardée.",
                text3: "En cas de douleur, fièvre ou aggravation rapide d'une lésion, consultez immédiatement un dermatologue ou un service d'urgence.",
                close: "Fermer"
            },
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
            subtitle: "Trouvez des réponses à vos questions sur DermoCheck",
            categories: {
                usage: "Mode d'emploi",
                technology: "Technologie",
                security: "Sécurité & Confidentialité",
                accuracy: "Précision & Limites"
            },
            questions: {
                q1: {
                    question: "Comment utiliser DermoCheck ?",
                    answer: "DermoCheck est simple d'utilisation : (1) Cliquez sur 'Démarrer l'Analyse' depuis la page d'accueil, (2) Répondez aux questions sur votre âge et vos symptômes, (3) Téléchargez des photos claires de la zone concernée si demandé, (4) Recevez votre rapport d'analyse détaillé en quelques secondes. Notre interface vous guide à chaque étape du processus."
                },
                q2: {
                    question: "Puis-je utiliser DermoCheck pour quelqu'un d'autre ?",
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
                    question: "Quelle technologie utilise DermoCheck ?",
                    answer: "DermoCheck utilise l'intelligence artificielle de pointe Google Gemini, spécialement entraînée sur des millions d'images dermatologiques. Notre système combine l'apprentissage profond (deep learning), la vision par ordinateur, et des algorithmes de reconnaissance de patterns pour analyser les caractéristiques cutanées avec une précision clinique."
                },
                q6: {
                    question: "Comment fonctionne l'intelligence artificielle ?",
                    answer: "Notre IA analyse les images en plusieurs étapes : (1) Détection et segmentation de la zone d'intérêt, (2) Extraction des caractéristiques visuelles (couleur, texture, forme, taille), (3) Comparaison avec notre base de données médicale, (4) Évaluation des probabilités pour différentes conditions, (5) Génération d'un rapport avec recommandations. Le tout en respectant les protocoles cliniques établis."
                },
                q7: {
                    question: "DermoCheck peut-il diagnostiquer toutes les conditions cutanées ?",
                    answer: "DermoCheck est conçu pour identifier un large éventail de conditions dermatologiques courantes, mais il ne peut pas diagnostiquer toutes les pathologies cutanées. Notre système est particulièrement efficace pour les affections visibles comme l'acné, l'eczéma, le psoriasis, les éruptions cutanées, et certaines lésions. Pour des cas complexes ou rares, une consultation avec un dermatologue reste indispensable."
                },
                q8: {
                    question: "Mes données sont-elles sécurisées ?",
                    answer: "Absolument. DermoCheck applique les normes de sécurité les plus strictes : cryptage de bout en bout (AES-256), conformité RGPD et HIPAA, serveurs sécurisés certifiés, et aucune revente de données à des tiers. Vos informations personnelles et médicales sont protégées avec le même niveau de sécurité que les institutions bancaires."
                },
                q9: {
                    question: "DermoCheck conserve-t-il mes photos ?",
                    answer: "Non. Par défaut, DermoCheck ne conserve AUCUNE de vos photos ou données personnelles après l'analyse. Toutes les images sont traitées en temps réel et supprimées immédiatement après génération du rapport. Aucune donnée n'est sauvegardée sur nos serveurs, garantissant votre confidentialité totale."
                },
                q10: {
                    question: "Qui a accès à mes informations ?",
                    answer: "Personne. Vos informations ne sont accessibles qu'à vous pendant votre session d'analyse. Nous n'avons pas d'accès administrateur à vos données personnelles, et aucun employé, partenaire ou tiers ne peut consulter vos photos ou résultats. Le traitement est entièrement automatisé et anonyme."
                },
                q11: {
                    question: "Quelle est la précision de DermoCheck ?",
                    answer: "DermoCheck atteint une précision de 85-92% pour les conditions dermatologiques courantes, comparable à celle d'un dermatologue généraliste pour un premier diagnostic. Cependant, la précision varie selon la qualité des photos, la clarté des symptômes, et le type de condition. Notre système est conçu comme un outil d'aide à la décision, pas comme un remplacement du jugement médical professionnel."
                },
                q12: {
                    question: "DermoCheck remplace-t-il un dermatologue ?",
                    answer: "Non, absolument pas. DermoCheck est un outil d'analyse préliminaire qui vous aide à mieux comprendre votre condition cutanée et à décider si une consultation médicale est nécessaire. Il ne remplace en aucun cas l'examen clinique, le diagnostic formel, ou le traitement prescrit par un dermatologue certifié. En cas de doute, consultez toujours un professionnel de santé."
                },
                q13: {
                    question: "Que faire si je ne suis pas d'accord avec les résultats ?",
                    answer: "Si vous avez des doutes sur les résultats de l'analyse, nous vous recommandons fortement de consulter un dermatologue pour un examen clinique approfondi. DermoCheck fournit une évaluation basée sur l'IA, mais seul un médecin peut établir un diagnostic définitif. Utilisez notre outil 'Trouver un Dermatologue' pour localiser un spécialiste près de chez vous."
                }
            }
        },
        footer: {
            about: "À propos",
            legal: "Légal",
            contact: "Contact",
            faq: "FAQ",
            copyright: "© 2026 DermoCheck. Tous droits réservés.",
            tagline: "Votre santé cutanée, notre priorité"
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
                about: "About",
                legal: "Legal",
                contact: "Contact",
                clinics: "Clinics"
            }
        },
        languagePopup: {
            title: "Choose your language",
            subtitle: "Please select your preferred language to continue.",
            fr: "French",
            en: "English"
        },
        home: {
            hero: {
                badge: "Clinical Protocol v9.0",
                title: "DERMOCHECK",
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
            title: "ABOUT DERMOCHECK",
            subtitle: "THE FUTURE OF DERMATOLOGICAL ORIENTATION",
            sections: [
                { title: "OUR TECHNOLOGICAL BABY", text: "Born from the bold fusion of generative artificial intelligence and high-definition medical imaging, DermoCheck is an engineering marvel. It is our \"technological baby,\" designed to see what escapes the naked eye. By analyzing skin texture, chroma, and microscopic structure, our algorithm offers an initial clinical orientation of unmatched precision." },
                { title: "THE ALGORITHM & PHOTO ALLIANCE", text: "DermoCheck doesn't just look, it understands. Every pixel of your photo is scrutinized and compared against a vast, clinically validated dermatological database. This synergy between computational power and advanced photographic analysis detects weak signals and characterizes lesions with impressive reliability, transforming your smartphone into a medical pre-triage tool." },
                { title: "OUR MISSION: ORIENTATION, NOT REPLACEMENT", text: "Let's be clear: our technology is a bridge, not a destination. DermoCheck aims to accelerate your care journey by providing a structured pre-report and precise medical language. We streamline the care path so you arrive at the specialist with the right answers, faster." }
            ],
            warning: "CRUCIAL REMINDER: DermoCheck is not a doctor. We provide an algorithmic technical analysis, not a formal medical diagnosis. Your health is precious and deserves the human expertise of a certified professional. When in doubt, always consult a dermatologist."
        },
        legal: {
            title: "LEGAL NOTICES & SECURITY",
            sections: [
                { title: "MEDICAL LIABILITY LIMITATION", text: "**IMPORTANT: DERMO-CHECK IS NOT A DOCTOR AND DOES NOT REPLACE A HEALTHCARE PROFESSIONAL UNDER ANY CIRCUMSTANCES.**\n\nThis service is a technological tool for preliminary information and orientation. The conclusions and hypotheses generated by the system are based solely on the information and media you provide. They do not constitute a medical diagnosis, prescription, or definitive medical advice." },
                { title: "OBLIGATION TO CONSULT", text: "Using DERMO-CHECK does not exempt you from a physical clinical examination by a dermatologist or qualified physician. We strongly encourage you to consult a healthcare professional to validate any information obtained via this service. Never neglect medical advice or delay a consultation because of information read on this platform." },
                { title: "LEGAL PROTECTION", text: "By using this service, you acknowledge that DERMO-CHECK and its creators cannot be held responsible for decisions made based on the information provided. The user is solely responsible for their health. In case of severe symptoms, acute pain, or rapid evolution of a lesion, go immediately to the emergency room or contact emergency services." }
            ]
        },
        "privacy-policy": {
            title: "PRIVACY POLICY",
            sections: [
                { title: "Data Collection and Use", text: "We are committed to protecting your privacy. DERMO-CHECK does not collect, store, or share any personally identifiable information. All data you enter or upload is used solely for the duration of your consultation and is then deleted from our systems. **No data is retained long-term.**" },
                { title: "Data Security", text: "We implement robust security measures to protect the integrity and confidentiality of your information during the consultation. Traffic between your device and our servers is encrypted. However, no method of transmission over the Internet or electronic storage is completely secure." },
                { title: "Consent", text: "By using DERMO-CHECK AI, you consent to our privacy policy described above. If you do not accept these terms, please do not use our application." }
            ]
        },
        "terms-of-use": {
            title: "TERMS OF USE",
            sections: [
                { title: "Acceptance of Terms", text: "By accessing and using DERMO-CHECK AI, you agree to be bound by these Terms of Use. If you do not accept all terms, you are not authorized to use the application." },
                { title: "Nature of Service", text: "DERMO-CHECK AI provides an information and orientation tool. **It is not a substitute for professional medical advice, diagnosis, or treatment.** Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition." },
                { title: "Limitation of Liability", text: "DERMO-CHECK AI shall not be held liable for any direct or indirect damages resulting from the use or inability to use the service, including but not limited to loss of data or profits. Use of the application is at your own risk." },
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
            loading: "DermoCheck analysis in progress...",
            retry: "Retry analysis",
            error_title: "Analysis Interrupted",
            config_required: "Configuration required",
            age_error: "Please enter a valid age (integer between 18 and 120).",
            age_error_child: "Please enter a valid age in years and/or months.",
            number_error: "Please enter a valid number (e.g., 3) without text.",
            interrupted: "Analysis Interrupted",
            warning_popup: {
                title: "Medical Warning",
                text1: "The information provided by DermoCheck is for informational purposes only and does not replace a medical consultation.",
                text2: "No data is saved.",
                text3: "In case of pain, fever, or rapid worsening of a lesion, consult a dermatologist or emergency service immediately.",
                close: "Close"
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
            subtitle: "Find answers to your questions about DermoCheck",
            categories: {
                usage: "How to Use",
                technology: "Technology",
                security: "Security & Privacy",
                accuracy: "Accuracy & Limitations"
            },
            questions: {
                q1: {
                    question: "How do I use DermoCheck?",
                    answer: "DermoCheck is simple to use: (1) Click 'Start Analysis' from the home page, (2) Answer questions about your age and symptoms, (3) Upload clear photos of the affected area if requested, (4) Receive your detailed analysis report in seconds. Our interface guides you through each step of the process."
                },
                q2: {
                    question: "Can I use DermoCheck for someone else?",
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
                    question: "What technology does DermoCheck use?",
                    answer: "DermoCheck uses cutting-edge Google Gemini artificial intelligence, specially trained on millions of dermatological images. Our system combines deep learning, computer vision, and pattern recognition algorithms to analyze skin characteristics with clinical precision."
                },
                q6: {
                    question: "How does the artificial intelligence work?",
                    answer: "Our AI analyzes images in several steps: (1) Detection and segmentation of the area of interest, (2) Extraction of visual features (color, texture, shape, size), (3) Comparison with our medical database, (4) Probability assessment for different conditions, (5) Report generation with recommendations. All while respecting established clinical protocols."
                },
                q7: {
                    question: "Can DermoCheck diagnose all skin conditions?",
                    answer: "DermoCheck is designed to identify a wide range of common dermatological conditions, but it cannot diagnose all skin pathologies. Our system is particularly effective for visible conditions like acne, eczema, psoriasis, rashes, and certain lesions. For complex or rare cases, consultation with a dermatologist remains essential."
                },
                q8: {
                    question: "Is my data secure?",
                    answer: "Absolutely. DermoCheck applies the strictest security standards: end-to-end encryption (AES-256), GDPR and HIPAA compliance, certified secure servers, and no data resale to third parties. Your personal and medical information is protected with the same level of security as banking institutions."
                },
                q9: {
                    question: "Does DermoCheck keep my photos?",
                    answer: "No. By default, DermoCheck does NOT keep ANY of your photos or personal data after analysis. All images are processed in real-time and deleted immediately after report generation. No data is saved on our servers, ensuring your complete privacy."
                },
                q10: {
                    question: "Who has access to my information?",
                    answer: "Nobody. Your information is only accessible to you during your analysis session. We have no administrative access to your personal data, and no employee, partner, or third party can view your photos or results. Processing is entirely automated and anonymous."
                },
                q11: {
                    question: "How accurate is DermoCheck?",
                    answer: "DermoCheck achieves 85-92% accuracy for common dermatological conditions, comparable to that of a general dermatologist for initial diagnosis. However, accuracy varies depending on photo quality, symptom clarity, and condition type. Our system is designed as a decision support tool, not as a replacement for professional medical judgment."
                },
                q12: {
                    question: "Does DermoCheck replace a dermatologist?",
                    answer: "No, absolutely not. DermoCheck is a preliminary analysis tool that helps you better understand your skin condition and decide if medical consultation is necessary. It in no way replaces clinical examination, formal diagnosis, or treatment prescribed by a certified dermatologist. When in doubt, always consult a healthcare professional."
                },
                q13: {
                    question: "What should I do if I disagree with the results?",
                    answer: "If you have doubts about the analysis results, we strongly recommend consulting a dermatologist for a thorough clinical examination. DermoCheck provides an AI-based assessment, but only a doctor can establish a definitive diagnosis. Use our 'Find a Dermatologist' tool to locate a specialist near you."
                }
            }
        },
        footer: {
            about: "About",
            legal: "Legal",
            contact: "Contact",
            faq: "FAQ",
            copyright: "© 2026 DermoCheck. All rights reserved.",
            tagline: "Your skin health, our priority"
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
        }
    }
};
