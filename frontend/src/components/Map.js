import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SearchForm from "./SearchForm.js";
import L from "leaflet";
import { useLocation } from "./LocationContext";
import Button from '@mui/material/Button';
import diseaseImg from '../Images/diseaseImg.png';

import TextLine from "./TextLine";
import { providerColors } from "../components/Constants.js";


// ✅ Custom icon for disease center
const diseaseIcon = L.divIcon({
  className: "custom-disease-icon",
  html: `<div style="
    width: 30px;
    height: 30px;
    background-image: url('${diseaseImg}');
    background-size: cover;
    border-radius: 50%;
    border: 2px solid red;
    box-shadow: 0 0 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [30, 30],
  iconAnchor: [17, 25],
  popupAnchor: [0, -30]
});


// ✅ Define colors for each provider type
const LegendItem = ({ color, label, dashed = false }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "2px" }}>
    <div style={{
      width: "12px",
      height: "12px",
      backgroundColor: color,
      marginRight: "8px",
      fontSize: "8px",
      borderRadius: "50%",
      border: "1px solid #555",
      borderStyle: dashed ? "dashed" : "solid"
    }} />
    <span>{label}</span>
  </div>
);


// 🟢 Custom icons for different provider types
const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Unique user icon
    iconSize: [35, 35],
    iconAnchor: [35, 35]
});


// 🏥 Create a circular icon for clinics/MVZ/etc.
const getColoredClinicIcon = (color) => {
    return L.divIcon({
        className: "custom-clinic-marker",
        html: `<div style="
            width: 15px; height: 15px; 
            background-color: ${color}; 
            border-radius: 50%; 
            border: 1px solid black;
            display: flex; justify-content: center; align-items: center;">
        </div>`,
        iconSize: [10, 10],
        iconAnchor: [15, 15]
    });
};


// ✅ AutoZoom adjusts the map bounds to show all valid points
const AutoZoom = ({ locations }) => {
    const map = useMap();
    
    useEffect(() => {
        // 🛑 Filter out locations with missing latitude/longitude
        const validLocations = locations.filter(loc => 
            
            (loc.latitude && loc.longitude) ||
            (loc.lat && loc.lon)
            
        );
        if (validLocations.length > 0) {
            const bounds = L.latLngBounds(validLocations.map(loc => [
                loc.latitude || loc.lat,
               
               

                loc.longitude || loc.lon 
               
            ]));
            map.fitBounds(bounds, { padding: [50, 50] }); // Ensure all points are visible
        } else {
            console.warn("⚠️ No valid locations found for AutoZoom!");
        }
    }, [locations, map]);

    return null; // No UI component, only logic
};

const Map = () => {
    const [graphData, setGraphData] = useState([]);                 // Holds clinic/MVZ/etc. data
    const [CooperationData, setCooperationData] = useState([]);
    const [userLocation, setUserLocation] = useState(null);         // User's position
    const [locationChoice, setLocationChoice] = useState("");       // Selected location method
    const [manualAddress, setManualAddress] = useState("");         // For manual input
    const [radius, setRadius] = useState([]);
    const [city, setCity] = useState([]); // City for search
    const [searchCenter, setSearchCenter] = useState([50.851, 8.015]); //
    const { setAllLocations, selectedLocation, setSelectedLocation, setCooperations } = useLocation(); // 🆕 Destructure selectedLocation & setSelectedLocation


      //  Initialize graphData and cooperationData from context
    useEffect(() => {
        setCooperations(CooperationData);
    }, [CooperationData, setCooperations]);
    
    //  Get user's current location
    const fetchMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
    
                    if (lat && lon) {
                        setUserLocation({
                            latitude: lat,
                            longitude: lon
                        });
                        console.log("✅ User location set:", lat, lon);
                    } else {
                        console.warn("⚠️ Invalid user location received.");
                    }
                },
                (error) => {
                    console.error("❌ Error getting user location:", error);
                }
            );
        }
    };
    // 📍 Handle click on marker → save clicked location
    const handleMarkerClick = (location) => {
        setSelectedLocation(location); // 🆕 Sets the selected location on click
    };

    // Handle location selection
    const handleLocationChoice = (choice) => {
        setLocationChoice(choice);
        setUserLocation(null);
        setManualAddress(""); 
        if (choice === "my-location") {
            fetchMyLocation();
        }
    };

    // Convert address to latitude & longitude using OpenStreetMap's Nominatim API
    const handleManualAddressSearch = async () => {
        if (!manualAddress.trim()) {
            alert("Please enter a valid address.");
            return;
        }
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`);
            const data = await response.json();
            if (data.length > 0 && data[0].lat && data[0].lon) {
                setUserLocation({
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                });
            } else {
                alert("Address not found. Please enter a more precise location.");
                console.warn("❌ No valid latitude/longitude found in API response.");
            }
        } catch (error) {
            console.error("Error fetching geolocation:", error);
            alert("Failed to fetch location. Try again later.");
        }
    };
    // فقط Providerها و مرکز جستجو برای AutoZoom
    const zoomLocations = useMemo(() => {
    const locations = [...graphData];

    if (userLocation) {
        locations.push({ clinic_name: "Your Location", provider_type: "User", ...userLocation });
    } else if (graphData.length > 0 && graphData[0].search_center_lat && graphData[0].search_center_lon) {
        locations.push({
        clinic_name: "Zentrum (Umkreis)",
        provider_type: "Radius",
        latitude: graphData[0].search_center_lat,
        longitude: graphData[0].search_center_lon
        });
    }

  return locations;
}, [graphData, userLocation]);

    // 🗺️ Combine all locations for display
    const allLocations = useMemo(() => {
        const locations = [...graphData];

        // addind cooperation data
        if (Array.isArray(CooperationData)) {
            CooperationData.forEach((coop) => {
            locations.push({
                name: coop.target_name,
                address: coop.target_address,
                city: coop.target_city,
                lat: coop.target_lat,
                lon: coop.target_lon,
                type: coop.target_type || "Kooperation"
            });
            });
        }

        // Add user location if available
        if (userLocation) {
            locations.push({ clinic_name: "Your Location", provider_type: "User", ...userLocation });
        } else if (graphData.length > 0 && graphData[0].search_center_lat && graphData[0].search_center_lon) {
            locations.push({
            clinic_name: "Zentrum (Umkreis)",
            provider_type: "Radius",
            latitude: graphData[0].search_center_lat,
            longitude: graphData[0].search_center_lon
            });
        }

        return locations;
        }, [graphData, CooperationData, userLocation]);


    //  Update locations when changed
    useEffect(() => {
        setAllLocations(allLocations);
    }, [allLocations, setAllLocations]);
    
  
    return (
    <div style={{ backgroundColor: "#f0ffff", border: "1px solid #b3e5fc", borderRadius: "10px", padding: "10px", marginBottom: "15px", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
      <h3>Wählen Sie Ihren Standort:</h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", paddingLeft: "10px" }}>
        <Button variant="contained" color="primary" onClick={() => handleLocationChoice("my-location")}>Meinen Standort verwenden</Button>
        <Button variant="contained" color="primary" onClick={() => handleLocationChoice("manual")}>Standort manuell eingeben</Button>
      </div>

      {locationChoice === "manual" && (
        <div style={{ paddingLeft: "10px", marginBottom: "10px" }}>
          <input type="text" placeholder="Adresse eingeben" value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} style={{ padding: "8px", width: "250px", border: "1px solid #ccc", borderRadius: "5px", marginRight: "10px" }} />
          <button onClick={handleManualAddressSearch} style={{ padding: "8px 12px", borderRadius: "5px", backgroundColor: "#007BFF", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold", transition: "background-color 0.3s", boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)" }}>
            Adresse suchen
          </button>
        </div>
      )}

      <SearchForm setGraphData={setGraphData} setCooperationData={setCooperationData} setInputRadius={setRadius} setInputCity={setCity} setSearchCenter={setSearchCenter}/>

      

      <div style={{ width: "59%", height: "500px", border: "1px solid #b3e5fc", borderRadius: "10px", padding: "10px", margin: "10px 0", boxShadow: "0px 4px 10px rgba(0,0,0,0.15)", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        
        
          <MapContainer
    center={[50.851, 8.015]}
    zoom={8}
    scrollWheelZoom={false}
    style={{ height: "100%", width: "100%", borderRadius: "8px" }}
  >
    <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  {/* searching center */}
  {searchCenter && (
    <Marker position={searchCenter} icon={diseaseIcon}>
      <Popup>
        <strong>Suchzentrum von {}</strong><br />
        Behandlungsfokus
      </Popup>
    </Marker>
  )}

  {/* searching radius */}
  <Circle
    center={searchCenter}
    radius={radius * 1000}
    color="red"
    fillColor="red"
    fillOpacity={0.1}
  >
    <Popup>Suchradius: {radius} km</Popup>
  </Circle>

  {/* user location */}
  {userLocation && (
    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
      <Popup><strong>Your Location</strong></Popup>
    </Marker>
  )}

  {/*graph data */}
  {graphData.map((data, index) => {
    const color = providerColors[data.type] || "gray";
    const lat = data.lat || data.latitude;
    const lon = data.lon || data.longitude;
    if (!lat || !lon) return null;

    return (
      <Marker
        key={index}
        position={[lat, lon]}
        icon={getColoredClinicIcon(color)}
        eventHandlers={{ click: () => setSelectedLocation(data) }}
      >
        <Popup>
          <strong>{data.name}</strong><br />
          <strong>City:</strong> {data.city || "N/A"}<br />
        </Popup>
      </Marker>
    );
  })}

  {  /* Cooperation data markers */}
  {CooperationData.map((data, index) => {
    const lat = data.target_lat;
    const lon = data.target_lon;
    if (!lat || !lon) return null;

    return (
      <Marker
        key={index}
        position={[lat, lon]}
        icon={getColoredClinicIcon("white")}
        eventHandlers={{ click: () => setSelectedLocation(data) }}
      >
        <Popup>
          <strong>{data.target_name || "N/A"}</strong><br />
          <strong>City:</strong> {data.target_city || "N/A"}<br />
        </Popup>
      </Marker>
    );
  })}

    {/* Lines between providers and search center */}
  {searchCenter && graphData.length > 0 &&
    graphData.map((provider, index) => {
        const pLat = provider.lat || provider.latitude;
        const pLon = provider.lon || provider.longitude;

        if (!pLat || !pLon) return null;

        // Check if the provider is a target in CooperationData
        const isTarget = CooperationData.some(
        coop => coop.target_lat === pLat && coop.target_lon === pLon
        );
        if (isTarget) return null;

        return (
        <TextLine
            key={`city-to-provider-${index}`}
            from={searchCenter}
            to={[pLat, pLon]}
            text="wird_behandelt_in"
            color="black"
            fontSize="10px"
            dashArray="4" 
            opacity={0.4}
            showText={false}
        />
        );
    })
    }

    

    {Array.isArray(CooperationData) && CooperationData.length > 0 &&
    CooperationData.map((partner, index) => {
        const sLat = partner.source_lat;
        const sLon = partner.source_lon;
        const tLat = partner.target_lat;
        const tLon = partner.target_lon;

        if (!sLat || !sLon || !tLat || !tLon) return null;

        return (
        <TextLine
            key={`coop-line-${index}`}
            from={[sLat, sLon]}
            to={[tLat, tLon]}
            text="kooperiert_mit"
            color="blue"
            fontSize="11px"
            weight={2}
            opacity={0.6}
        />
        );
    })
    }

    



  <AutoZoom locations={zoomLocations} />
</MapContainer>
       {/* Overlay parameter der Legende */}
      <div style={{
        position: "absolute",
        bottom: "-150px",
        left: "32px",
        backgroundColor: "white",
        padding: "10px 10px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        fontSize: "14px",
        border: "2px dashed lightblue",
        zIndex: 1000
      }}>
        {/* Farben Bestimmung der Legende*/}
        <strong>Legende</strong>
         <div style={{ display: "flex", flexDirection: "column", marginTop: "5px", fontSize: "10px" }}>
            <LegendItem color="green" label="Klinik" />
            <LegendItem color="blue" label="MVZ" />
            <LegendItem color="orange" label="ASV" />
            <LegendItem color="red" label="Niedergelassene Ärzte/Onko" />
            <LegendItem color="purple" label="Niedergelassene Ärzte/Neuro" />
            <LegendItem color="white" label="Kooperation" />
            
         </div>
        </div> 
      </div>
    </div>
  );
};

export default Map;
