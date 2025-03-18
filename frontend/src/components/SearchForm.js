import { useState } from "react";
import axios from "axios";

const SearchForm = ({ setGraphData }) => {
    // State for search fields
    const [city, setCity] = useState("");
    const [icdCode, setIcdCode] = useState("");
    const [radius, setRadius] = useState(30); // Default 30 km

    // State for checkboxes (filters)
    const [focus, setFocus] = useState({
        onkologen: false,
        neurologen: false,
    });
    const [providers, setProviders] = useState({
        clinics: false,
        mvz: false,
        asv: false,
        niedergelasseneAertze: false,
    });
    const [cooperation, setCooperation] = useState(false);

    // const handleSearch = async (e) => {
    //     e.preventDefault();
    //     console.log("🔵 Search Button Clicked");
    
    //     try {
    //         console.log(`🔵 Sending request to: http://127.0.0.1:5000/search?city=${city}&icd_code=${icdCode}`);
            
    //         const response = await axios.get("http://127.0.0.1:5000/search", {
    //             params: { city, icd_code: icdCode, radius, focus, providers, cooperation },
    //         });
    
    //         console.log("✅ API Response Received:", response.data);
    
    //         if (response.data.length > 0) {
    //             setGraphData(response.data);  // 🔴 Ensure GraphData is updated
    //         } else {
    //             console.warn("⚠️ No data returned from API");
    //         }
    //     } catch (error) {
    //         console.error("❌ API Error:", error);
    //     }
    const handleSearch = async (e) => {
        e.preventDefault();
        console.log("🔵 Search Button Clicked");
    
        try {
            console.log(`🔵 Sending request to: http://127.0.0.1:5000/search`);
    
            const response = await axios.get("http://127.0.0.1:5000/search", {
                params: {
                    city,
                    icd_code: icdCode,
                    radius,
                    onkologen: focus.onkologen,
                    neurologen: focus.neurologen,
                    clinic: providers.clinics,
                    mvz: providers.mvz,
                    asv: providers.asv,
                    cooperation
                }
            });
    
            console.log("✅ API Response Received:", response.data);
    
            // 🛑 Filter out invalid locations
            const validResults = response.data.filter(loc => (loc.clinic_latitude && loc.clinic_longitude) ||
            (loc.mvz_latitude && loc.mvz_longitude) ||
            (loc.asv_latitude && loc.asv_longitude) ||  // Fixed: loc.asv.longitude → loc.asv_longitude
            (loc.niedergelassene_latitude && loc.niedergelassene_longitude) ||
            (loc.neurologe_latitude && loc.neurologe_longitude) ||
            (loc.onkologe_latitude && loc.onkologe_longitude)
        );
        
            if (validResults.length > 0) {
                setGraphData(validResults);  // ✅ Only use valid locations
            } else {
                console.warn("⚠️ No valid locations in API response!");
                setGraphData([]); // Clear map if no valid results
            }
        } catch (error) {
            console.error("❌ API Error:", error);
        }
    };
    

    return (
        <div style={styles.container}>
            <form onSubmit={handleSearch} style={styles.form}>
                {/* 🟢 FLEX CONTAINER FOR SEARCH FIELDS & GUIDELINE BOX */}
                <div style={styles.searchRow}>
                    
                    {/* 🟢 SEARCH FIELDS (CITY & ICD CODE) */}
                    <div style={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            style={styles.input}
                            required= {true}
                        />
                        <input
                            type="text"
                            placeholder="ICD Code"
                            value={icdCode}
                            onChange={(e) => setIcdCode(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    
                    {/* 🟢 GUIDELINE BOX */}
                    <div style={styles.guideBox}>
                        <strong>Sucheingaben: Diagnosen, Stadt oder eine der folgenden Optionen</strong>
                    </div>
                </div>

                {/* 🟢 RADIUS INPUT */}
                <div style={styles.radiusContainer}>
                    <label>Umkreis  </label>
                    <input
                        type="number"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        style={styles.radiusInput}
                    />
                    <span>km</span>
                </div>

                {/* 🟢 FILTERS (Schwerpunkt, Leistungserbringer & Kooperationen in the same row) */}
                <div style={styles.filterRow}>
                    
                    {/* 🟢 SCHWERPUNKT FILTER */}
                    <div style={styles.filterBox}>
                        <h3>Schwerpunkt</h3>
                        
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={focus.oncology}
                                    onChange={() => setFocus({ onkologen: !focus.onkologen, neurologen: false })}
                                />
                                Onkologie
                            </label>
                        </div>

                        {/* Second row (new line) */}
                        <div style={{ marginTop: "5px" }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={focus.neurology}
                                    onChange={() => setFocus({ neurologen: !focus.neurologen, onkologen: false })}
                                />
                                Neurologie
                            </label>
                        </div>
                    </div>

                    {/* 🟢 LEISTUNGSERBRINGER FILTER (Same Line) */}
                    <div style={styles.filterBox}>
                        <h3>Leistungserbringer</h3>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <label>
                                <input type="checkbox" checked={providers.clinics} onChange={() => setProviders({ ...providers, clinics: !providers.clinics })} />
                                Kliniken
                            </label>
                            <label>
                                <input type="checkbox" checked={providers.mvz} onChange={() => setProviders({ ...providers, mvz: !providers.mvz })} />
                                MVZ
                            </label>
                            <label>
                                <input type="checkbox" checked={providers.asv} onChange={() => setProviders({ ...providers, asv: !providers.asv })} />
                                ASV
                            </label>
                        </div>

                        {/* Move Niedergelassene Ärzte to a new line */}
                        <div style={{ marginTop: "5px" }}>
                            <label>
                                <input type="checkbox" checked={providers.niedergelasseneAertze} onChange={() => setProviders({ ...providers, niedergelasseneAertze: !providers.niedergelasseneAertze })} />
                                Niedergelassene Ärzte
                            </label>
                        </div>
                    </div>


                    {/* 🟢 KOOPERATIONEN TOGGLE (Same Row) */}
                    <div style={styles.filterBox}>
                        <h3>Kooperationen</h3>
                        <label>
                            <input
                                type="checkbox"
                                checked={cooperation}
                                onChange={() => setCooperation(!cooperation)}
                            />
                            Kooperationen anzeigen
                        </label>
                    </div>

                </div>

                {/* 🟢 SEARCH BUTTON */}
                <button type="submit" style={styles.searchButton}>Suche</button>
            </form>
        </div>
    );
};


// 🟢 CSS STYLES
const styles = {
    container: {
        padding: "10px",
        borderRadius: "8px",
        border: "2px solid #b3e5fc",
        backgroundColor: "#f9f9f9",
        width: "59%",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        overflow: "auto",
        marginBottom: "5px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
    },
    searchRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    inputContainer: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flex: "2",
    },
    input: {
        fontSize: "12px",
        padding: "5px",
        width: "100%",
    },
    guideBox: {
        flex: "3",
        backgroundColor: "#e3f2fd",
        justifyContent: "space-between",
        padding: "5px",
        borderRadius: "5px",
        fontSize: "14px",
        marginleft: "10px",
        marginwidth: "10px",
        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
    },
    filterRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        width: "100%",
    },
    filterBox: {
        flex: 1,
        backgroundColor: "#fff",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
        fontSize: "12px",
        width: "30%", // Adjusted for three columns
        minWidth: "250px", // Set a minimum width to keep them the same
        height: "100px", // Adjust the height as needed
        justifyContent: "space-between", // Keeps content aligned
    },
    searchButton: {
        padding: "10px",
        backgroundColor: "#007BFF",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        width: "10%",
        fontSize: "14px",
    },
};

export default SearchForm;
