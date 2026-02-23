
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Message, GeminiContent, GeminiTextPart, GeminiImagePart, PageConfig } from './types';
import { generateResponse, fileToGenerativePart } from './services/geminiService'; // Removed analyzeVideo
import ChatMessage from './components/ChatMessage';
import OptionButton from './components/OptionButton';
import FileUpload from './components/FileUpload';
import { BackArrowIcon, RedoIcon } from './components/icons';
import { Tooltip } from './components/Tooltip';
import TextInput from './components/TextInput';
import MultiChoiceOptions from './components/MultiChoiceOptions';
import AgeDropdown from './components/AgeDropdown'; // Import AgeDropdown
import CountryDropdown from './components/CountryDropdown'; // Import CountryDropdown
import AgeMonthYearDropdown from './components/AgeMonthYearDropdown'; // New: Import AgeMonthYearDropdown
import { getSystemInstruction } from './constants'; // To extract notice/warning
import { useLanguage } from './context/LanguageContext';
import { supabase } from './services/supabaseClient';

interface QuestionnaireProps {
    config: PageConfig;
}

// Recalculating the total number of user-input stages based on constants.ts systemInstruction:
// 0. IDENTITÉ ET ÂGE: 6 stages (Concerne, Age/Combo/Dropdown, Sexe, Enceinte, Allaite, Pays)
// 1. LOCALISATION DES LÉSIONS: up to 2 steps (Où + Autre_préciser)
// 2. ANCIENNETÉ ET ÉVOLUTION: up to 3 steps (Depuis quand + Comment évolué + Autre_préciser)
// 3. MORPHOLOGIE: up to 3 steps (Description + Unique/Plusieurs if "Bouton" + Autre_préciser)
// 4. SYMPTÔMES: up to 2 steps (Symptômes + Autre_préciser)
// 5. DESCRIPTION LIBRE: 2 steps (Apparue au début + Évolution maintenant)
// 6. TRAITEMENTS / PRODUITS: 1 step
// 7. ALIMENTATION: up to 2 steps (Alimentation + Autre_préciser)
// 8. ANTÉCÉDENTS: up to 3 steps (Antécédents + Antécédents familiaux préciser + Autre_préciser)
// 9. ENVIRONNEMENT ET HYGIÈNE DE VIE: up to 3 steps (Facteurs + Autre_préciser + Voyages récents préciser)
// 10. MÉDIA (Photo): 1 step
// Total maximum potential unique user inputs: 6 + 2 + 3 + 3 + 2 + 2 + 1 + 2 + 3 + 3 + 1 = 28 stages
const TOTAL_QUESTIONNAIRE_STAGES = 28;

// Constants for age validation, matching the AgeDropdown component
const MIN_VALID_AGE = 18;
const MAX_VALID_AGE = 120;

