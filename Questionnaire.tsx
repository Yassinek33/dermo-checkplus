
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Message, GeminiContent, GeminiTextPart, GeminiImagePart, PageConfig } from './types';
import { generateResponse, fileToGenerativePart } from './services/geminiService'; // Removed analyzeVideo
import ChatMessage from './components/ChatMessage';
import OptionButton from './components/OptionButton';
import FileUpload from './components/FileUpload';
import { BackArrowIcon, RedoIcon } from './components/icons';
import TextInput from './components/TextInput';
import MultiChoiceOptions from './components/MultiChoiceOptions';
import AgeDropdown from './components/AgeDropdown'; // Import AgeDropdown
import CountryDropdown from './components/CountryDropdown'; // Import CountryDropdown
import AgeMonthYearDropdown from './components/AgeMonthYearDropdown'; // New: Import AgeMonthYearDropdown
import { getSystemInstruction } from './constants'; // To extract notice/warning

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
    const [currentAiMessage, setCurrentAiMessage] = useState<Message | null>(null);
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

    // Effect for managing focus after AI message updates
    useEffect(() => {
        if (!isLoading && currentAiMessage && !showInitialWarningPopup) { // Only focus if warning is dismissed
            // Find the first interactive element and focus it
            let elementToFocus: HTMLElement | null = null;

            if (currentAiMessage.isPhotoRequest && fileUploadRef.current) {
                // Focus the 'Choisir média(s)' button within FileUpload
                elementToFocus = fileUploadRef.current.querySelector('button[aria-label^="Ajouter une image"]') as HTMLElement; // Changed text to match FileUpload
            } else if (currentAiMessage.isTextInputRequest) {
                elementToFocus = textInputRef.current;
            } else if (currentAiMessage.isComboInputRequest) {
                elementToFocus = ageMonthYearDropdownMonthsRef.current || ageMonthYearDropdownYearsRef.current;
            } else if (currentAiMessage.isAgeDropdownRequest) { // New: Focus age dropdown
                elementToFocus = ageDropdownRef.current;
            } else if (currentAiMessage.options && currentAiMessage.isMultiChoice) {
                elementToFocus = optionButtonsRef.current[0];
            } else if (currentAiMessage.options && !currentAiMessage.isMultiChoice) {
                elementToFocus = optionButtonsRef.current[0];
            } else if (currentAiMessage.text.includes("Dans quel pays résidez-vous ?")) {
                elementToFocus = countryDropdownRef.current;
            }

            if (elementToFocus) {
                elementToFocus.focus();
            } else if (containerRef.current) {
                // Fallback to the main container if no specific input found
                containerRef.current.focus();
            }
        }
    }, [isLoading, currentAiMessage, awaitingNumberInputForOption, consultationType, showInitialWarningPopup]); // Removed awaitingVideoQuestion from dependencies

    const parseAiResponse = useCallback((text: string, id: string): Message => {
        const photoRequestMatch = text.includes('[PHOTO_REQUEST]');
        const finalReportMatch = text.includes('[FINAL_REPORT]');
        // Updated regex to capture optional none button text
        const textInputMatch = text.match(/\[TEXT_INPUT(_WITH_NONE)?(?::([^:]+?))?(?::([^\]]+?))?\]/);
        const comboInputMatch = text.match(/\[COMBO_INPUT(?::([^\]]+?))?\]/); // New: Capture placeholder for combo input, non-greedy
        const ageDropdownMatch = text.match(/\[AGE_DROPDOWN:(\d+):(\d+)\]/); // New: Match for age dropdown with min/max
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
        const noneKeywords = ["Je ne sais pas", "Aucun symptôme notable", "Aucun antécédent", "Aucun", "Aucun de ces facteurs", "Ignorer"]; // Added "Ignorer"

        // Extract specific noneButtonText for TEXT_INPUT_WITH_NONE if provided in the tag
        let noneButtonTextForTextInput: string | undefined;
        if (isTextInputWithNone) {
            noneButtonTextForTextInput = textInputMatch && textInputMatch[3] ? textInputMatch[3].trim() : "Ignorer cette étape";
        }

        if (photoRequestMatch || finalReportMatch) {
            cleanText = cleanText.replace(/\[(PHOTO_REQUEST|FINAL_REPORT)\]/g, '').trim();
        }
        if (textInputMatch) {
            // Updated to match the new regex for cleaning
            cleanText = cleanText.replace(/\[TEXT_INPUT(?:_WITH_NONE)?(?::[^:]+?)?(?::[^\]]+?)?\]/g, '').trim();
        }
        if (comboInputMatch) { // New: Clean text for combo input
            cleanText = cleanText.replace(/\[COMBO_INPUT(?::[^\]]+)?\]/g, '').trim();
        }
        if (ageDropdownMatch) { // New: Clean text for age dropdown
            cleanText = cleanText.replace(/\[AGE_DROPDOWN:\d+:\d+\]/g, '').trim();
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
            // Removed: isQuestionForVideoAnalysis: false, // Default to false
        };
    }, [setIsGameOver]);


    const extractSystemNotices = useCallback(() => {
        const fullInstruction = getSystemInstruction();
        // The prompt no longer contains a distinct "NOTICE AVANT QUESTIONNAIRE" section,
        // so we only extract the persistent medical warning.
        const medicalWarningMatch = fullInstruction.match(/⚠️ AVERTISSEMENT MÉDICAL \(.+\)\n"([^"]+)"/);

        const warning = medicalWarningMatch ? medicalWarningMatch[1].replace(/\\n/g, '\n') : '';

        return { notice: '', warning }; // Return empty notice as it's not present
    }, [getSystemInstruction]); // Added getSystemInstruction to dependencies

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

            const initialUserPrompt = "Démarrer la consultation.";
            // This MUST match the expected output for the "Welcome" UI logic
            const staticAiResponseText = "Cette auto-analyse concerne : [CHOIX]Moi-même[CHOIX]Une autre personne";

            const initialAiMessage = parseAiResponse(staticAiResponseText, `ai-initial-${Date.now()}`);

            setCurrentAiMessage(initialAiMessage);
            setApiHistory([
                { role: 'user', parts: [{ text: initialUserPrompt }] },
                { role: 'model', parts: [{ text: staticAiResponseText }] }
            ]);
        } catch (err) {
            console.error("Failed to initialize app locally:", err);
            setError("Erreur inattendue au démarrage.");
        } finally {
            setIsLoading(false);
        }
    }, [parseAiResponse, setConsultationType]); // Removed generateResponse dependency

    // Effect for initial app setup, now dependent on the warning popup state
    useEffect(() => {
        if (!showInitialWarningPopup) {
            initializeApp();
        }
    }, [initializeApp, showInitialWarningPopup]);

    // Effect for handling the initial warning popup's focus and tab index
    useEffect(() => {
        if (showInitialWarningPopup) {
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

    const processUserAction = useCallback(async (userText: string, imageFiles?: File[] | null) => { // Removed videoFileForAnalysis
        setIsLoading(true);
        setError(null);
        setLastFailedAction(null);
        setAwaitingNumberInputForOption(null); // Clear this state universally when any user input is processed
        // Removed setAwaitingVideoQuestion(false)

        let actualUserTextToSend = userText;
        // Removed videoAnalysisResult and associated logic

        // --- Client-side interception for age-related questions ---
        if (currentAiMessage?.text.includes("Cette auto-analyse concerne :")) {
            if (userText === "Moi-même") {
                setConsultationType('self');
            } else if (userText === "Une autre personne") {
                setConsultationType('other');
            }
        } else if (consultationType === 'self' && currentAiMessage?.isAgeDropdownRequest) { // Use isAgeDropdownRequest for adult age
            const age = parseInt(userText, 10);
            // AgeDropdown ensures 18-120, but this is a safeguard for unexpected flow
            if (isNaN(age) || age < MIN_VALID_AGE || age > MAX_VALID_AGE) {
                setError(`Veuillez indiquer un âge valide (nombre entier entre ${MIN_VALID_AGE} et ${MAX_VALID_AGE}).`);
                setIsLoading(false);
                return; // Do not send to AI
            }
            // If age is valid and >= 18, continue as normal, sending age to AI
            actualUserTextToSend = userText;
        } else if (consultationType === 'other' && currentAiMessage?.text.includes("Quel est son âge ?")) {
            // AgeMonthYearDropdown sends a formatted string like "7 ans et 6 mois"
            // The AI is expected to parse this string, so client-side validation here is minimal
            if (!userText.includes("ans") && !userText.includes("mois") && userText !== "Moins de 1 mois") { // Also allow "Moins de 1 mois"
                setError("Veuillez indiquer un âge valide en années et/ou mois.");
                setIsLoading(false);
                return; // Do not send to AI
            }
            // The AI instruction says to continue if "Une autre personne" is <18,
            // so we don't block here, just ensure it's a valid age string.
            actualUserTextToSend = userText;
        }
        // --- End client-side interception ---

        // Clear current AI message options/inputs to prevent re-submitting
        setCurrentAiMessage(prev => prev ? {
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

        const newApiHistory: GeminiContent[] = [
            ...apiHistory,
            { role: 'user', parts: userParts }
        ];

        const aiResponseText = await generateResponse(newApiHistory, actualUserTextToSend, imageFiles); // Removed videoFile

        if (aiResponseText.startsWith("API_ERROR:")) {
            setError(aiResponseText.replace("API_ERROR:", "").trim());
            setLastFailedAction({ userText: actualUserTextToSend, imageFiles: imageFiles }); // Removed videoFile
            setIsLoading(false);
            return;
        }

        const newAiMessage = parseAiResponse(aiResponseText, `ai-${Date.now()}`);

        // If this is the final report, collect all user-uploaded images from history
        if (newAiMessage.isFinalReport) {
            const allUploadedImageUrls: string[] = [];
            for (const entry of newApiHistory) {
                if (entry.role === 'user') {
                    for (const part of entry.parts) {
                        if ('inlineData' in part && part.inlineData.mimeType.startsWith('image/')) {
                            allUploadedImageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                        }
                    }
                }
            }
            newAiMessage.userUploadedImageUrls = allUploadedImageUrls;
        }

        setApiHistory([
            ...newApiHistory,
            { role: 'model', parts: [{ text: aiResponseText }] }
        ]);
        setCurrentAiMessage(newAiMessage);
        setIsLoading(false);
    }, [apiHistory, parseAiResponse, currentAiMessage, consultationType, setConsultationType, generateResponse]); // Removed uploadedVideoFile, analyzeVideo

    const retryLastAction = useCallback(() => {
        if (lastFailedAction) {
            // Removed video-specific retry logic
            processUserAction(lastFailedAction.userText, lastFailedAction.imageFiles);
        }
    }, [lastFailedAction, processUserAction]);


    const handleOptionSelect = (option: string) => {
        if (isLoading) return;

        // This is where "Depuis combien de temps" leads to a number input.
        // The text prompt in constants.ts says: "Depuis combien de temps la lésion est apparue ?" [CHOIX]Moins de deux jours[CHOIX]Quelques jours[CHOIX]Quelques semaines[CHOIX]Quelques mois[CHOIX]Plus d’un an
        // If "Moins de deux jours" is selected, it implicitly means "1" or "0-1" days, but the instruction does not ask for explicit number.
        // It asks for an explicit number only for "Quelques jours", "Quelques semaines", "Quelques mois", "Plus d'un an".
        // Let's refine the condition to only trigger number input for "Quelques jours", "Quelques semaines", "Quelques mois", "Plus d'un an".
        const optionsRequiringNumberInput = ["Quelques jours", "Quelques semaines", "Quelques mois", "Plus d'un an"];

        if (currentAiMessage?.text.includes("Depuis combien de temps la lésion est apparue ?") && optionsRequiringNumberInput.includes(option)) {
            setAwaitingNumberInputForOption(option);
            // Do not send to AI yet, wait for number input
            setIsLoading(false); // Stop loading since we're waiting for local input
        } else {
            processUserAction(option);
        }
    };

    const handleMultiChoiceSubmit = (selectedOptions: string[]) => {
        if (isLoading || selectedOptions.length === 0) return;
        processUserAction(selectedOptions.join(', '));
    };

    const handleTextSubmit = (text: string) => {
        if (isLoading) return;
        if (awaitingNumberInputForOption) {
            const number = parseInt(text, 10);
            if (isNaN(number) || number <= 0) {
                setError("Veuillez entrer un nombre valide (supérieur à 0).");
                setIsLoading(false);
                return;
            }
            const fullAnswer = `${awaitingNumberInputForOption}: ${number}`;
            processUserAction(fullAnswer);
        } else { // Removed awaitingVideoQuestion and uploadedVideoFile conditions
            processUserAction(text);
        }
    };

    const handleNoneSubmit = (noneText: string) => {
        if (isLoading) return;
        processUserAction(noneText);
    };

    const handleFileSelect = (files: File[]) => { // Removed isVideo parameter
        if (isLoading) return;
        // It's always an image upload now
        processUserAction("Voici une ou plusieurs photos de la lésion.", files);
    };

    const handleSkipMedia = () => { // Renamed from handleSkipPhoto to handleSkipMedia
        if (isLoading) return;
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
                    setCurrentAiMessage(parseAiResponse(firstPart.text, `ai-back-media-request-${Date.now()}`));
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
                setCurrentAiMessage(previousAiMessage);

                // Re-evaluate consultationType if going back to the first question
                if (previousAiMessage.text.includes("Cette auto-analyse concerne :")) {
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
            {/* Error display - NOW VISIBLE even if currentAiMessage is null */}
            {error && (
                <div className="w-full max-w-2xl mx-auto border border-red-200 bg-red-50 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center text-center animate-fade-in mb-8" role="alert">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-900 mb-2">Impossible de démarrer l'analyse</h3>
                    <p className="text-red-800 mb-6">{error}</p>
                    <button onClick={retryLastAction || initializeApp} className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium">
                        Réessayer
                    </button>
                    {(error.includes("API_KEY") || error.includes("VITE_API_KEY")) && (
                        <p className="mt-4 text-xs text-red-600/80 bg-red-100/50 p-2 rounded">
                            Note au propriétaire : La clé API n'est pas configurée.
                        </p>
                    )}
                </div>
            )}

            {/* The main questionnaire UI, hidden until initial warning is dismissed AND we have a message */}
            {currentAiMessage && !currentAiMessage.isFinalReport && !showInitialWarningPopup && !error ? (
                { currentAiMessage && !currentAiMessage.isFinalReport && !showInitialWarningPopup && !error ? (
                    <div ref={containerRef} tabIndex={-1} role="region" aria-live="polite" aria-atomic="true" className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col animate-fade-in relative z-10 transition-all duration-300">
                        {(currentStep > 0 && !isGameOver) && ( // Start conditional rendering for the entire progress bar container
                            <div className="flex items-center justify-between mb-8 px-4 py-3 bg-white/5 border border-white/5 rounded-xl backdrop-blur-md">
                                <button onClick={handleBack} className="p-2 text-brand-secondary/60 hover:text-brand-primary transition-colors rounded-full hover:bg-white/5" aria-label="Retour à l'étape précédente">
                                    <BackArrowIcon />
                                </button>
                                <div className="flex-grow mx-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={0} aria-valuemax={TOTAL_QUESTIONNAIRE_STAGES} aria-label={`Progression du questionnaire, étape ${currentStep} sur ${TOTAL_QUESTIONNAIRE_STAGES}`}>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-brand-primary to-blue-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                                            style={{ width: `${(currentStep / TOTAL_QUESTIONNAIRE_STAGES) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {/* Reset Button */}
                                <button
                                    onClick={handleReset}
                                    className="group p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-full"
                                    aria-label="Recommencer la consultation"
                                >
                                    <RedoIcon className="transition-transform group-hover:rotate-180 group-active:rotate-180" />
                                </button>
                            </div>
                        )} {/* End conditional rendering for the entire progress bar container */}

                        {currentAiMessage.text.includes("Cette auto-analyse concerne :") ? (
                            <div className="text-center mb-10 animate-fade-in">
                                <div className="inline-block p-4 rounded-full bg-brand-primary/10 mb-6 ring-1 ring-brand-primary/20">
                                    <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-display font-medium leading-tight mb-6 text-white tracking-tight">
                                    Analyse Dermatologique <span className="text-brand-primary">IA</span>
                                </h1>
                                <p className="text-base md:text-lg font-light leading-relaxed mb-8 text-brand-secondary/80">
                                    Répondez à quelques questions visuelles. <br />
                                    <span className="text-brand-primary font-medium">Précision clinique, simplicité absolue.</span>
                                </p>
                                <p className="text-sm font-medium uppercase tracking-widest text-brand-secondary/40 mb-4">
                                    Pour qui est cette analyse ?
                                </p>
                            </div>
                        ) : (
                            <div key={currentAiMessage.id} className="text-center mb-8 animate-fade-in">
                                <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
                                    {(() => {
                                        const text = currentAiMessage.text;
                                        const qIndex = text.indexOf('?');
                                        if (qIndex !== -1) return text.substring(0, qIndex + 1);
                                        return text;
                                    })()}
                                </h2>
                                {(() => {
                                    const text = currentAiMessage.text;
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

                        {isLoading && !awaitingNumberInputForOption ? ( // Removed awaitingVideoQuestion
                            <div className="flex flex-col items-center justify-center h-48" aria-live="polite" aria-atomic="true" role="status">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></span>
                                    <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                                </div>
                                <p className="mt-4 text-slate-600 text-base animate-fade-in">DERMO-CHECK analyse...</p>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center gap-4"> {/* Added gap-4 for spacing between components */}
                                {currentAiMessage.isPhotoRequest ? (
                                    <FileUpload onFileSelect={handleFileSelect} onSkip={handleSkipMedia} ref={fileUploadRef} />
                                ) : currentAiMessage.isAgeDropdownRequest ? ( // New: Conditional rendering for AgeDropdown
                                    <AgeDropdown
                                        onSubmit={handleTextSubmit}
                                        ref={ageDropdownRef}
                                        minAge={currentAiMessage.ageDropdownMin}
                                        maxAge={currentAiMessage.ageDropdownMax}
                                    />
                                ) : consultationType === 'other' && currentAiMessage.text.includes("Quel est son âge ?") && currentAiMessage.isComboInputRequest ? ( // New: Conditional rendering for age dropdown (Autre personne)
                                    <AgeMonthYearDropdown onSubmit={handleTextSubmit} monthsRef={ageMonthYearDropdownMonthsRef} yearsRef={ageMonthYearDropdownYearsRef} />
                                ) : currentAiMessage.text.includes("Dans quel pays résidez-vous ?") ? ( // Conditional rendering for country dropdown
                                    <CountryDropdown onSubmit={handleTextSubmit} ref={countryDropdownRef} />
                                ) : currentAiMessage.isTextInputRequest || awaitingNumberInputForOption ? ( // Removed currentAiMessage.isQuestionForVideoAnalysis
                                    <TextInput
                                        onSubmit={handleTextSubmit}
                                        placeholder={currentAiMessage.textInputPlaceholder || "Ex: Apparu il y a 3 jours comme un point rouge..."}
                                        showNoneButton={currentAiMessage.hasNoneButton} // Pass this prop to TextInput
                                        onNoneClick={handleNoneSubmit} // Pass generic 'aucun' for text input none
                                        noneButtonText={currentAiMessage.noneButtonText} // Pass the specific none button text
                                        ref={textInputRef}
                                    />
                                ) : null}
                                {currentAiMessage.options && currentAiMessage.isMultiChoice && (
                                    <MultiChoiceOptions
                                        options={currentAiMessage.options}
                                        onSubmit={handleMultiChoiceSubmit}
                                        hasNoneButton={currentAiMessage.hasNoneButton} // Pass the dedicated none button flag
                                        noneButtonText={currentAiMessage.noneButtonText} // Pass the dedicated none button text
                                        onNoneClick={handleNoneSubmit}
                                        optionButtonRefs={optionButtonsRef} // Pass ref for focus
                                    />
                                )}
                                {currentAiMessage.options && !currentAiMessage.isMultiChoice && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md animate-fade-in">
                                        {currentAiMessage.options.map((opt, index) => (
                                            // Fix: Changed ref assignment to explicitly return void.
                                            <OptionButton key={opt} text={opt} onClick={handleOptionSelect} ref={(el: HTMLButtonElement | null) => {
                                                if (optionButtonsRef.current) {
                                                    optionButtonsRef.current[index] = el;
                                                }
                                            }} />
                                        ))}
                                    </div>
                                )}
                                {/* Render dedicated "None" button for single choice questions that have one */}
                                {currentAiMessage.hasNoneButton && currentAiMessage.noneButtonText &&
                                    !currentAiMessage.isMultiChoice && !currentAiMessage.isTextInputRequest &&
                                    !currentAiMessage.isPhotoRequest && !currentAiMessage.isAgeDropdownRequest && // New: exclude age dropdown
                                    !(consultationType === 'other' && currentAiMessage.text.includes("Quel est son âge ?") && currentAiMessage.isComboInputRequest) && !currentAiMessage.text.includes("Dans quel pays résidez-vous ?") && (
                                        <button
                                            type="button"
                                            onClick={() => handleNoneSubmit(currentAiMessage.noneButtonText!)}
                                            className="w-full max-w-md p-4 md:p-5 bg-white border border-gray-200 text-slate-700 rounded-2xl shadow-sm
                                            hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200
                                            ease-in-out transform hover:-translate-y-1 capitalize font-medium text-base md:text-lg mt-2"
                                        >
                                            {currentAiMessage.noneButtonText}
                                        </button>
                                    )}
                            </div>
                        )}
                    </div>
                ) : (
                    currentAiMessage && currentAiMessage.isFinalReport && (
                        <ChatMessage message={currentAiMessage} />
                    )
                )}

            {/* Reset Confirmation Modal */}
            {showResetConfirmation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 animate-fade-in p-4"
                    role="dialog" aria-modal="true" aria-labelledby="reset-confirmation-title"
                >
                    <div
                        ref={resetModalRef}
                        className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl minor-check-popup-scale-in"
                    >
                        <div className="mb-6 flex justify-center text-5xl text-red-500">
                            <span role="img" aria-label="Warning">⚠️</span>
                        </div>
                        <h2 id="reset-confirmation-title" className="text-2xl font-bold text-red-700 mb-4">Confirmer le redémarrage</h2>
                        <p className="text-slate-700 text-base mb-6">
                            Êtes-vous sûr de vouloir recommencer la consultation ? Toutes les réponses actuelles seront perdues.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={confirmReset}
                                className="px-6 py-3 text-white text-base rounded-full hover:opacity-90 transition-colors font-semibold shadow-lg bg-red-600 hover:bg-red-700"
                            >
                                Oui, recommencer
                            </button>
                            <button
                                onClick={cancelReset}
                                className="px-6 py-3 border rounded-full transition-colors font-semibold text-slate-700 hover:bg-gray-100 border-gray-300 text-base"
                                aria-label="Annuler et reprendre la consultation"
                            >
                                Non, annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Initial Warning Popup - Full Screen Overlay */}
            {showInitialWarningPopup && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="initial-warning-title"
                >
                    {/* Opaque Backdrop to hide header/footer completely */}
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" aria-hidden="true"></div>

                    {/* Popup Card */}
                    <div
                        ref={initialWarningModalRef}
                        className="relative w-full max-w-lg bg-gradient-to-b from-[#D1FAE6] to-[#A8E6CF] rounded-[16px] shadow-2xl p-8 flex flex-col items-center text-center transform transition-all duration-500 ease-out animate-fade-in"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                        }}
                        tabIndex={-1}
                    >
                        {/* Icon */}
                        <div className="mb-6 text-5xl animate-bounce">
                            ⚠️
                        </div>

                        {/* Title */}
                        <h2 id="initial-warning-title" className="text-2xl font-bold text-[#063E2E] mb-6 font-['Poppins'] tracking-tight">
                            Avertissement médical
                        </h2>

                        {/* Text Content - Centered, readable, spaced */}
                        <div className="space-y-6 text-[#063E2E] text-base md:text-lg font-medium leading-relaxed font-['Poppins']">
                            <p>
                                Les informations fournies par DermoCheck sont données à titre indicatif et ne remplacent pas une consultation médicale.
                            </p>
                            <p className="font-bold">
                                Aucune donnée n’est sauvegardée.
                            </p>
                            <p>
                                En cas de douleur, fièvre ou aggravation rapide d’une lésion, consultez immédiatement un dermatologue ou un service d’urgence.
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            className="mt-8 bg-white text-[#063E2E] text-base font-bold py-3 px-12 rounded-[12px] shadow-md hover:shadow-lg hover:bg-gray-50 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#063E2E]/50"
                            onClick={() => setShowInitialWarningPopup(false)}
                            aria-label="Fermer l'avertissement et commencer"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Questionnaire;
