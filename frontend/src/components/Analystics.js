// import React, { useState, useEffect } from "react";
// import { useLocation } from "./LocationContext";

// // Function to get road distance from OSRM API
// const getRoadDistance = async (startLat, startLon, endLat, endLon) => {
//     const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=false`;

//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//         if (data.routes && data.routes.length > 0) {
//             return (data.routes[0].distance / 1000).toFixed(2); // Convert meters to km
//         } else {
//             return "N/A";
//         }
//     } catch (error) {
//         console.error("❌ Error fetching road distance:", error);
//         return "N/A";
//     }
// };

// const Analystics = () => {
//     const { allLocations } = useLocation();
//     const [distances, setDistances] = useState({});
    
//     // Extract Unique ICD Name & Fallzahl (Only Once)
//     const uniqueICDInfo = allLocations.length > 0
//         ? { 
//             icd_name: allLocations[0].icd_name || "N/A",
//             icd_fallzahl: allLocations[0].icd_fallzahl || "N/A"
//         } : null;

//     // Find the user's location (if available)
//     const userLocation = allLocations.find(loc => loc.clinic_name === "Your Location");

//     // Fetch road distances between the user's location and all clinics
//     useEffect(() => {
//         const fetchDistances = async () => {
//             if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
//                 console.warn("⚠️ No valid user location found!");
//                 return;
//             }

//             const newDistances = {};
//             for (const clinic of allLocations) {
//                 if (clinic.clinic_name === "Your Location") continue; // Skip user location

//                 const roadDistance = await getRoadDistance(
//                     userLocation.latitude, userLocation.longitude, // User's location
//                     clinic.clinic_latitude, clinic.clinic_longitude // Clinic's location
//                 );

//                 newDistances[clinic.clinic_name] = roadDistance;
//             }

//             setDistances(newDistances);
//         };

//         fetchDistances();
//     }, [userLocation, allLocations]);

//     return (
//         <>
//             {/* Informations Box - ICD Name & ICD Fallzahl (Displayed Once) */}
//             {uniqueICDInfo && (
//                 <div style={styles.informationsContainer}>
//                     <h3 style={styles.title}>Informationen zur Krankheit</h3>
//                     <p><strong>ICD Name:</strong> {uniqueICDInfo.icd_name}</p>
                    
//                 </div>
//             )}

//             {/* Leistungserbringer Informations */}
//             <div style={styles.analysticContainer}>
//                 <h3 style={styles.title}>Leistungserbringer Informationen</h3>
//                 {allLocations.length > 0 ? (
//                     <ul style={styles.list}>
//                         {allLocations.map((clinic, index) => {
//                             if (clinic.clinic_name === "Your Location") return null; // Skip user location

//                             return (
//                                 <li key={index} style={styles.listItem}>
//                                     {/* Circle icon before clinic name */}
//                                     <span 
//                                         style={{
//                                             color: lineColors[index % lineColors.length], 
//                                             fontSize: "14px",  
//                                             marginRight: "5px",
//                                             display: "inline-block",
//                                             width: "12px",
//                                             height: "12px",
//                                             borderRadius: "50%",
//                                             backgroundColor: lineColors[index % lineColors.length],
//                                         }}>
//                                     </span>
//                                     <strong>{clinic.clinic_name}</strong> <br />
//                                     <strong>Stadt:</strong> {clinic.clinic_city || "N/A"} <br />
//                                     <strong>Chefarzt:</strong> {clinic.clinic_chefarzts || "N/A"} <br />
//                                     <strong>Addresse:</strong> {clinic.clinic_address || "N/A"} <br />
//                                     <strong>Anzahl von Betten:</strong> {clinic.clinic_number_of_beds || "N/A"} <br />
//                                     <strong>Entfernung:</strong> <span style={styles.bold}>{distances[clinic.clinic_name] || "Calculating..."} km</span>
//                                 </li>


//                             );
//                         })}
//                     </ul>
//                 ) : (
//                     <p style={styles.noData}>No data available.</p>
//                 )}
//             </div>
//         </>
//     );
// };

// // CSS-in-JS styles
// const styles = {
//     informationsContainer: {
//         width: "35%",
//         fontWeight: "600",
//         position: "absolute",
//         border: "2px solid #b3e5fc",
//         right: "10px",
//         top: "130px",
//         padding: "15px",
//         backgroundColor: "#e1ecf0",
//         boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
//         borderRadius: "8px",
//         marginBottom: "15px",
//         fontSize: "12px",
//     },
//     analysticContainer: {
//         width: "35%",
//         fontWeight: "600",
//         border: "2px solid #b3e5fc",
//         position: "absolute",
//         right: "10px",
//         top: "235px",
//         padding: "15px",
//         backgroundColor: "#e1ecf0",
//         boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
//         borderRadius: "8px",
//         fontSize: "12px",
//     },
//     title: {
//         fontSize: "14px",
//         marginBottom: "8px"
//     },
//     list: {
//         listStyleType: "none",
//         padding: 0,
//         margin: 0
//     },
//     listItem: {
//         marginBottom: "8px", // Reduce spacing between each item
//         padding: "8px",
//         borderBottom: "1px solid #ddd"
//     },
//     bold: {
//         fontWeight: "600"
//     },
//     noData: {
//         fontStyle: "italic",
//         color: "#999"
//     }
// };

