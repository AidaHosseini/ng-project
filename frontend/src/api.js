import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000"; // Flask API URL

export const searchClinics = async (city, icdCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search`, {
            params: { city, icd_code: icdCode }
        });
        console.log("API Response:", response.data);  // Debugging Log 
        return response.data;
    } catch (error) {
        console.error("API error:", error);
        return [];
    }
};

