import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import SearchForm from "./SearchForm";
import L from "leaflet";
import { useLocation } from "./LocationContext";

// 🎯 Predefined colors for clinics, MVZ, ASV
const lineColors = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];

// 🟢 Custom icons for different provider types
const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Unique user icon
    iconSize: [35, 35],
    iconAnchor: [17, 35]
});

// 🎯 Function to create color-matched clinic icons
const getColoredClinicIcon = (color) => {
    return L.divIcon({
        className: "custom-clinic-marker",
        html: `<div style="
            width: 30px; height: 30px; 
            background-color: ${color}; 
            border-radius: 50%; 
            border: 1px solid black;
            display: flex; justify-content: center; align-items: center;">
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [15, 20]
    });
};

// ✅ AutoZoom component to adjust map bounds dynamically
const AutoZoom = ({ locations }) => {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] }); // Ensure all points are visible
        }
    }, [locations, map]);

    return null; // No UI component, only logic
};

const Map = () => {
    const [graphData, setGraphData] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [locationChoice, setLocationChoice] = useState(""); 
    const [manualAddress, setManualAddress] = useState(""); 
    const { setAllLocations } = useLocation();

    // 🚀 Get user's current location
    const fetchMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    };

    // 🎯 Handle location selection
    const handleLocationChoice = (choice) => {
        setLocationChoice(choice);
        setUserLocation(null);
        setManualAddress(""); 
        if (choice === "my-location") {
            fetchMyLocation();
        }
    };

    // 🎯 Convert address to latitude & longitude using OpenStreetMap's Nominatim API
    const handleManualAddressSearch = async () => {
        if (!manualAddress.trim()) {
            alert("Please enter a valid address.");
            return;
        }
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`);
            const data = await response.json();
            if (data.length > 0) {
                setUserLocation({
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                });
            } else {
                alert("Address not found. Please enter a more precise location.");
            }
        } catch (error) {
            console.error("Error fetching geolocation:", error);
            alert("Failed to fetch location. Try again later.");
        }
    };

    // ✅ UseMemo to prevent unnecessary re-renders
    const allLocations = useMemo(() => {
        const locations = [...graphData];
        if (userLocation) {
            locations.push({ clinic_name: "Your Location", provider_type: "User", ...userLocation });
        }
        return locations;
    }, [graphData, userLocation]);

    // ✅ Update locations when changed
    useEffect(() => {
        setAllLocations(allLocations);
    }, [allLocations, setAllLocations]);

    return (
        <div>
            <h1>Neue Wege der Versorgung der Patientenströme</h1>
            <div>
                <h3>Wählen Sie Ihren Standort:</h3>
                <button onClick={() => handleLocationChoice("my-location")}>Meinen Standort verwenden</button>
                <button onClick={() => handleLocationChoice("manual")}>Standort manuell eingeben</button>
            </div>

            {locationChoice === "manual" && (
                <div>
                    <input 
                        type="text" 
                        placeholder="Geben Sie Ihre Adresse ein" 
                        value={manualAddress} 
                        onChange={(e) => setManualAddress(e.target.value)}
                    />
                    <button onClick={handleManualAddressSearch}>Search Address</button>
                </div>
            )}

            <SearchForm setGraphData={setGraphData} />

            <MapContainer center={[50.851, 8.015]} zoom={8} scrollWheelZoom={false} style={{ height: 500, width: "60%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* AutoZoom Component to adjust map bounds dynamically */}
                
                <AutoZoom locations={allLocations} />
                {allLocations.length > 0 ? (
                    <AutoZoom locations={allLocations} />
                ) : (
                    <div style={{ textAlign: "center", fontSize: "18px", color: "red", marginTop: "20px" }}>
                        ❌ No locations found. Try a different search.
                    </div>
                )}
                {/* 🎯 Draw user location marker */}
                {userLocation &&  (
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                        <Popup><strong>Your Location</strong></Popup>
                    </Marker>
                )}

                {/* 🎯 Draw clinic markers with color-matched icons */}
                {graphData.map((data, index) => {
                    const color = lineColors[index % lineColors.length]; // Match line & marker color
                    return (
                        <Marker key={index} position={[data.latitude, data.longitude]} icon={getColoredClinicIcon(color)}>
                            <Popup>
                                <strong>{data.clinic_name}</strong><br />
                                City: {data.city} <br />
                                Beds: {data.number_of_beds} <br />
                                Address: {data.address || "N/A"}
                            </Popup>
                        </Marker>
                    );
                })}

                {/* 🎯 Draw lines from user location to each clinic */}
                {userLocation && graphData.map((data, index) => {
                    const color = lineColors[index % lineColors.length]; // Match line color
                    return (
                        <Polyline 
                            key={index} 
                            positions={[
                                [userLocation.latitude, userLocation.longitude], 
                                [data.latitude, data.longitude]
                            ]} 
                            color={color} 
                            weight={2} 
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default Map;
