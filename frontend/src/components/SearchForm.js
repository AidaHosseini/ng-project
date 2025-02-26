import { useState } from "react";
import axios from "axios";

const SearchForm = ({ setGraphData }) => {
    const [city, setCity] = useState("");
    const [icdCode, setIcdCode] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();
        console.log("🔵 Search Button Clicked");

        try {
            console.log(`🔵 Sending request to: http://127.0.0.1:5000/search?city=${city}&icd_code=${icdCode}`);
            
            const response = await axios.get("http://127.0.0.1:5000/search", {
                params: { city, icd_code: icdCode },
            });

            console.log("✅ API Response Received:", response.data);
            setGraphData(response.data);
        } catch (error) {
            console.error("❌ API Error:", error);
        }
    };
    const styles = {
        form: {
            marginBottom: "15px", // Adds space between the form and the map
        }
    };
    

    // return (
    //     <div>
    //         <form onSubmit={handleSearch}>
    //             <input
    //                 type="text"
    //                 placeholder="City"
    //                 value={city}
    //                 onChange={(e) => setCity(e.target.value)}
    //             />
    //             <input
    //                 type="text"
    //                 placeholder="ICD Code"
    //                 value={icdCode}
    //                 onChange={(e) => setIcdCode(e.target.value)}
    //             />
    //             <button type="submit">Search</button>
    //         </form>
    //     </div>
    // );

    return (
        <div>
            <form onSubmit={handleSearch} style={styles.form}>
                <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="ICD Code"
                    value={icdCode}
                    onChange={(e) => setIcdCode(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
        </div>
    );
    
};

export default SearchForm;