// // Colors for circles (same as lines)
// const lineColors = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];

// export default Analystics;


// // import React, { useState, useEffect, useMemo } from "react";
// // import { useLocation } from "./LocationContext";

// // // 🚀 Function to get road distance from OSRM API
// // const getRoadDistance = async (startLat, startLon, endLat, endLon) => {
// //     if (!startLat || !startLon || !endLat || !endLon) {
// //         console.warn("🚨 Missing coordinates for distance calculation!", { startLat, startLon, endLat, endLon });
// //         return "N/A";
// //     }

// //     const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=false`;

// //     try {
// //         const response = await fetch(url);
// //         const data = await response.json();
// //         if (data.routes && data.routes.length > 0) {
// //             return (data.routes[0].distance / 1000).toFixed(2); // Convert meters to km
// //         } else {
// //             console.warn("⚠️ No valid route found for coordinates:", { startLat, startLon, endLat, endLon });
// //             return "N/A";
// //         }
// //     } catch (error) {
// //         console.error("❌ Error fetching road distance:", error);
// //         return "N/A";
// //     }
// // };

// // const Analystics = () => {
// //     const { allLocations } = useLocation();
// //     const [distances, setDistances] = useState({});

// //     // ✅ Extract Unique ICD Information (Only Once)
// //     const uniqueICDInfo = useMemo(() => {
// //         return allLocations.length > 0
// //             ? { 
// //                 icd_name: allLocations[0].icd_name || "N/A",
// //                 icd_fallzahl: allLocations[0].icd_fallzahl || "N/A"
// //             } 
// //             : null;
// //     }, [allLocations]);

// //     // ✅ Find User's Location
// //     const userLocation = useMemo(() => 
// //         allLocations.find(loc => loc.clinic_name === "Your Location"), 
// //         [allLocations]
// //     );

// //     // ✅ Fetch Road Distances between User & Providers
// //     useEffect(() => {
// //         const fetchDistances = async () => {
// //             if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
// //                 console.warn("⚠️ No valid user location found!");
// //                 return;
// //             }

// //             const newDistances = {};
// //             for (const provider of allLocations) {
// //                 if (provider.clinic_name === "Your Location") continue; // Skip user location

// //                 const providerLat = provider.clinic_latitude || provider.mvz_latitude || provider.neurologe_latitude || provider.onkologe_latitude;
// //                 const providerLon = provider.clinic_longitude || provider.mvz_longitude || provider.neurologe_longitude || provider.onkologe_longitude;

// //                 if (!providerLat || !providerLon) {
// //                     console.warn(`⚠️ Skipping provider with missing coordinates: ${provider.clinic_name || provider.mvz_name || provider.neurologe_name || provider.onkologe_name}`);
// //                     continue;
// //                 }

// //                 const roadDistance = await getRoadDistance(
// //                     userLocation.latitude, userLocation.longitude, // User's location
// //                     providerLat, providerLon // Provider's location
// //                 );

// //                 newDistances[provider.clinic_name] = roadDistance;
// //             }

// //             setDistances(newDistances);
// //         };

// //         fetchDistances();
// //     }, [userLocation, allLocations]);

// //     return (
// //         <>
// //             {/* 📌 ICD Information Section */}
// //             {uniqueICDInfo && (
// //                 <div style={styles.informationsContainer}>
// //                     <h3 style={styles.title}>Kooperationen</h3>
// //                     <p><strong>ICD Name:</strong> {uniqueICDInfo.icd_name}</p>
// //                     <p><strong>Fallzahl:</strong> {uniqueICDInfo.icd_fallzahl}</p>
// //                 </div>
// //             )}

// //             {/* 📌 Leistungserbringer (Providers) Information */}
// //             <div style={styles.analysticContainer}>
// //                 <h3 style={styles.title}>Leistungserbringer Informationen</h3>
// //                 {allLocations.length > 0 ? (
// //                     <ul style={styles.list}>
// //                         {allLocations.map((provider, index) => {
// //                             if (provider.clinic_name === "Your Location") return null; // Skip user location

