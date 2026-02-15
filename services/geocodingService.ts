// Reverse geocoding service to convert coordinates to location name
export const reverseGeocode = async (latitude: number, longitude: number): Promise<{
    country?: string;
    city?: string;
    error?: string;
}> => {
    try {
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
            return { error: "API key not available" };
        }

        // Using Google Maps Geocoding API
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Geocoding API error: ${response.status}`);
            return { error: `HTTP ${response.status}` };
        }

        const data = await response.json();
        console.log("Geocoding API response:", data);

        if (data.status !== "OK" || !data.results || data.results.length === 0) {
            console.error("Geocoding failed:", data.status);
            return { error: data.status };
        }

        // Extract country and city from the first result
        const result = data.results[0];
        let country: string | undefined;
        let city: string | undefined;

        for (const component of result.address_components) {
            if (component.types.includes("country")) {
                country = component.long_name;
            }
            if (component.types.includes("locality")) {
                city = component.long_name;
            }
            // Also try administrative_area_level_2 for city
            if (!city && component.types.includes("administrative_area_level_2")) {
                city = component.long_name;
            }
        }

        console.log(`Reverse geocoded: ${city}, ${country}`);
        return { country, city };
    } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return { error: String(error) };
    }
};
