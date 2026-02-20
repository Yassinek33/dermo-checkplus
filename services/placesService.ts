// Helper function to fetch place details using Google Places API (New)
export const fetchPlaceDetails = async (placeId: string): Promise<{
    formattedAddress?: string;
    formattedPhoneNumber?: string;
    website?: string;
}> => {
    try {
        const apiKey = import.meta.env.VITE_API_KEY || "AIzaSyCOP7ZJCZ7DiuWCsKPv4vKp-ba3rlnDDnc";
        if (!apiKey) {
            console.warn("API key not available for Places API");
            return {};
        }

        // Using Google Places API (New) - Place Details
        // https://developers.google.com/maps/documentation/places/web-service/place-details
        const url = `https://places.googleapis.com/v1/${placeId}?fields=formattedAddress,internationalPhoneNumber,websiteUri&key=${apiKey}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-FieldMask': 'formattedAddress,internationalPhoneNumber,websiteUri'
            }
        });

        if (!response.ok) {
            console.error(`Places API error: ${response.status} ${response.statusText}`);
            return {};
        }

        const data = await response.json();
        console.log(`Place details for ${placeId}:`, data);

        return {
            formattedAddress: data.formattedAddress,
            formattedPhoneNumber: data.internationalPhoneNumber,
            website: data.websiteUri
        };
    } catch (error) {
        console.error(`Error fetching place details for ${placeId}:`, error);
        return {};
    }
};