// //                             return (
// //                                 <li key={index} style={styles.listItem}>
// //                                     {/* 🔵 Colored Circle Indicator */}
// //                                     <span 
// //                                         style={{
// //                                             color: lineColors[index % lineColors.length], 
// //                                             fontSize: "14px",  
// //                                             marginRight: "5px",
// //                                             display: "inline-block",
// //                                             width: "12px",
// //                                             height: "12px",
// //                                             borderRadius: "50%",
// //                                             backgroundColor: lineColors[index % lineColors.length],
// //                                         }}>
// //                                     </span>
// //                                     <strong>{provider.clinic_name || provider.mvz_name || provider.neurologe_name || provider.onkologe_name}</strong> <br />
// //                                     <strong>Stadt:</strong> {provider.clinic_city || provider.mvz_city || provider.neurologe_city || provider.onkologe_city || "N/A"} <br />
// //                                     <strong>Chefarzt:</strong> {provider.clinic_chefarzts || "N/A"} <br />
// //                                     <strong>Addresse:</strong> {provider.clinic_address || provider.mvz_address || provider.neurologe_address || provider.onkologe_address || "N/A"} <br />
// //                                     <strong>Anzahl von Betten:</strong> {provider.clinic_number_of_beds || "N/A"} <br />
// //                                     <strong>Entfernung:</strong> <span style={styles.bold}>{distances[provider.clinic_name] || "Calculating..."} km</span>
// //                                 </li>
// //                             );
// //                         })}
// //                     </ul>
// //                 ) : (
// //                     <p style={styles.noData}>No data available.</p>
// //                 )}
// //             </div>
// //         </>
// //     );
// // };

// // // 🎨 CSS Styles
// // const styles = {
// //     informationsContainer: {
// //         width: "35%",
// //         fontWeight: "600",
// //         position: "absolute",
// //         border: "2px solid #b3e5fc",
// //         right: "10px",
// //         top: "130px",
// //         bottom : "570px",
// //         padding: "15px",
// //         backgroundColor: "#e1ecf0",
// //         boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
// //         borderRadius: "8px",
// //         marginBottom: "15px",
// //         fontSize: "12px",
// //     },
// //     analysticContainer: {
// //         width: "35%",
// //         fontWeight: "600",
// //         border: "2px solid #b3e5fc",
// //         position: "absolute",
// //         right: "10px",
// //         top: "235px",
// //         padding: "15px",
// //         backgroundColor: "#e1ecf0",
// //         boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
// //         borderRadius: "8px",
// //         fontSize: "12px",
// //     },
// //     title: {
// //         fontSize: "14px",
// //         marginBottom: "8px"
// //     },
// //     list: {
// //         listStyleType: "none",
// //         padding: 0,
// //         margin: 0
// //     },
// //     listItem: {
// //         marginBottom: "8px", // Reduce spacing between each item
// //         padding: "8px",
// //         borderBottom: "1px solid #ddd"
// //     },
// //     bold: {
// //         fontWeight: "600"
// //     },
// //     noData: {
// //         fontStyle: "italic",
// //         color: "#999"
// //     }
// // };
// // const lineColors = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];
// // export default Analystics;

import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "./LocationContext";

// 🎯 Predefined colors for providers
const lineColors = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];

