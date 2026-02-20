/// <reference types="vite/client" />
import { GoogleGenAI, Tool, ToolConfig, RetrievalConfig, LatLng, GenerateContentResponse } from "@google/genai";
import { getSystemInstruction } from '../constants'; // Import the function
import { GeminiContent, GeminiImagePart, GeminiTextPart } from '../types'; // Removed GeminiVideoPart

// if (!import.meta.env.VITE_API_KEY) {
//     throw new Error("VITE_API_KEY environment variable not set");
// }

let assistant: GoogleGenAI | null = null; // Initialize lazily

// Function to get or create the GoogleGenAI client
const getGeminiClient = () => {
    // Recreate the client each time to ensure it uses the most up-to-date API key
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
        console.warn("VITE_API_KEY is not set. AI features will not work.");
        // We can throw here, or let the specific call fail. Throwing here is safer for the call.
        throw new Error("VITE_API_KEY environment variable not set. Please configure it in Vercel.");
    }
    assistant = new GoogleGenAI({ apiKey });
    return assistant;
};


const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

export const fileToGenerativePart = async (file: File): Promise<GeminiImagePart> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

// Removed videoFileToGenerativePart function

export const generateResponse = async (
    history: GeminiContent[],
    newUserText: string,
    imageFiles?: File[] | null,
    systemInstruction?: string
): Promise<string> => {

    const aiClient = getGeminiClient(); // Get the client

    const userParts: (GeminiTextPart | GeminiImagePart)[] = [{ text: newUserText }];

    if (imageFiles && imageFiles.length > 0) {
        const imageParts = await Promise.all(imageFiles.map(file => fileToGenerativePart(file)));
        userParts.push(...imageParts);
    }

    const contents: GeminiContent[] = [
        ...history,
        { role: 'user', parts: userParts }
    ];

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await aiClient.models.generateContent({
                model: "gemini-2.0-flash",
                contents: contents,
                config: {
                    systemInstruction: systemInstruction || getSystemInstruction() // Use passed instruction or default
                }
            });
            return response.text; // Success
        } catch (error: any) {
            const errorMessage = error.toString();
            // Check for retriable errors: 503 (Unavailable/Overloaded), 429 (Resource Exhausted)
            const isRetriableError = (
                error.code === 503 ||
                errorMessage.includes("503") ||
                errorMessage.includes("UNAVAILABLE") ||
                errorMessage.includes("overloaded") ||
                errorMessage.includes("RESOURCE_EXHAUSTED") ||
                errorMessage.includes("429")
            );

            if (isRetriableError && i < MAX_RETRIES - 1) {
                const delay = INITIAL_DELAY * Math.pow(2, i);
                console.log(`Retriable API error (${error.code || 'unknown'}): ${errorMessage}. Retrying in ${delay}ms... (Attempt ${i + 1})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; // Go to next iteration to retry
            }

            // For other errors or max retries reached, handle and return error message
            console.error("Error generating response:", error);
            if (isRetriableError) { // If it was a retriable error but retries failed
                return "SERVICE_ERROR: Le service est actuellement surchargé ou temporairement indisponible. Veuillez patienter quelques instants avant de réessayer.";
            }
            return "SERVICE_ERROR: Désolé, une erreur de communication inattendue s'est produite. Veuillez réessayer.";
        }
    }

    // This should not be reached, but as a fallback.
    return "SERVICE_ERROR: Échec de la communication après plusieurs tentatives.";
};

/**
 * Generates an image based on a prompt and aspect ratio.
 */
/*
export const generateImage = async (prompt: string, aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'): Promise<string> => {
    const aiClient = getGeminiClient();
    try {
        const response = await aiClient.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error: any) {
        console.error("Error generating image from Imagen:", error);
        throw new Error(`IMAGE_GENERATION_ERROR: ${error.message || "Échec de la génération d'image."}`);
    }
};
*/

/**
 * Removed analyzeVideo function
 */
/*
export const analyzeVideo = async (videoFile: File, question: string): Promise<string> => {
    const aiClient = getGeminiClient();
    const videoPart = await videoFileToGenerativePart(videoFile);

    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: 'gemini-2.5-pro', // Using gemini-2.5-pro for video understanding
            contents: [{ parts: [videoPart, { text: question }] }],
        });
        return response.text;
    } catch (error: any) {
        console.error("Error analyzing video from Gemini Pro:", error);
        throw new Error(`VIDEO_ANALYSIS_ERROR: ${error.message || "Échec de l'analyse vidéo."}`);
    }
};
*/

/**
 * Searches for dermatologists using Google Maps grounding.
 * @param country The country to search in (optional if using userLatLng).
 * @param city The city to search in (optional if using userLatLng).
 * @param userLatLng Optional user's current latitude and longitude for more localized results.
 * @returns The GenerateContentResponse from the Gemini API, containing groundingMetadata.
 */
export const searchDermatologistsWithMaps = async (
    country: string,
    city: string,
    userLatLng?: LatLng | null,
    searchLanguage: string = "fr"
): Promise<GenerateContentResponse> => {
    const assistantClient = getGeminiClient();

    const tools: Tool[] = [{ googleMaps: {} }];
    const toolConfig: ToolConfig = {};

    if (userLatLng) {
        toolConfig.retrievalConfig = {
            latLng: userLatLng
        };
    }

    // Dynamic prompt generation - Natural language is best for Grounding Tools
    let prompt = "";
    // Adapted details request in the target language if possible, but keeping logic clear
    const detailsRequest = "Fournis pour chaque résultat : nom complet, adresse exacte, téléphone et site web. Priorise la proximité et la qualité.";

    if (city && country) {
        prompt = `### REQUÊTE CRITIQUE : RECHERCHE STRICTE (${searchLanguage})
Recherche en langue "${searchLanguage}" les dermatologues situés **EXCLUSIVEMENT** dans la ville de **${city}** en **${country}**. 
- **INTERDICTION ABSOLUE** : Ne montre AUCUN résultat situé dans une autre ville, même voisine.
- **VÉRIFICATION REQUISE** : Pour chaque résultat, vérifie que l'adresse mentionne explicitement "${city}" et "${country}". 
- Si aucun dermatologue n'est trouvé exactement dans "${city}", réponds qu'aucun résultat n'est disponible.
${detailsRequest}`;
    } else if (country) {
        prompt = `### REQUÊTE CRITIQUE : RECHERCHE NATIONALE STRICTE (${searchLanguage})
Recherche en langue "${searchLanguage}" les dermatologues situés **UNIQUEMENT** à l'intérieur des frontières du pays : **${country}**. 
- **CONSIGNE** : Filtre rigoureusement pour ne garder **QUE** les établissements situés en **${country}**. 
${detailsRequest}`;
    } else if (userLatLng) {
        console.log(`Building geolocation prompt with Lat: ${userLatLng.latitude}, Lng: ${userLatLng.longitude}`);

        // Determine approximate location from coordinates for better prompt
        const lat = userLatLng.latitude;
        const lng = userLatLng.longitude;

        // Rough continent/region detection to help the AI
        let regionHint = "";
        if (lat >= 35 && lat <= 72 && lng >= -10 && lng <= 40) {
            regionHint = "Europe";
        } else if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) {
            regionHint = "North America";
        } else if (lat >= -56 && lat <= 13 && lng >= -82 && lng <= -34) {
            regionHint = "South America";
        } else if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) {
            regionHint = "Africa";
        } else if (lat >= -47 && lat <= 55 && lng >= 25 && lng <= 180) {
            regionHint = "Asia/Oceania";
        }

        prompt = `### REQUÊTE CRITIQUE : GÉOLOCALISATION PRÉCISE (${searchLanguage})

**COORDONNÉES EXACTES** : Latitude ${lat}, Longitude ${lng}
${regionHint ? `**RÉGION DÉTECTÉE** : ${regionHint}` : ''}

**INSTRUCTIONS IMPÉRATIVES** :
1. Utilise UNIQUEMENT ces coordonnées GPS exactes pour la recherche
2. Identifie le PAYS et la VILLE correspondant à ces coordonnées
3. Ne cherche QUE dans ce pays, JAMAIS dans un autre pays
4. Rayon maximum : 15 kilomètres autour de ces coordonnées
5. Trie les résultats par distance croissante (les plus proches en premier)
6. Si aucun dermatologue n'existe dans ce rayon, réponds qu'aucun résultat n'est disponible

**INTERDICTIONS ABSOLUES** :
- ❌ Ne propose JAMAIS de résultats dans un autre pays
- ❌ Ne propose JAMAIS de résultats au-delà de 15km
- ❌ Ne propose JAMAIS de résultats par défaut si les coordonnées ne correspondent à aucun lieu

${detailsRequest}`;
    } else {
        prompt = `Trouve des dermatologues certifiés. ${detailsRequest}`;
    }

    console.log("Final prompt:", prompt);
    console.log("Final toolConfig:", JSON.stringify(toolConfig, null, 2));

    try {
        const response = await assistantClient.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: tools,
                toolConfig: toolConfig,
            },
        });
        return response;
    } catch (error: any) {
        console.error("Error searching dermatologists with Maps Grounding (JSON Mode):", error);
        throw new Error(`MAPS_API_ERROR: ${error.message || "Failed to search for dermatologists."}`);
    }
};