const Questionnaire: React.FC<QuestionnaireProps> = ({ config }) => {
    const { t, language } = useLanguage();
    const [currentAssistantMessage, setCurrentAssistantMessage] = useState<Message | null>(null);

    // ... (rest of state)

    // Helper to extract warnings from system instruction
    const extractSystemNotices = useCallback(() => {
        const fullInstruction = getSystemInstruction(language);
        // The prompt no longer contains a distinct "NOTICE AVANT QUESTIONNAIRE" section,
        // so we only extract the persistent medical warning.
        const medicalWarningMatch = fullInstruction.match(language === 'fr' ? /⚠️ AVERTISSEMENT MÉDICAL \(.+\)\n"([^"]+)"/ : /⚠️ MEDICAL WARNING \(.+\)\n"([^"]+)"/);

        const warning = medicalWarningMatch ? medicalWarningMatch[1].replace(/\\n/g, '\n') : '';

        return { notice: '', warning }; // Return empty notice as it's not present
    }, [language]); // Depend on language
    const [apiHistory, setApiHistory] = useState<GeminiContent[]>([]
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isGameOver, setIsGameOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFailedAction, setLastFailedAction] = useState<{ userText: string; imageFiles?: File[] | null; } | null>(null); // Removed videoFile
    // Fix: Corrected useState type definition for `consultationType`
    const [consultationType, setConsultationType] = useState<'self' | 'other' | null>(null);
    const [awaitingNumberInputForOption, setAwaitingNumberInputForOption] = useState<string | null>(null);
    const [showResetConfirmation, setShowResetConfirmation] = useState(false); // New state for reset confirmation
    const [showInitialWarningPopup, setShowInitialWarningPopup] = useState(true); // State for the initial warning popup
    const [validationError, setValidationError] = useState<string | null>(null); // State for user-level validation errors
    const [mismatchWarning, setMismatchWarning] = useState<string | null>(null); // New state for AI visual inconsistency warning

    // Removed uploadedVideoFile and awaitingVideoQuestion states

    // Refs for focus management
    const containerRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLTextAreaElement>(null);
    const optionButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const fileUploadRef = useRef<HTMLDivElement>(null); // For the FileUpload component itself
    const ageDropdownRef = useRef<HTMLSelectElement>(null); // For AgeDropdown's select
    const ageMonthYearDropdownMonthsRef = useRef<HTMLSelectElement>(null); // For AgeMonthYearDropdown's months select
    const ageMonthYearDropdownYearsRef = useRef<HTMLSelectElement>(null); // For AgeMonthYearDropdown's years select
    const countryDropdownRef = useRef<HTMLSelectElement>(null); // For CountryDropdown's select
    const initialWarningModalRef = useRef<HTMLDivElement>(null); // Ref for the initial warning modal

    // ─── Stable refs to avoid stale closures ─────────────────────────────────
    // apiHistoryRef mirrors apiHistory so processUserAction always uses the latest value
    const apiHistoryRef = useRef<GeminiContent[]>([]);
    useEffect(() => { apiHistoryRef.current = apiHistory; }, [apiHistory]);

    // languageRef & tRef so initializeApp doesn't re-create (and restart!) on lang change
    const languageRef = useRef(language);
    const tRef = useRef(t);
    useEffect(() => { languageRef.current = language; tRef.current = t; }, [language, t]);

    // isProcessingRef: synchronous guard against double-submit race conditions
    // Unlike isLoading (async state), this is set/cleared synchronously
    const isProcessingRef = useRef(false);
    // ─────────────────────────────────────────────────────────────────────────

    // Function to disable/enable tabIndex for elements outside modal
    const toggleTabIndexForMainContent = useCallback((enable: boolean) => {
        const mainAppContainer = document.querySelector('.flex.flex-col.min-h-screen.font-sans'); // Select the main app container
        if (mainAppContainer) {
            const focusableElements = mainAppContainer.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            focusableElements.forEach(element => {
                if (element instanceof HTMLElement) {
                    if (enable) {
                        // Restore original tabIndex or remove it if it was not explicitly set
                        const originalTabIndex = element.dataset.originalTabIndex;
                        if (originalTabIndex) {
                            element.tabIndex = parseInt(originalTabIndex, 10);
                            delete element.dataset.originalTabIndex;
                        } else if (element.tabIndex === -1) {
                            // If it was set to -1 by the modal, but had no originalTabIndex, make it focusable by default
                            element.tabIndex = 0; // Default to focusable
                        }
                    } else {
                        // Only modify if it's currently focusable
                        if (element.tabIndex !== -1 && !element.hasAttribute('disabled')) {
                            element.dataset.originalTabIndex = element.tabIndex.toString(); // Store original
                            element.tabIndex = -1; // Make unfocusable
                        }
                    }
                }
            });
        }
    }, []);

    // Effect for managing focus after incoming message updates
    useEffect(() => {
        if (!isLoading && currentAssistantMessage && !showInitialWarningPopup) { // Only focus if warning is dismissed
            // Find the first interactive element and focus it
            let elementToFocus: HTMLElement | null = null;

            if (currentAssistantMessage.isPhotoRequest && fileUploadRef.current) {
                // Focus the 'Choisir média(s)' button within FileUpload
                elementToFocus = fileUploadRef.current.querySelector('button[aria-label^="Ajouter une image"]') as HTMLElement; // Changed text to match FileUpload
            } else if (currentAssistantMessage.isTextInputRequest) {
                elementToFocus = textInputRef.current;
            } else if (currentAssistantMessage.isComboInputRequest) {
                elementToFocus = ageMonthYearDropdownMonthsRef.current || ageMonthYearDropdownYearsRef.current;
            } else if (currentAssistantMessage.isAgeDropdownRequest) { // New: Focus age dropdown
                elementToFocus = ageDropdownRef.current;
            } else if (currentAssistantMessage.options && currentAssistantMessage.isMultiChoice) {
                elementToFocus = optionButtonsRef.current[0];
            } else if (currentAssistantMessage.options && !currentAssistantMessage.isMultiChoice) {
                elementToFocus = optionButtonsRef.current[0];
            } else if (currentAssistantMessage.text.includes("Dans quel pays résidez-vous ?")) {
                elementToFocus = countryDropdownRef.current;
            }

            if (elementToFocus) {
                elementToFocus.focus();
            } else if (containerRef.current) {
                // Fallback to the main container if no specific input found
                containerRef.current.focus();
            }
        }
    }, [isLoading, currentAssistantMessage, awaitingNumberInputForOption, consultationType, showInitialWarningPopup]); // Removed awaitingVideoQuestion from dependencies

    const parseAiResponse = useCallback((text: string, id: string): Message => {
        const photoRequestMatch = text.includes('[PHOTO_REQUEST]');
        const finalReportMatch = text.includes('[FINAL_REPORT]');
        const mismatchMatch = text.match(/\[WARNING_MISMATCH:\s*([\s\S]*?)\]/); // New: match mismatch warning
        // Updated regex to capture optional none button text
        const textInputMatch = text.match(/\[TEXT_INPUT(_WITH_NONE)?(?::([^:]+?))?(?::([^\]]+?))?\]/);
        const comboInputMatch = text.match(/\[COMBO_INPUT(?::([^\]]+?))?\]/); // New: Capture placeholder for combo input, non-greedy
        const ageDropdownMatch = text.match(/\[AGE_DROPDOWN:\s*(\d+)\s*:\s*(\d+)\s*\]/); // New: Match for age dropdown with min/max, tolerant of spaces
        const multiChoiceMatch = text.includes('[MULTI_CHOIX]');
        const singleChoiceMatch = text.includes('[CHOIX]');

        const isTextInputWithNone = !!(textInputMatch && textInputMatch[1]);
        const textInputPlaceholder = textInputMatch && textInputMatch[2] ? textInputMatch[2].trim() : undefined;
        const comboInputPlaceholder = comboInputMatch && comboInputMatch[1] ? comboInputMatch[1].trim() : undefined; // Fix: comboInputMatch[1] for placeholder

        const ageDropdownMin = ageDropdownMatch ? parseInt(ageDropdownMatch[1], 10) : undefined;
        const ageDropdownMax = ageDropdownMatch ? parseInt(ageDropdownMatch[2], 10) : undefined;


        let cleanText = text;
        let options: string[] | undefined;
        let isMultiChoice = false;
        let hasNoneButton = false;
        let noneButtonText: string | undefined;
        // Keywords that should be treated as a dedicated "None" button
        const noneKeywords = [
            // French
            "Je ne sais pas", "Aucun symptôme notable", "Aucun antécédent", "Aucun", "Aucun de ces facteurs", "Ignorer",
            // English
            "I don't know", "No notable symptoms", "No history", "None", "None of these factors", "Skip",
            // Dutch
            "Ik weet het niet", "Geen noemenswaardige symptomen", "Geen voorgeschiedenis", "Geen", "Geen van deze factoren", "Overslaan", "Sla deze stap over",
            // Spanish
            "No lo sé", "Sin síntomas notables", "Sin antecedentes médicos", "Ninguno", "Ninguno de estos factores", "Omitir", "Omitir este paso"
        ];

        // Extract specific noneButtonText for TEXT_INPUT_WITH_NONE if provided in the tag
        let noneButtonTextForTextInput: string | undefined;
        if (isTextInputWithNone) {
            noneButtonTextForTextInput = textInputMatch && textInputMatch[3] ? textInputMatch[3].trim() : "Ignorer cette étape";
        }

        if (photoRequestMatch || finalReportMatch) {
            cleanText = cleanText.replace(/\[(PHOTO_REQUEST|FINAL_REPORT)\]/g, '').trim();
        }
        if (mismatchMatch) {
            cleanText = cleanText.replace(/\[WARNING_MISMATCH:[\s\S]*?\]/g, '').trim();
        }
        if (textInputMatch) {
            // Updated to match the new regex for cleaning
            cleanText = cleanText.replace(/\[TEXT_INPUT(?:_WITH_NONE)?(?::[^:]+?)?(?::[^\]]+?)?\]/g, '').trim();
        }
        if (comboInputMatch) { // New: Clean text for combo input
            cleanText = cleanText.replace(/\[COMBO_INPUT(?::[^\]]+)?\]/g, '').trim();
        }
        if (ageDropdownMatch) { // New: Clean text for age dropdown
            cleanText = cleanText.replace(/\[AGE_DROPDOWN:\s*\d+\s*:\s*\d+\s*\]/g, '').trim();
        }

        if (multiChoiceMatch) {
            const parts = cleanText.split('[MULTI_CHOIX]');
            cleanText = parts[0].trim();
            const rawOptions = parts.slice(1).map(opt => opt.trim().replace(/\[.*?\]/g, ''));

            let tempOptions: string[] = [];
            let tempHasNoneButton = false;
            let tempNoneButtonText: string | undefined;

            for (const opt of rawOptions) {
                if (noneKeywords.includes(opt)) {
                    tempHasNoneButton = true;
                    tempNoneButtonText = opt;
                } else {
                    tempOptions.push(opt);
                }
            }
            options = tempOptions.length > 0 ? tempOptions : undefined;
            isMultiChoice = true;
            hasNoneButton = tempHasNoneButton;
            noneButtonText = tempNoneButtonText;

        } else if (singleChoiceMatch) {
            const parts = cleanText.split('[CHOIX]');
            cleanText = parts[0].trim();
            const rawOptions = parts.slice(1).map(opt => opt.trim().replace(/\[.*?\]/g, ''));

            let tempOptions: string[] = [];
            let tempHasNoneButton = false;
            let tempNoneButtonText: string | undefined;

            for (const opt of rawOptions) {
                if (noneKeywords.includes(opt)) {
                    tempHasNoneButton = true;
                    tempNoneButtonText = opt;
                } else {
                    tempOptions.push(opt);
                }
            }
            options = tempOptions.length > 0 ? tempOptions : undefined;
            hasNoneButton = tempHasNoneButton;
            noneButtonText = tempNoneButtonText;
        }

        // Check for the specific minor warning from AI
        if (text.includes("⚠️ Cette application n’est pas destinée aux mineurs non accompagnés.")) {
            setIsGameOver(true);
        } else if (finalReportMatch) {
            setIsGameOver(true);
        }


        return {
            id,
            sender: 'ai',
            text: cleanText,
            options,
            isPhotoRequest: photoRequestMatch,
            isFinalReport: finalReportMatch,
            isMultiChoice,
            isTextInputRequest: !!textInputMatch,
            isTextInputWithNone,
            textInputPlaceholder,
            isComboInputRequest: !!comboInputMatch, // New: set for combo input
            isAgeDropdownRequest: !!ageDropdownMatch, // New: set for age dropdown
            ageDropdownMin,
            ageDropdownMax,
            // If TEXT_INPUT_WITH_NONE, `hasNoneButton` is true and `noneButtonText` comes from the tag
            hasNoneButton: hasNoneButton || isTextInputWithNone,
            noneButtonText: noneButtonTextForTextInput || noneButtonText,
            isMismatchWarning: !!mismatchMatch,
            mismatchReason: mismatchMatch ? mismatchMatch[1].trim() : undefined,
            // Removed: isQuestionForVideoAnalysis: false, // Default to false
        };
    }, [setIsGameOver]);


    const { notice: initialNotice, warning: medicalWarning } = useMemo(() => extractSystemNotices(), [extractSystemNotices]);

    // Fix: Removed `initializeApp` from its own useCallback dependency array.
    // All internal dependencies (state setters, generateResponse, parseAiResponse, extractSystemNotices)
    // are stable or memoized, so `initializeApp` itself is stable and does not need to be a dependency.
    const initializeApp = useCallback(async () => {
        setIsLoading(true);
        setIsGameOver(false);
        setError(null);
        setLastFailedAction(null);
        setApiHistory([]);
        setConsultationType(null);
        setAwaitingNumberInputForOption(null); // Reset this state too
        setShowResetConfirmation(false); // Hide reset confirmation
        // Removed uploadedVideoFile and awaitingVideoQuestion resets

        try {
            // OPTIMIZATION: We no longer fetch the first question from the AI to ensure instant loading.
            // We hardcode the initial state that corresponds to "Démarrer la consultation."

            let initialUserPrompt = "Démarrer la consultation.";
            const lang = languageRef.current;
            const tFn = tRef.current;
            if (lang === 'en') initialUserPrompt = "Start consultation.";
            if (lang === 'nl') initialUserPrompt = "Start consult.";
            if (lang === 'es') initialUserPrompt = "Iniciar consulta.";

            // This MUST match the expected output for the "Welcome" UI logic
            let staticAiResponseText = `Cette auto-analyse concerne : [CHOIX]${tFn('analysis.myself')}[CHOIX]${tFn('analysis.other')}`;
            if (lang === 'en') staticAiResponseText = `This self-analysis concerns: [CHOIX]${tFn('analysis.myself')}[CHOIX]${tFn('analysis.other')}`;
            if (lang === 'nl') staticAiResponseText = `Deze zelfanalyse betreft: [CHOIX]${tFn('analysis.myself')}[CHOIX]${tFn('analysis.other')}`;
            if (lang === 'es') staticAiResponseText = `Este autoanálisis es para: [CHOIX]${tFn('analysis.myself')}[CHOIX]${tFn('analysis.other')}`;

            const initialAiMessage = parseAiResponse(staticAiResponseText, `ai-initial-${Date.now()}`);

            setCurrentAssistantMessage(initialAiMessage);
            setApiHistory([
                { role: 'user', parts: [{ text: initialUserPrompt }] },
                { role: 'model', parts: [{ text: staticAiResponseText }] }
            ]);
        } catch (err) {
            console.error("Failed to initialize app locally:", err);
            setError(t('analysis.start_error'));
        } finally {
            setIsLoading(false);
        }
    }, [parseAiResponse, setConsultationType]); // stable: language/t read from refs inside

    // Effect for initial app setup, now dependent on the warning popup state
    useEffect(() => {
        if (!showInitialWarningPopup) {
            initializeApp();
        }
    }, [initializeApp, showInitialWarningPopup]);

    // Effect for handling the initial warning popup's focus and tab index
    useEffect(() => {
        if (showInitialWarningPopup) {
            window.scrollTo(0, 0);
            toggleTabIndexForMainContent(false);
            const modalElement = initialWarningModalRef.current;
            if (modalElement) {
                const focusableElements = modalElement.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                // Type cast for safety
                const firstElement = focusableElements[0] as HTMLElement | undefined;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | undefined;

                // Focus the first element (Close button usually)
                firstElement?.focus();

                const handleKeyDown = (event: KeyboardEvent) => {
                    if (event.key === 'Tab') {
                        if (event.shiftKey) { // Shift + Tab
                            if (document.activeElement === firstElement) {
                                lastElement?.focus();
                                event.preventDefault();
                            }
                        } else { // Tab
                            if (document.activeElement === lastElement) {
                                firstElement?.focus();
                                event.preventDefault();
                            }
                        }
                    } else if (event.key === 'Escape') {
                        // Do nothing on escape to force manual interaction or add close if desired
                        // The requirement implies a strict blocking modal, but usually Esc is good for a11y.
                        // Given "bloque toute interaction", we can leave Esc enabled or disabled.
                        // The provided code allows Esc to close. I will keep it for usability unless strictly forbidden.
                        // Prompt says "bloque toute interaction... un bouton Fermer... permet de le quitter".
                        // I'll let Esc work as a courtesy.
                        setShowInitialWarningPopup(false);
                        toggleTabIndexForMainContent(true);
                        if (containerRef.current) {
                            containerRef.current.focus();
                        }
                    }
                };

                window.addEventListener('keydown', handleKeyDown);
                return () => {
                    window.removeEventListener('keydown', handleKeyDown);
                };
            }
        } else {
            toggleTabIndexForMainContent(true);
        }
    }, [showInitialWarningPopup, toggleTabIndexForMainContent]);

    const processUserAction = useCallback(async (userText: string, imageFiles?: File[] | null) => {
        // Synchronous double-submit guard — prevents race conditions where isLoading
        // state hasn't updated yet when a second click fires
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        setIsLoading(true);
        setError(null);
        setLastFailedAction(null);
        setAwaitingNumberInputForOption(null);

        let actualUserTextToSend = userText;
        // Removed videoAnalysisResult and associated logic

        // --- Client-side interception for age-related questions ---
        const isSelfConcern = currentAssistantMessage?.text.includes("Cette auto-analyse concerne :") ||
            currentAssistantMessage?.text.includes("This self-analysis concerns:") ||
            currentAssistantMessage?.text.includes("Deze zelfanalyse betreft:") ||
            currentAssistantMessage?.text.includes("Este autoanálisis es para:");

        if (isSelfConcern) {
            if (userText === "Moi-même" || userText === t('analysis.myself')) {
                setConsultationType('self');
            } else if (userText === "Une autre personne" || userText === t('analysis.other')) {
                setConsultationType('other');
            }
        } else if (consultationType === 'self' && currentAssistantMessage?.isAgeDropdownRequest) { // Use isAgeDropdownRequest for adult age
            const age = parseInt(userText, 10);
            // AgeDropdown ensures 18-120, but this is a safeguard for unexpected flow
            if (isNaN(age) || age < MIN_VALID_AGE || age > MAX_VALID_AGE) {
                setError(t('analysis.age_error'));
                setIsLoading(false);
                return; // Do not send to AI
            }
            // If age is valid and >= 18, continue as normal, sending age to AI
            actualUserTextToSend = userText;
        } else if (consultationType === 'other' && (currentAssistantMessage?.text.includes("Quel est son âge ?") || currentAssistantMessage?.text.includes("What is their age?") || currentAssistantMessage?.text.includes("Wat is de leeftijd?") || currentAssistantMessage?.text.includes("¿Cuál es su edad?"))) {
            // AgeMonthYearDropdown sends a formatted string like "7 ans et 6 mois"
            // The AI is expected to parse this string, so client-side validation here is minimal
            if (!userText.includes("ans") && !userText.includes("mois") && !userText.includes("years") && !userText.includes("months") && !userText.includes("jaar") && !userText.includes("maanden") && !userText.includes("años") && !userText.includes("meses") && userText !== "Moins de 1 mois" && userText !== "Less than 1 month" && userText !== "Minder dan 1 maand" && userText !== "Menos de 1 mes") { // Also allow translations for < 1 month
                setError(t('analysis.age_error_child'));
                setIsLoading(false);
                return; // Do not send to AI
            }
            // The AI instruction says to continue if "Une autre personne" is <18,
            // so we don't block here, just ensure it's a valid age string.
            actualUserTextToSend = userText;
        }
        // --- End client-side interception ---

        // Clear current AI message options/inputs to prevent re-submitting
        setCurrentAssistantMessage(prev => prev ? {
            ...prev,
            options: undefined,
            isPhotoRequest: false,
            isTextInputRequest: false,
            isTextInputWithNone: false,
            textInputPlaceholder: undefined,
            isComboInputRequest: false,
            isAgeDropdownRequest: false, // New: Clear age dropdown state
            ageDropdownMin: undefined,
            ageDropdownMax: undefined,
            hasNoneButton: false, // Clear none button state
            noneButtonText: undefined, // Clear none button text
            // Removed: isQuestionForVideoAnalysis: false, // Clear video analysis question flag
        } : null);

        const userParts: (GeminiTextPart | GeminiImagePart)[] = [{ text: actualUserTextToSend }];
        if (imageFiles && imageFiles.length > 0) {
            const imageParts = await Promise.all(imageFiles.map(file => fileToGenerativePart(file)));
            userParts.push(...imageParts);
        }

        // Use apiHistoryRef.current (always latest) instead of apiHistory (stale closure)
        const currentApiHistoryWithUser = [
            ...apiHistoryRef.current,
            { role: 'user', parts: userParts }
        ];
        const aiResponseText = await generateResponse(currentApiHistoryWithUser, actualUserTextToSend, imageFiles, getSystemInstruction(languageRef.current));

        if (aiResponseText.startsWith("API_ERROR:") || aiResponseText.startsWith("SERVICE_ERROR:")) {
            setError(aiResponseText.replace(/^(API_ERROR:|SERVICE_ERROR:)/, '').trim());
            setLastFailedAction({ userText: actualUserTextToSend, imageFiles: imageFiles });
            setIsLoading(false);
            isProcessingRef.current = false;
            return;
        }

        const newAiMessage = parseAiResponse(aiResponseText, `ai-${Date.now()}`);

        if (newAiMessage.isMismatchWarning) {
            setMismatchWarning(newAiMessage.mismatchReason || t('analysis.warning_popup.text2') || 'Incohérence détectée.');
            setIsLoading(false);
            isProcessingRef.current = false;
            // The user's photo message *was* appended to `currentApiHistoryWithUser`. 
            // We set it so that the AI's mismatch state understands what happened when we override.
            setApiHistory(currentApiHistoryWithUser);
            return;
        }

        // If this is the final report, collect all user-uploaded images from history
        if (newAiMessage.isFinalReport) {
            const allUploadedImageUrls: string[] = [];
            for (const entry of currentApiHistoryWithUser) {
                if (entry.role === 'user') {
                    for (const part of entry.parts) {
                        if ('inlineData' in part && part.inlineData.mimeType.startsWith('image/')) {
                            allUploadedImageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                        }
                    }
                }
            }
            newAiMessage.userUploadedImageUrls = allUploadedImageUrls;

            // Save to Supabase History if user is logged in
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                if (session?.user) {
                    try {
                        // Create a cleaner summary for notes by removing the warning
                        const cleanSummary = aiResponseText
                            .replace(/\[FINAL_REPORT\]/g, '')
                            .replace(/1\.\s*\*\*⚠️\s*IMPORTANT WARNING:\*\*.*?(?=\n\n|\n2)/s, '')
                            .replace(/1\.\s*\*\*⚠️\s*AVERTISSEMENT MÉDICAL\s*\(.*?\):\*\*.*?(?=\n\n|\n2)/s, '')
                            .replace(/^\s*[\r\n]/gm, '') // Remove empty lines at start
                            .trim()
                            .substring(0, 300);

                        const { error } = await supabase.from('analyses').insert({
                            user_id: session.user.id,
                            notes: cleanSummary + (cleanSummary.length >= 300 ? '...' : ''),
                            prediction: { full_text: aiResponseText }, // Store full report
                            // image_url: allUploadedImageUrls.length > 0 ? allUploadedImageUrls[0] : null
                        });
                        if (error) console.error("Error saving analysis:", error);
                    } catch (err) {
                        console.error("Failed to save analysis:", err);
                    }
                }
            });
        }

        const finalHistory = [
            ...currentApiHistoryWithUser,
            { role: 'model', parts: [{ text: aiResponseText }] }
        ];

        setApiHistory(finalHistory);
        setCurrentAssistantMessage(newAiMessage);
        setIsLoading(false);
        isProcessingRef.current = false;
    }, [parseAiResponse, currentAssistantMessage, consultationType, setConsultationType, generateResponse]); // removed apiHistory — using apiHistoryRef.current instead

    const retryLastAction = useCallback(() => {
        if (lastFailedAction) {
            // Removed video-specific retry logic
            processUserAction(lastFailedAction.userText, lastFailedAction.imageFiles);
        }
    }, [lastFailedAction, processUserAction]);


    const handleOptionSelect = (option: string) => {
        if (isLoading || isProcessingRef.current) return;

        // This is where "Depuis combien de temps" leads to a number input.
        // The text prompt in constants.ts says: "Depuis combien de temps la lésion est apparue ?" [CHOIX]Moins de deux jours[CHOIX]Quelques jours[CHOIX]Quelques semaines[CHOIX]Quelques mois[CHOIX]Plus d’un an
        // If "Moins de deux jours" is selected, it implicitly means "1" or "0-1" days, but the instruction does not ask for explicit number.
        // It asks for an explicit number only for "Quelques jours", "Quelques semaines", "Quelques mois", "Plus d'un an".
        // Let's refine the condition to only trigger number input for "Quelques jours", "Quelques semaines", "Quelques mois", "Plus d'un an".
        const optionsRequiringNumberInput = [
            "Quelques jours", "Quelques semaines", "Quelques mois", "Plus d'un an",
            "A few days", "A few weeks", "A few months", "More than a year",
            "Enkele dagen", "Enkele weken", "Enkele maanden", "Meer dan een jaar",
            "Unos días", "Unas semanas", "Unos meses", "Más de un año"
        ];

        const isDurationQuestion = currentAssistantMessage?.text.includes("Depuis combien de temps la lésion est apparue ?") ||
            currentAssistantMessage?.text.includes("How long has the lesion appeared?") ||
            currentAssistantMessage?.text.includes("Hoe lang is de laesie al zichtbaar?") ||
            currentAssistantMessage?.text.includes("¿Desde hace cuánto tiempo se nota la lesión?");

        if (isDurationQuestion && optionsRequiringNumberInput.includes(option)) {
            setAwaitingNumberInputForOption(option);
            // Do not send to AI yet, wait for number input
            setIsLoading(false); // Stop loading since we're waiting for local input
        } else {
            processUserAction(option);
        }
    };

    const handleMultiChoiceSubmit = (selectedOptions: string[]) => {
        if (isLoading || isProcessingRef.current || selectedOptions.length === 0) return;
        processUserAction(selectedOptions.join(', '));
    };

    const handleTextSubmit = (text: string) => {
        if (isLoading || isProcessingRef.current) return;
        if (awaitingNumberInputForOption) {
            const number = parseInt(text, 10);
            if (isNaN(number) || number <= 0) {
                setValidationError(t('questionnaire_ui.number_error'));
                return;
            }
            const fullAnswer = `${awaitingNumberInputForOption}: ${number}`;
            processUserAction(fullAnswer);
        } else {
            processUserAction(text);
        }
    };

    const handleConfirmMismatch = () => {
        setMismatchWarning(null);
        // Instruct the AI to ignore the mismatch and proceed to the final report
        processUserAction("[SYSTEM_OVERRIDE] User confirmed data. Proceed with [FINAL_REPORT].");
    };

    const handleRestartForMismatch = () => {
        setMismatchWarning(null);
        initializeApp();
    };

    const handleNoneSubmit = (noneText: string) => {
        if (isLoading || isProcessingRef.current) return;
        processUserAction(noneText);
    };

    const handleFileSelect = (files: File[]) => {
        if (isLoading || isProcessingRef.current) return;
        // It's always an image upload now
        processUserAction("Voici une ou plusieurs photos de la lésion.", files);
    };

    const handleSkipMedia = () => {
        if (isLoading || isProcessingRef.current) return;
        processUserAction("Je ne peux pas envoyer de média pour le moment.");
    };

    const handleBack = useCallback(() => {
        if (isLoading) return; // Prevent multiple back presses

        if (awaitingNumberInputForOption) {
            // If we're waiting for a number, just go back to option selection
            setAwaitingNumberInputForOption(null);
            setError(null); // Clear any number input errors
            setIsLoading(false);
            return;
        }

        // Removed awaitingVideoQuestion logic
        /*
        if (awaitingVideoQuestion) {
            // If we're waiting for a video question, go back to media upload
            setAwaitingVideoQuestion(false);
            setUploadedVideoFile(null);
            setError(null);
            setIsLoading(false);
            // Fix: Add type narrowing before accessing `text` on `firstPart`.
            // Revert to the PHOTO_REQUEST message
            const mediaRequestContent = apiHistory[apiHistory.length - 2];
            if (mediaRequestContent && mediaRequestContent.role === 'model' && mediaRequestContent.parts.length > 0) {
                const firstPart = mediaRequestContent.parts[0];
                if ('text' in firstPart) { // Type guard to ensure firstPart is GeminiTextPart
                    setCurrentAssistantMessage(parseAiResponse(firstPart.text, `ai-back-media-request-${Date.now()}`));
                } else {
                    // This case means the original "PHOTO_REQUEST" message was not a text part, which shouldn't happen based on constants.ts
                    console.warn("Expected text part for media request message, but found a non-text part.");
                    initializeApp(); // Fallback
                }
            } else {
                 initializeApp(); // Fallback if history is not as expected
            }
            return;
        }
        */

        if (apiHistory.length <= 2) { // Need at least user input + model response
            initializeApp(); // Restart if going back before initial AI response
            return;
        }

        const newApiHistory = apiHistory.slice(0, -2); // Remove last user input and model response
        setApiHistory(newApiHistory);
        setError(null);
        setLastFailedAction(null);

        const lastModelContent = newApiHistory[newApiHistory.length - 1];

        if (lastModelContent && lastModelContent.role === 'model' && lastModelContent.parts.length > 0) {
            const lastModelResponsePart = lastModelContent.parts[0];
            if ('text' in lastModelResponsePart) {
                const previousAiMessage = parseAiResponse((lastModelResponsePart as GeminiTextPart).text, `ai-back-${Date.now()}`);
                setCurrentAssistantMessage(previousAiMessage);

                // Re-evaluate consultationType if going back to the first question
                if (previousAiMessage.text.includes("Cette auto-analyse concerne :") ||
                    previousAiMessage.text.includes("This self-analysis concerns:") ||
                    previousAiMessage.text.includes("Deze zelfanalyse betreft:") ||
                    previousAiMessage.text.includes("Este autoanálisis es para:")) {
                    setConsultationType(null);
                }
            } else {
                console.warn("Expected text part in model response, but found a different type. Reinitializing.");
                initializeApp();
                return;
            }
        } else {
            initializeApp();
            return;
        }
        setIsGameOver(false);
    }, [isLoading, apiHistory, initializeApp, parseAiResponse, awaitingNumberInputForOption, setConsultationType]); // Removed awaitingVideoQuestion, uploadedVideoFile

    // Handle reset confirmation
    const handleReset = useCallback(() => {
        window.scrollTo(0, 0);
        setShowResetConfirmation(true);
        toggleTabIndexForMainContent(false); // Disable tabbing outside modal
    }, [toggleTabIndexForMainContent]);

    const confirmReset = useCallback(() => {
        setShowResetConfirmation(false);
        toggleTabIndexForMainContent(true); // Re-enable tabbing outside modal
        initializeApp();
    }, [initializeApp, toggleTabIndexForMainContent]);

    const cancelReset = useCallback(() => {
        setShowResetConfirmation(false);
        toggleTabIndexForMainContent(true); // Re-enable tabbing outside modal
        // Re-focus on the reset button or a logical element from the main content
        // This is a simple fallback, more robust solutions might store the element that triggered the modal
        if (containerRef.current) {
            const resetButton = containerRef.current.querySelector('[aria-label="Recommencer la consultation"]');
            if (resetButton instanceof HTMLElement) {
                resetButton.focus();
            }
        }
    }, [toggleTabIndexForMainContent]);

    // Trap focus inside the reset confirmation modal
    const resetModalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (showResetConfirmation && resetModalRef.current) {
            const focusableElements = resetModalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            firstElement?.focus();

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Tab') {
                    if (event.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement?.focus();
                            event.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement?.focus();
                            event.preventDefault();
                        }
                    }
                } else if (event.key === 'Escape') {
                    cancelReset();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [showResetConfirmation, cancelReset]);


    // currentStep represents the number of user answers given
    // Exclude initial 'Démarrer la consultation.' from progress count, and any other internal system prompts
    const currentStep = apiHistory.filter(h =>
        h.role === 'user' &&
        h.parts.length > 0 &&
        'text' in h.parts[0] && // Ensure it's a GeminiTextPart
        (h.parts[0] as GeminiTextPart).text !== "Démarrer la consultation."
    ).length;

    // Fix: Wrap the main JSX content of the `Questionnaire` component in a `return` statement.
    return (
        <>
            {/* Error display - NOW VISIBLE even if currentAssistantMessage is null */}
            {/* Error display - Premium Style */}
            {error && (
                <div className="w-full max-w-xl mx-auto mt-10 p-8 md:p-12 relative z-20 animate-fade-in-scale">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-[#1f0a0a] to-[#0a0b0d] rounded-3xl opacity-95 backdrop-blur-xl border border-red-500/20 shadow-[0_0_60px_rgba(220,38,38,0.15)]"></div>

                    <div className="relative z-30 flex flex-col items-center text-center">
                        {/* Glowing Icon */}
                        <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-900/5 rounded-full flex items-center justify-center mb-8 ring-1 ring-red-500/40 shadow-[0_0_40px_rgba(220,38,38,0.3)] animate-pulse-slow">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>

                        <h3 className="text-3xl md:text-3xl font-display font-bold text-white mb-6 tracking-tight">
                            {t('analysis.error_title')}
                        </h3>

                        <p className="text-brand-secondary/90 text-lg mb-10 leading-relaxed font-light">
                            {error}
                        </p>

                        <button
                            onClick={retryLastAction || initializeApp}
                            className="group relative px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-bold text-lg shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                {t('analysis.retry')}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        </button>

                        {(error.includes("API_KEY") || error.includes("VITE_API_KEY")) && (
                            <p className="mt-8 text-xs text-red-500/60 bg-red-950/30 px-4 py-2 rounded-lg border border-red-500/10 uppercase tracking-widest font-mono">
                                {t('analysis.config_required')}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* The main questionnaire UI, hidden until initial warning is dismissed AND we have a message */}
            {currentAssistantMessage && !currentAssistantMessage.isFinalReport && !showInitialWarningPopup && !error ? (
                <div ref={containerRef} tabIndex={-1} role="region" aria-live="polite" aria-atomic="true" className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col animate-fade-in relative z-10 transition-all duration-300">
                    {(currentStep > 0 && !isGameOver) && ( // Start conditional rendering for the entire progress bar container
                        <div className="flex items-center justify-between mb-8 px-4 py-3 bg-white/5 border border-white/5 rounded-xl backdrop-blur-md">
                            <button onClick={handleBack} className="p-2 text-brand-secondary/60 hover:text-brand-primary transition-colors rounded-full hover:bg-white/5" aria-label={t('common.back')}>
                                <BackArrowIcon />
                            </button>
                            <div className="flex-grow mx-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={0} aria-valuemax={TOTAL_QUESTIONNAIRE_STAGES} aria-label={`Progression du questionnaire, étape ${currentStep} sur ${TOTAL_QUESTIONNAIRE_STAGES}`}>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-brand-primary to-blue-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                                        style={{ width: `${Math.min(90, (currentStep / TOTAL_QUESTIONNAIRE_STAGES) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            {/* Reset Button with Tooltip */}
                            <Tooltip text={t('analysis.restart_tooltip')}>
                                <button
                                    onClick={handleReset}
                                    className="group p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-full"
                                    aria-label={t('analysis.restart_tooltip')}
                                >
                                    <RedoIcon className="transition-transform group-hover:rotate-180 group-active:rotate-180" />
                                </button>
                            </Tooltip>
                        </div>
                    )} {/* End conditional rendering for the entire progress bar container */}

                    {currentAssistantMessage.text.includes("Cette auto-analyse concerne :") ||
                        currentAssistantMessage.text.includes("This self-analysis concerns:") ||
                        currentAssistantMessage.text.includes("Deze zelfanalyse betreft:") ? (
                        <div className="text-center mb-12 md:mb-16 animate-fade-in">
                            <div className="inline-block p-4 rounded-full bg-brand-primary/10 mb-8 ring-1 ring-brand-primary/20">
                                <svg className="w-10 h-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-display font-medium leading-tight mb-6 text-white tracking-tight">
                                {t('analysis.title')}
                            </h1>
                            <p className="text-lg md:text-xl font-light leading-relaxed mb-10 text-brand-secondary/80">
                                {t('analysis.subtitle')} <br />
                                <span className="text-brand-primary font-medium">{t('analysis.highlight')}</span>
                            </p>
                            <div className="w-12 h-1 bg-brand-primary/20 mx-auto mb-10 rounded-full"></div>
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-secondary/40 mb-6">
                                {t('analysis.target')}
                            </p>
                        </div>
                    ) : (
                        <div key={currentAssistantMessage.id} className="text-center mb-8 animate-fade-in">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
                                {(() => {
                                    const text = currentAssistantMessage.text;
                                    const qIndex = text.indexOf('?');
                                    if (qIndex !== -1) return text.substring(0, qIndex + 1);
                                    return text;
                                })()}
                            </h2>
                            {(() => {
                                const text = currentAssistantMessage.text;
                                const qIndex = text.indexOf('?');
                                if (qIndex !== -1) {
                                    const remainder = text.substring(qIndex + 1).trim();
                                    if (remainder && !remainder.startsWith('[CHOIX]') && !remainder.startsWith('[MULTI_CHOIX]') && !remainder.startsWith('[COMBO_INPUT]') && !remainder.startsWith('[AGE_DROPDOWN]')) {
                                        return <p className="text-lg text-brand-secondary/70 mt-4 leading-relaxed font-light">{remainder}</p>;
                                    }
                                }
                                return null;
                            })()}
                        </div>
                    )}

                    {isLoading && !awaitingNumberInputForOption ? (
                        <div className="flex flex-col items-center justify-center h-48" aria-live="polite" aria-atomic="true" role="status">
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex gap-2">
                                    <span className="w-4 h-4 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-4 h-4 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-4 h-4 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                <p className="text-brand-secondary/60 text-base animate-pulse font-light tracking-wide">{t('analysis.loading')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-6">
                            {currentAssistantMessage.isPhotoRequest ? (
                                <FileUpload onFileSelect={handleFileSelect} onSkip={handleSkipMedia} ref={fileUploadRef} />
                            ) : currentAssistantMessage.isAgeDropdownRequest ? ( // New: Conditional rendering for AgeDropdown
                                <AgeDropdown
                                    onSubmit={handleTextSubmit}
                                    ref={ageDropdownRef}
                                    minAge={currentAssistantMessage.ageDropdownMin}
                                    maxAge={currentAssistantMessage.ageDropdownMax}
                                    language={language}
                                />
                            ) : currentAssistantMessage.isComboInputRequest ? ( // Simplified check, rely on tag parsing
                                <AgeMonthYearDropdown
                                    onSubmit={handleTextSubmit}
                                    monthsRef={ageMonthYearDropdownMonthsRef}
                                    yearsRef={ageMonthYearDropdownYearsRef}
                                    language={language}
                                />
                            ) : currentAssistantMessage.text.includes("Dans quel pays résidez-vous ?") ? ( // Conditional rendering for country dropdown
                                <CountryDropdown onSubmit={handleTextSubmit} ref={countryDropdownRef} />
                            ) : currentAssistantMessage.isTextInputRequest || awaitingNumberInputForOption ? ( // Removed currentAssistantMessage.isQuestionForVideoAnalysis
                                <TextInput
                                    onSubmit={handleTextSubmit}
                                    placeholder={currentAssistantMessage.textInputPlaceholder || (awaitingNumberInputForOption ? "2, 3, 4..." : t('questionnaire_ui.placeholder_text'))}
                                    showNoneButton={currentAssistantMessage.hasNoneButton} // Pass this prop to TextInput
                                    onNoneClick={handleNoneSubmit} // Pass generic 'aucun' for text input none
                                    noneButtonText={currentAssistantMessage.noneButtonText} // Pass the specific none button text
                                    ref={textInputRef}
                                />
                            ) : null}
                            {currentAssistantMessage.options && currentAssistantMessage.isMultiChoice && (
                                <MultiChoiceOptions
                                    options={currentAssistantMessage.options}
                                    onSubmit={handleMultiChoiceSubmit}
                                    hasNoneButton={currentAssistantMessage.hasNoneButton}
                                    noneButtonText={currentAssistantMessage.noneButtonText}
                                    onNoneClick={handleNoneSubmit}
                                    optionButtonRefs={optionButtonsRef}
                                    onError={(msg) => setValidationError(msg)}
                                />
                            )}
                            {currentAssistantMessage.options && !currentAssistantMessage.isMultiChoice && (
                                <div className={`w-full flex flex-wrap justify-center gap-4 animate-fade-in ${currentAssistantMessage.options.length > 3 ? 'grid grid-cols-2 md:grid-cols-3' : 'flex'}`}>
                                    {currentAssistantMessage.options.map((opt, index) => (
                                        <div key={opt} className={currentAssistantMessage.options.length <= 3 ? "flex-1 min-w-[160px] max-w-[300px]" : "w-full"}>
                                            <OptionButton text={opt} onClick={handleOptionSelect} ref={(el: HTMLButtonElement | null) => {
                                                if (optionButtonsRef.current) {
                                                    optionButtonsRef.current[index] = el;
                                                }
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Render dedicated "None" button for single choice questions that have one */}
                            {currentAssistantMessage.hasNoneButton && currentAssistantMessage.noneButtonText &&
                                !currentAssistantMessage.isMultiChoice && !currentAssistantMessage.isTextInputRequest &&
                                !currentAssistantMessage.isPhotoRequest && !currentAssistantMessage.isAgeDropdownRequest &&
                                !(consultationType === 'other' && currentAssistantMessage.text.includes("Quel est son âge ?") && currentAssistantMessage.isComboInputRequest) && !currentAssistantMessage.text.includes("Dans quel pays résidez-vous ?") && (
                                    <button
                                        type="button"
                                        onClick={() => handleNoneSubmit(currentAssistantMessage.noneButtonText!)}
                                        className="w-full max-w-lg px-7 py-4 bg-white border-2 border-emerald-500 text-emerald-600 text-lg rounded-full hover:bg-emerald-50 transition-all duration-300 font-bold shadow-xl active:scale-95 mt-4"
                                    >
                                        {currentAssistantMessage.noneButtonText}
                                    </button>
                                )}
                        </div>
                    )}
                </div>
            ) : (
                currentAssistantMessage && currentAssistantMessage.isFinalReport && (
                    <ChatMessage message={currentAssistantMessage} />
                )
            )}

            {/* Reset Confirmation Modal */}
            {/* Reset Confirmation Modal */}
            {showResetConfirmation && ReactDOM.createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in p-4"
                    role="dialog" aria-modal="true" aria-labelledby="reset-confirmation-title"
                >
                    {/* Dark backdrop with blur */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#030305]/95 via-[#0a0b0d]/95 to-[#030305]/95 backdrop-blur-sm" aria-hidden="true"></div>

                    <div
                        ref={resetModalRef}
                        className="relative bg-gradient-to-b from-[#0a0b0d] via-[#111214] to-[#0a0b0d] rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-white/10 backdrop-blur-xl animate-fade-in-scale"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 40px rgba(239, 68, 68, 0.1)'
                        }}
                    >
                        <div className="mb-6 flex justify-center text-5xl drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                            <span role="img" aria-label="Warning">⚠️</span>
                        </div>
                        <h2 id="reset-confirmation-title" className="text-2xl md:text-3xl font-bold text-white mb-4 font-display">{t('analysis.reset_popup.title')}</h2>
                        <p className="text-brand-secondary/80 text-base md:text-lg mb-6 font-light leading-relaxed">
                            {t('analysis.reset_popup.text')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={confirmReset}
                                className="px-6 py-3 text-white text-base rounded-full font-semibold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] bg-red-600 hover:bg-red-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0b0d]"
                            >
                                {t('analysis.reset_popup.confirm')}
                            </button>
                            <button
                                onClick={cancelReset}
                                className="px-6 py-3 border-2 border-white/20 rounded-full transition-all duration-200 font-semibold text-brand-secondary hover:bg-white/10 hover:border-white/40 hover:text-white text-base hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0a0b0d]"
                                aria-label="Annuler et reprendre la consultation"
                            >
                                {t('analysis.reset_popup.cancel')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Validation Error Modal - Quick & Premium */}
            {validationError && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setValidationError(null)}></div>
                    <div className="relative bg-gradient-to-b from-[#1a0505] to-[#0a0b0d] border border-red-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-scale">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/40">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2">{t('analysis.validation_popup.title')}</h3>
                        <p className="text-brand-secondary/80 text-base font-light mb-8 leading-relaxed">
                            {validationError}
                        </p>
                        <button
                            onClick={() => setValidationError(null)}
                            className="w-full py-3 bg-white text-brand-deep rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
                        >
                            {t('analysis.validation_popup.close')}
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Mismatch Warning Modal - Full Screen Overlay */}
            {mismatchWarning && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                    <div className="relative bg-gradient-to-b from-[#1a0505] to-[#0a0b0d] border border-orange-500/30 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl animate-fade-in-scale">
                        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-orange-500/40">
                            <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-4">Vérification requise</h3>
                        <p className="text-brand-secondary/90 text-lg font-light mb-8 leading-relaxed">
                            {mismatchWarning}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleConfirmMismatch}
                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-colors shadow-lg active:scale-95"
                            >
                                Je confirme mes informations
                            </button>
                            <button
                                onClick={handleRestartForMismatch}
                                className="px-6 py-3 bg-transparent border border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-colors shadow-lg active:scale-95"
                            >
                                Recommencer
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Initial Warning Popup - Full Screen Overlay */}
            {showInitialWarningPopup && ReactDOM.createPortal(
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="initial-warning-title"
                >
                    {/* Dark Backdrop with blur */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#030305]/95 via-[#0a0b0d]/95 to-[#030305]/95 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" aria-hidden="true"></div>

                    {/* Popup Card */}
                    <div
                        ref={initialWarningModalRef}
                        className="relative w-full max-w-lg bg-gradient-to-b from-[#0a0b0d] via-[#111214] to-[#0a0b0d] rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center transform transition-all duration-500 ease-out animate-fade-in border border-white/10 backdrop-blur-xl"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 40px rgba(45, 212, 191, 0.1)'
                        }}
                        tabIndex={-1}
                    >
                        {/* Icon */}
                        <div className="mb-6 text-5xl animate-bounce drop-shadow-[0_0_30px_rgba(255,200,0,0.8)]">
                            ⚠️
                        </div>

                        {/* Title */}
                        <h2 id="initial-warning-title" className="text-2xl md:text-3xl font-bold text-white mb-6 font-display tracking-tight">
                            {t('analysis.warning_popup.title')}
                        </h2>

                        {/* Text Content - Centered, readable, spaced */}
                        <div className="space-y-6 text-brand-secondary/80 text-base md:text-lg font-light leading-relaxed">
                            <p>
                                {t('analysis.warning_popup.text1')}
                            </p>
                            <p className="font-bold text-white">
                                {t('analysis.warning_popup.text2')}
                            </p>
                            <p>
                                {t('analysis.warning_popup.text3')}
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            className="mt-8 bg-brand-primary text-[#030305] text-base font-bold py-3 px-12 rounded-full shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] hover:bg-brand-primary/90 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-[#0a0b0d]"
                            onClick={() => setShowInitialWarningPopup(false)}
                            aria-label={t('analysis.warning_popup.close')}
                        >
                            {t('analysis.warning_popup.close')}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default Questionnaire;
