// Reverse geocoding service to convert coordinates to location name
// Uses OpenStreetMap Nominatim API (free, no API key required)
export const reverseGeocode = async (latitude: number, longitude: number): Promise<{
    country?: string;
    city?: string;
    error?: string;
}> => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=fr`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'DermatoCheck/1.0',
            },
        });

        if (!response.ok) {
            console.error(`Geocoding API error: ${response.status}`);
            return { error: `HTTP ${response.status}` };
        }

        const data = await response.json();
        console.log("Nominatim API response:", data);

        if (data.error) {
            console.error("Geocoding failed:", data.error);
            return { error: data.error };
        }

        const address = data.address;
        if (!address) {
            return { error: "No address found" };
        }

        const country = address.country;
        const city = address.city || address.town || address.village || address.municipality || address.state;

        console.log(`Reverse geocoded: ${city}, ${country}`);
        return { country, city };
    } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return { error: String(error) };
    }
};
