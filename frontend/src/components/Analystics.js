// import React, { useState, useEffect } from "react";
// import { useLocation } from "./LocationContext";
// import axios from "axios";

// // Function to get attributes from API
// const getAttribute = async (IDs = []) => { 
//     try {
//         console.log(`🔵 Sending request to: http://127.0.0.1:5000/search with IDs:`, IDs);

//         const response = await axios.get("http://127.0.0.1:5000/search", {
//             params: { ID: IDs },
//         });

//         console.log("✅ API Response Received:", response.data);
//         return response.data; // Return data instead of setting state here
//     } catch (error) {
//         console.error("❌ API Error:", error);
//         return {}; // Return empty object on failure
//     }
// };

// // Function to get road distance from OSRM API
// const getRoadDistance = async (lat1, lon1, lat2, lon2) => {
//     const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//         if (data.routes && data.routes.length > 0) {
//             return (data.routes[0].distance / 1000).toFixed(2); // Convert meters to km
//         } else {
//             return "N/A";
//         }
//     } catch (error) {
//         console.error("Error fetching road distance:", error);
//         return "N/A";
//     }
// };

// const Analystics = () => {
//     const { allLocations } = useLocation();
//     const [distances, setDistances] = useState({});
//     const [attributes, setAttributes] = useState({});

//     // Find the user's location (if available)
//     const userLocation = allLocations.find(loc => loc.clinic_name === "Your Location");

//     // Fetch attributes for all clinics
//     useEffect(() => {
//         const fetchAttributes = async () => {
//             if (allLocations.length > 0) {
//                 const IDs = allLocations.map(loc => loc.clinic_id);
//                 const attributeData = await getAttribute(IDs);
//                 setAttributes(attributeData); // Update state with fetched data
//             }
//         };

//         fetchAttributes();
//     }, [allLocations]);

//     // Fetch road distances between the user's location and all other clinics
//     useEffect(() => {
//         const fetchDistances = async () => {
//             if (!userLocation) return;

//             const newDistances = {};
//             for (const location of allLocations) {
//                 if (location.clinic_name === "Your Location") continue;

//                 const roadDistance = await getRoadDistance(
//                     userLocation.latitude, userLocation.longitude,
//                     location.latitude, location.longitude
//                 );

//                 newDistances[location.clinic_name] = roadDistance;
//             }

//             setDistances(newDistances);
//         };

//         fetchDistances();
//     }, [userLocation, allLocations]);

//     return (
//         <div>
//             <h3>Analystic Data</h3>
//             {allLocations.length > 0 ? (
//                 <ul>
//                     {allLocations.map((location, index) => {
//                         if (location.clinic_name === "Your Location") return null;

//                         return (
//                             <li key={index}>
//                                 {location.clinic_name} 
//                                 <br />
//                                 Road Distance: {distances[location.clinic_name] || "Calculating..."} km
//                                 <br />
//                                 Attributes: {JSON.stringify(attributes[location.clinic_id] || "Loading...")}
//                             </li>
//                         );
//                     })}
//                 </ul>
//             ) : (
//                 <p>No data available.</p>
//             )}
//         </div>
//     );
// };

// export default Analystics;



import React, { useState, useEffect } from "react";
import { useLocation } from "./LocationContext";
import axios from "axios";

// Function to get attributes from API
const getAttribute = async (IDs = []) => { 
    try {
        console.log(`🔵 Sending request to: http://127.0.0.1:5000/search with IDs:`, IDs);

        const response = await axios.get("http://127.0.0.1:5000/search", {
            params: { ID: IDs },
        });

        console.log("✅ API Response Received:", response.data);
        return response.data; // Return data instead of setting state here
    } catch (error) {
        console.error("❌ API Error:", error);
        return {}; // Return empty object on failure
    }
};

// Function to get road distance from OSRM API
const getRoadDistance = async (lat1, lon1, lat2, lon2) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            return (data.routes[0].distance / 1000).toFixed(2); // Convert meters to km
        } else {
            return "N/A";
        }
    } catch (error) {
        console.error("Error fetching road distance:", error);
        return "N/A";
    }
};

const Analystics = () => {
    const { allLocations } = useLocation();
    const [distances, setDistances] = useState({});
    const [attributes, setAttributes] = useState({});

    // Find the user's location (if available)
    const userLocation = allLocations.find(loc => loc.clinic_name === "Your Location");

    // Fetch attributes for all clinics
    useEffect(() => {
        const fetchAttributes = async () => {
            if (allLocations.length > 0) {
                const IDs = allLocations.map(loc => loc.clinic_id);
                const attributeData = await getAttribute(IDs);
                setAttributes(attributeData); // Update state with fetched data
            }
        };

        fetchAttributes();
    }, [allLocations]);

    // Fetch road distances between the user's location and all other clinics
    useEffect(() => {
        const fetchDistances = async () => {
            if (!userLocation) return;

            const newDistances = {};
            for (const location of allLocations) {
                if (location.clinic_name === "Your Location") continue;

                const roadDistance = await getRoadDistance(
                    userLocation.latitude, userLocation.longitude,
                    location.latitude, location.longitude
                );

                newDistances[location.clinic_name] = roadDistance;
            }

            setDistances(newDistances);
        };

        fetchDistances();
    }, [userLocation, allLocations]);

    return (
        <>
            {/* Informations Box */}
            <div style={styles.informationsContainer}>
                <h3 style={styles.title}>Informations</h3>
                <p>This section provides general insights based on selected locations.</p>
            </div>

            {/* Analystics Box */}
            <div style={styles.analysticContainer}>
                <h3 style={styles.title}>Analystic Data</h3>
                {allLocations.length > 0 ? (
                    <ul style={styles.list}>
                        {allLocations.map((location, index) => {
                            if (location.clinic_name === "Your Location") return null;

                            return (
                                <li key={index} style={styles.listItem}>
                                    {location.clinic_name} 
                                    <br />
                                    Road Distance: <span style={styles.bold}>{distances[location.clinic_name] || "Calculating..."} km</span>
                                    <br />
                                    Attributes: <span style={styles.bold}>{JSON.stringify(attributes[location.clinic_id] || "Loading...")}</span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p style={styles.noData}>No data available.</p>
                )}
            </div>
        </>
    );
};

// CSS-in-JS styles
const styles = {
    informationsContainer: {
        width: "35%",
        fontWeight: "600",
        position: "absolute",
        right: 0,
        top: "100px", // Position above Analystics
        padding: "20px",
        backgroundColor: "#e3f2fd",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        marginBottom: "20px",
    },
    analysticContainer: {
        width: "35%",
        fontWeight: "600",
        position: "absolute",
        right: 0,
        top: "220px", // Positioned right below Informations
        padding: "20px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
    },
    title: {
        fontSize: "20px",
        marginBottom: "10px"
    },
    list: {
        listStyleType: "none",
        padding: 0
    },
    listItem: {
        marginBottom: "10px",
        padding: "10px",
        borderBottom: "1px solid #ddd"
    },
    bold: {
        fontWeight: "600"
    },
    noData: {
        fontStyle: "italic",
        color: "#999"
    }
};

export default Analystics;