// 🚀 Function to get road distance from OSRM API
const getRoadDistance = async (startLat, startLon, endLat, endLon) => {
    if (!startLat || !startLon || !endLat || !endLon) {
        console.warn("🚨 Missing coordinates for distance calculation!", { startLat, startLon, endLat, endLon });
        return "N/A";
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=false`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            return (data.routes[0].distance / 1000).toFixed(2); // Convert meters to km
        } else {
            console.warn("⚠️ No valid route found for coordinates:", { startLat, startLon, endLat, endLon });
            return "N/A";
        }
    } catch (error) {
        console.error("❌ Error fetching road distance:", error);
        return "N/A";
    }
};

const Analystics = () => {
    const { allLocations } = useLocation();
    const [distances, setDistances] = useState({});

    // ✅ Extract Unique ICD Information (Only Once)
    const uniqueICDInfo = useMemo(() => {
        return allLocations.length > 0
            ? { 
                
                icd_name: allLocations[0].icd_name || "N/A",
                icd_fallzahl: allLocations[0].icd_fallzahl || "N/A"
            } 
            : null;
    }, [allLocations]);

    // ✅ Find User's Location
    const userLocation = useMemo(() => 
        allLocations.find(loc => loc.clinic_name === "Your Location"), 
        [allLocations]
    );

    // ✅ Fetch Road Distances for ALL PROVIDERS
    useEffect(() => {
        const fetchDistances = async () => {
            if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
                console.warn("⚠️ No valid user location found!");
                return;
            }

            const newDistances = {};

            for (const provider of allLocations) {
                if (provider.clinic_name === "Your Location") continue; // Skip user location

                // 🔹 Identify the provider type dynamically
                const providerType = provider.clinic_name 
                    ? "clinic"
                    : provider.mvz_name 
                    ? "mvz"
                    : provider.asv_name 
                    ? "asv"
                    : provider.niedergelassene_name 
                    ? "niedergelassene"
                    : null;

                const providerName = provider.clinic_name || provider.mvz_name || provider.asv_name || provider.niedergelassene_name;

                if (!providerType || !providerName) continue;

                const providerLat = provider.clinic_latitude || provider.mvz_latitude || provider.asv_latitude || provider.niedergelassene_latitude;
                const providerLon = provider.clinic_longitude || provider.mvz_longitude || provider.asv_longitude || provider.niedergelassene_longitude;

                if (!providerLat || !providerLon) {
                    console.warn(`⚠️ Skipping provider with missing coordinates: ${providerName}`);
                    continue;
                }

                // 🔹 Fetch the road distance
                const roadDistance = await getRoadDistance(
                    userLocation.latitude, userLocation.longitude, 
                    providerLat, providerLon
                );

                // 🔹 Store distance dynamically
                newDistances[`${providerType}-${providerName}`] = roadDistance;
            }

            setDistances(newDistances);
        };

        fetchDistances();
    }, [userLocation, allLocations]);

    return (
        <>
            {/* 📌 ICD Information Section
            {uniqueICDInfo && (
                <div style={styles.informationsContainer}>
                    <h3 style={styles.title}>Informationen zur Kooperationen</h3>
                    <p><strong>Kooperation mit :</strong> {uniqueICDInfo.icd_name}</p>
                    <p><strong>Fallzahl:</strong> {uniqueICDInfo.icd_fallzahl}</p>
                </div>
            )} */}
            <div style={styles.informationsContainer} >
            <h3 style={styles.title}>Informationen zur Kooperationen</h3>
            </div>
            {/* 📌 Leistungserbringer (Providers) Information */}
            <div style={styles.analysticContainer}>
                <h3 style={styles.title}>Leistungserbringer Informationen</h3>
                {allLocations.length > 0 ? (
                    <ul style={styles.list}>
                        {allLocations.map((provider, index) => {
                            if (provider.clinic_name === "Your Location") return null; // Skip user location

                            // 🔹 Dynamically determine provider type and name
                            const providerType = provider.clinic_name 
                                ? "clinic"
                                : provider.mvz_name 
                                ? "mvz"
                                : provider.asv_name 
                                ? "asv"
                                : provider.niedergelassene_name 
                                ? "niedergelassene"
                                : null;

                            const providerName = provider.clinic_name || provider.mvz_name || provider.asv_name || provider.niedergelassene_name;

                            if (!providerType || !providerName) return null;

                            return (
                                <li key={index} style={styles.listItem}>
                                    {/* 🔵 Colored Circle Indicator */}
                                    <span 
                                        style={{
                                            color: lineColors[index % lineColors.length], 
                                            fontSize: "14px",  
                                            marginRight: "5px",
                                            display: "inline-block",
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            backgroundColor: lineColors[index % lineColors.length],
                                        }}>
                                    </span>
                                    <strong>{providerName}</strong> <br />
                                    <strong>Stadt:</strong> {provider.clinic_city || provider.mvz_city || provider.asv_city || provider.niedergelassene_city || "N/A"} <br />
                                    <strong>Addresse:</strong> {provider.clinic_address || provider.mvz_address || provider.asv_address || provider.niedergelassene_address || "N/A"} <br />
                                    <strong>Anzahl von Betten:</strong> {provider.clinic_number_of_beds || "N/A"} <br />
                                    <strong>Kooperation:</strong> {provider.cooperation || "N/A"} <br />
                                    <strong>Chefarzt:</strong> {provider.clinic_chefarzt || "N/A"} <br />
                                    <strong>Beste Route:</strong> 
                                    <span style={styles.bold}>
                                        {distances[`${providerType}-${providerName}`] || "Calculating..."} km
                                    </span>
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
// 🎨 CSS Styles
const styles = {
    informationsContainer: {
        width: "35%",
        fontWeight: "600",
        position: "absolute",
        border: "2px solid #b3e5fc",
        right: "10px",
        top: "130px",
        bottom : "650px",
        padding: "15px",
        backgroundColor: "#e1ecf0",
        boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        marginBottom: "15px",
        fontSize: "12px",
    },
    analysticContainer: {
        width: "35%",
        fontWeight: "600",
        border: "2px solid #b3e5fc",
        position: "absolute",
        right: "10px",
        top: "220px",
        padding: "15px",
        backgroundColor: "#e1ecf0",
        boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        fontSize: "12px",
    },
    title: {
        fontSize: "14px",
        marginBottom: "8px"
    },
    list: {
        listStyleType: "none",
        padding: 0,
        margin: 0
    },
    listItem: {
        marginBottom: "8px", // Reduce spacing between each item
        padding: "8px",
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
