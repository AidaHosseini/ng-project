import React, { useState, useEffect } from "react";
import { useLocation } from "./LocationContext";

// Function to get road distance from OSRM API
const getRoadDistance = async (startLat, startLon, endLat, endLon) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=false`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            return (data.routes[0].distance / 1000).toFixed(2); // Convert meters to km
        } else {
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
    
    // Extract Unique ICD Name & Fallzahl (Only Once)
    const uniqueICDInfo = allLocations.length > 0
        ? { 
            icd_name: allLocations[0].icd_name || "N/A",
            icd_fallzahl: allLocations[0].icd_fallzahl || "N/A"
        } : null;

    // Find the user's location (if available)
    const userLocation = allLocations.find(loc => loc.clinic_name === "Your Location");

    // Fetch road distances between the user's location and all clinics
    useEffect(() => {
        const fetchDistances = async () => {
            if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
                console.warn("⚠️ No valid user location found!");
                return;
            }

            const newDistances = {};
            for (const clinic of allLocations) {
                if (clinic.clinic_name === "Your Location") continue; // Skip user location

                const roadDistance = await getRoadDistance(
                    userLocation.latitude, userLocation.longitude, // User's location
                    clinic.latitude, clinic.longitude // Clinic's location
                );

                newDistances[clinic.clinic_name] = roadDistance;
            }

            setDistances(newDistances);
        };

        fetchDistances();
    }, [userLocation, allLocations]);

    return (
        <>
            {/* Informations Box - ICD Name & ICD Fallzahl (Displayed Once) */}
            {uniqueICDInfo && (
                <div style={styles.informationsContainer}>
                    <h3 style={styles.title}>Informationen zur Krankheit</h3>
                    <p><strong>ICD Name:</strong> {uniqueICDInfo.icd_name}</p>
                    
                </div>
            )}

            {/* Leistungserbringer Informations */}
            <div style={styles.analysticContainer}>
                <h3 style={styles.title}>Leistungserbringer Informationen</h3>
                {allLocations.length > 0 ? (
                    <ul style={styles.list}>
                        {allLocations.map((clinic, index) => {
                            if (clinic.clinic_name === "Your Location") return null; // Skip user location

                            return (
                                <li key={index} style={styles.listItem}>
                                    {/* Circle icon before clinic name */}
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
                                    <strong>{clinic.clinic_name}</strong> <br />
                                    <strong>Stadt:</strong> {clinic.city || "N/A"} <br />
                                    <strong>Chefarzt:</strong> {clinic.chefarzt || "N/A"} <br />
                                    <strong>Addresse:</strong> {clinic.address || "N/A"} <br />
                                    <strong>Anzahl von Betten:</strong> {clinic.number_of_beds || "N/A"} <br />
                                    <strong>Entfernung:</strong> <span style={styles.bold}>{distances[clinic.clinic_name] || "Calculating..."} km</span>
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
        right: "10px",
        top: "50px",
        padding: "15px",
        backgroundColor: "#e3f2fd",
        boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        marginBottom: "15px",
        fontSize: "12px",
    },
    analysticContainer: {
        width: "35%",
        fontWeight: "600",
        position: "absolute",
        right: "10px",
        top: "200px",
        padding: "15px",
        backgroundColor: "#f9f9f9",
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

// Colors for circles (same as lines)
const lineColors = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];

export default Analystics;
