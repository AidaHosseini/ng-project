// import React, { useState, useEffect, useMemo } from "react";
// import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import SearchForm from "./SearchForm";
// import L from "leaflet";
// import { useLocation } from "./LocationContext";
// import Button from '@mui/material/Button';




// // 🎯 Predefined colors for clinics, MVZ, ASV
// const lineColors = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];

// // 🟢 Custom icons for different provider types
// const userIcon = L.icon({
//     iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Unique user icon
//     iconSize: [35, 35],
//     iconAnchor: [17, 35]
// });

// // 🏥 Create a circular icon for clinics/MVZ/etc.
// const getColoredClinicIcon = (color) => {
//     return L.divIcon({
//         className: "custom-clinic-marker",
//         html: `<div style="
//             width: 30px; height: 30px; 
//             background-color: ${color}; 
//             border-radius: 50%; 
//             border: 1px solid black;
//             display: flex; justify-content: center; align-items: center;">
//         </div>`,
//         iconSize: [20, 20],
//         iconAnchor: [15, 20]
//     });
// };
// // ✅ AutoZoom adjusts the map bounds to show all valid points
// const AutoZoom = ({ locations }) => {
//     const map = useMap();
    
//     useEffect(() => {
//         // 🛑 Filter out locations with missing latitude/longitude
//         console.log("hii&&&",locations);
//         const validLocations = locations.filter(loc => 
//             (loc.latitude && loc.longitude) ||
//             (loc.clinic_latitude && loc.clinic_longitude) ||
//             (loc.mvz_latitude && loc.mvz_longitude) ||
//             (loc.asv_latitude && loc.asv_longitude) ||  // Fixed: loc.asv.longitude → loc.asv_longitude
//             (loc.niedergelassene_latitude && loc.niedergelassene_longitude) ||
//             (loc.neurologe_latitude && loc.neurologe_longitude) ||
//             (loc.onkologe_latitude && loc.onkologe_longitude)
//         );
        

//         console.log("hii&&&",validLocations.length);
//         if (validLocations.length > 0) {
//             const bounds = L.latLngBounds(validLocations.map(loc => [
//                 loc.latitude || 
//                 loc.clinic_latitude || 
//                 loc.mvz_latitude || 
//                 loc.asv_latitude || 
//                 loc.niedergelassene_latitude || 
//                 loc.neurologe_latitude || 
//                 loc.onkologe_latitude, 

//                 loc.longitude || 
//                 loc.clinic_longitude || 
//                 loc.mvz_longitude || 
//                 loc.asv_longitude || 
//                 loc.niedergelassene_longitude || 
//                 loc.neurologe_longitude || 
//                 loc.onkologe_longitude
//             ]));
//             map.fitBounds(bounds, { padding: [50, 50] }); // Ensure all points are visible
//         } else {
//             console.warn("⚠️ No valid locations found for AutoZoom!");
//         }
//     }, [locations, map]);

//     return null; // No UI component, only logic
// };

// const Map = () => {
//     const [graphData, setGraphData] = useState([]);                 // Holds clinic/MVZ/etc. data
//     const [userLocation, setUserLocation] = useState(null);         // User's position
//     const [locationChoice, setLocationChoice] = useState("");       // Selected location method
//     const [manualAddress, setManualAddress] = useState("");         // For manual input
//     // const [selectedLocation, setSelectedLocation] = useState(null); // 🆕 Selected clicked location
//     // const { setAllLocations } = useLocation();                      // Context function
//     const { setAllLocations, selectedLocation, setSelectedLocation } = useLocation(); // 🆕 Destructure selectedLocation & setSelectedLocation

//     // 🚀 Get user's current location
//     const fetchMyLocation = () => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const lat = position.coords.latitude;
//                     const lon = position.coords.longitude;
    
//                     if (lat && lon) {
//                         setUserLocation({
//                             latitude: lat,
//                             longitude: lon
//                         });
//                         console.log("✅ User location set:", lat, lon);
//                     } else {
//                         console.warn("⚠️ Invalid user location received.");
//                     }
//                 },
//                 (error) => {
//                     console.error("❌ Error getting user location:", error);
//                 }
//             );
//         }
//     };
//     // 📍 Handle click on marker → save clicked location
//     const handleMarkerClick = (location) => {
//         setSelectedLocation(location); // 🆕 Sets the selected location on click
//     };

//     // 🎯 Handle location selection
//     const handleLocationChoice = (choice) => {
//         setLocationChoice(choice);
//         setUserLocation(null);
//         setManualAddress(""); 
//         if (choice === "my-location") {
//             fetchMyLocation();
//         }
//     };

//     // 🎯 Convert address to latitude & longitude using OpenStreetMap's Nominatim API
//     const handleManualAddressSearch = async () => {
//         if (!manualAddress.trim()) {
//             alert("Please enter a valid address.");
//             return;
//         }
//         try {
//             const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`);
//             const data = await response.json();
//             if (data.length > 0 && data[0].lat && data[0].lon) {
//                 setUserLocation({
//                     latitude: parseFloat(data[0].lat),
//                     longitude: parseFloat(data[0].lon)
//                 });
//             } else {
//                 alert("Address not found. Please enter a more precise location.");
//                 console.warn("❌ No valid latitude/longitude found in API response.");
//             }
//         } catch (error) {
//             console.error("Error fetching geolocation:", error);
//             alert("Failed to fetch location. Try again later.");
//         }
//     };
    
//     const allLocations = useMemo(() => {
//         const locations = [...graphData];
    
//         if (userLocation) {
//             locations.push({ clinic_name: "Your Location", provider_type: "User", ...userLocation });
//         } else if (graphData.length > 0 && graphData[0].search_center_lat && graphData[0].search_center_lon) {
//             locations.push({
//                 clinic_name: "Zentrum (Umkreis)",
//                 provider_type: "Radius",
//                 latitude: graphData[0].search_center_lat,
//                 longitude: graphData[0].search_center_lon
//             });
//         }
    
//         return locations;
//     }, [graphData, userLocation]);
    

//     // ✅ Update locations when changed
//     useEffect(() => {
//         setAllLocations(allLocations);
//     }, [allLocations, setAllLocations]);
    
//     return (
         
        
//         <div style={{
//             backgroundColor: "#f0ffff", // Light blue background
//             border: "1px solid #b3e5fc",
//             borderRadius: "10px",
//             padding: "10px",
//             marginBottom: "15px",
//             boxShadow: "0px 2px 10px rgba(0,0,0,0.1)"
//         }}>
//         <h3>Wählen Sie Ihren Standort:</h3>
//         <div style={{ display: "flex", gap: "10px", marginBottom: "10px", paddingLeft: "10px" }}>
//             <Button variant="contained" color="primary" onClick={() => handleLocationChoice("my-location")}>Meinen Standort verwenden</Button>
//             <Button variant="contained" color="primary" onClick={() => handleLocationChoice("manual")}>Standort manuell eingeben</Button>
//         </div>

//             {locationChoice === "manual" && (
//                 <div style={{ paddingLeft: "10px",marginBottom: "10px" }}>
//                     <input 
//                         type="text" 
//                         placeholder="Geben Sie Ihre Adresse ein" 
//                         value={manualAddress} 
//                         onChange={(e) => setManualAddress(e.target.value)}
//                         style={{ padding: "8px", width: "250px", border: "1px solid #ccc", borderRadius: "5px", marginRight: "10px" }} 
//                     />
//                     {/* <button onClick={handleManualAddressSearch}>Search Address</button> */}
                            
//                     {/* ✅ Styled "Search Address" Button */}
//                     <button 
//                         onClick={handleManualAddressSearch} 
//                         style={{
//                             padding: "8px 12px",
//                             borderRadius: "5px",
//                             backgroundColor: "#007BFF", /* Primary blue */
//                             color: "white",
//                             border: "none",
//                             cursor: "pointer",
//                             fontSize: "14px",
//                             fontWeight: "bold",
//                             transition: "background-color 0.3s",
//                             boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)"
//                         }}
//                         onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"} /* Hover effect */
//                         onMouseOut={(e) => e.target.style.backgroundColor = "#007BFF"} 
//                     >
//                         Search Address
//                     </button>
//                 </div>
//             )}

//             <SearchForm setGraphData={setGraphData} />
            
//             <div style={{
//                 width: "59%",
//                 height: "500px",
//                 border: "1px solid #b3e5fc",
//                 borderRadius: "10px",
//                 padding: "10px",
//                 margin: "10px 0", // Ensure no auto-centering
//                 boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
//                 backgroundColor: "white", // White background for contrast
//                 display: "flex", // Ensures content aligns properly
//                 alignItems: "center", // Aligns map within box
//                 justifyContent: "center" // Aligns the map box to the left
//             }}>
//             <MapContainer center={[50.851, 8.015]} zoom={8} scrollWheelZoom={false} style={{ height: "100%", width: "100%", borderRadius: "8px" }}>
//                 <TileLayer
//                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />

//                 {/* AutoZoom Component to adjust map bounds dynamically */}
                
//                 {/* <AutoZoom locations={allLocations} /> */}
//                 {allLocations.length > 0 ? (
                    
//                     <AutoZoom locations={allLocations} />
//                 ) : (
//                     <div style={{ textAlign: "center", fontSize: "18px", color: "red", marginTop: "20px" }}>
//                         ❌ No locations found. Try a different search.
//                     </div>
//                 )}
//                 {/* 🎯 Draw user location marker */}
//                 {userLocation &&  (
//                     <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
//                         <Popup><strong>Your Location</strong></Popup>
//                     </Marker>
//                 )}
                
//                 {/* 🎯 Draw clinic markers */}
//                 {graphData.map((data, index) => {
//                     const color = lineColors[index % lineColors.length]; // Match line & marker color
//                     // Extract valid lat/lng values from multiple possible sources
//                     const latitude = data.clinic_latitude || data.mvz_latitude || data.neurologe_latitude || data.onkologe_latitude;
//                     const longitude = data.clinic_longitude || data.mvz_longitude || data.neurologe_longitude || data.onkologe_longitude;
//                     // 🛑 Skip if latitude or longitude is missing
//                     if (!latitude || !longitude) {
//                         console.warn(`⚠️ Skipping invalid location: ${data.clinic_name || data.mvz_name || data.neurologe_name || data.onkologe_name}`);
//                         return null;
//                     }

//                     return (
//                         // <Marker key={index} position={[latitude, longitude]} icon={getColoredClinicIcon(color)}>
//                         <Marker 
//                             key={index} 
//                             position={[latitude, longitude]} 
//                             icon={getColoredClinicIcon(color)}
//                             eventHandlers={{
//                                 click: () => handleMarkerClick(data)
//                             }} // 🆕 Assign click event handler
//                         >
//                             <Popup>
//                                 <strong>{data.clinic_name || data.mvz_name || data.neurologe_name || data.onkologe_name}</strong><br />
//                                 <strong>City:</strong> {data.clinic_city || data.mvz_city || data.neurologe_city || data.onkologe_city} <br />
//                                 {/* <strong>Address:</strong> {data.clinic_address || data.mvz_address || data.neurologe_address || data.onkologe_address || "N/A"} <br />
//                                 <strong>Beds:</strong> {data.clinic_number_of_beds || "N/A"} */}
//                             </Popup>
//                         </Marker>
//                     );
//                 })}
//                 {/* 🎯 Draw lines between user location & clinics */}
//                 {userLocation && graphData.map((data, index) => {
//         const color = lineColors[index % lineColors.length]; // Match line color

//         // Extract lat/lng for the target location
//         const latitude = data.clinic_latitude || data.mvz_latitude || data.neurologe_latitude || data.onkologe_latitude;
//         const longitude = data.clinic_longitude || data.mvz_longitude || data.neurologe_longitude || data.onkologe_longitude;

//         // 🛑 Skip if lat/lng is missing
//         if (!latitude || !longitude) return null;

//         return (
//             <Polyline 
//                 key={index} 
//                 positions={[
//                     [userLocation.latitude, userLocation.longitude], 
//                     [latitude, longitude]
//                 ]} 
//                 color={color} 
//                 weight={2} 
//             />
//         );
//     })}
//             </MapContainer>
//         </div>
//         </div>
//     );
// };

// export default Map;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import SearchForm from "./SearchForm";
import L from "leaflet";
import { useLocation } from "./LocationContext";
import Button from '@mui/material/Button';

// Constants
const LINE_COLORS = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];
const MAP_CONTAINER_STYLE = {
  width: "59%",
  height: "500px",
  border: "1px solid #b3e5fc",
  borderRadius: "10px",
  padding: "10px",
  margin: "10px 0",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
  backgroundColor: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

// Custom Icons
const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

const getColoredClinicIcon = (color) => L.divIcon({
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

// AutoZoom Component
const AutoZoom = React.memo(({ locations }) => {
  const map = useMap();

  useEffect(() => {
    const validLocations = locations.filter(loc => 
      (loc.latitude && loc.longitude) ||
      (loc.clinic_latitude && loc.clinic_longitude) ||
      (loc.mvz_latitude && loc.mvz_longitude) ||
      (loc.asv_latitude && loc.asv_longitude) ||
      (loc.niedergelassene_latitude && loc.niedergelassene_longitude) ||
      (loc.neurologe_latitude && loc.neurologe_longitude) ||
      (loc.onkologe_latitude && loc.onkologe_longitude)
    );

    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(validLocations.map(loc => [
        loc.latitude || loc.clinic_latitude || loc.mvz_latitude || 
        loc.asv_latitude || loc.niedergelassene_latitude || 
        loc.neurologe_latitude || loc.onkologe_latitude,
        
        loc.longitude || loc.clinic_longitude || loc.mvz_longitude || 
        loc.asv_longitude || loc.niedergelassene_longitude || 
        loc.neurologe_longitude || loc.onkologe_longitude
      ]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
});

const Map = () => {
  const [graphData, setGraphData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationChoice, setLocationChoice] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const { setAllLocations, selectedLocation, setSelectedLocation } = useLocation();

  // Memoized fetch location function
  const fetchMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          if (lat && lon) {
            setUserLocation({ latitude: lat, longitude: lon });
          }
        },
        (error) => console.error("Error getting user location:", error)
      );
    }
  }, []);

  const handleMarkerClick = useCallback((location) => {
    setSelectedLocation(location);
  }, [setSelectedLocation]);

  const handleLocationChoice = useCallback((choice) => {
    setLocationChoice(choice);
    setUserLocation(null);
    setManualAddress("");
    if (choice === "my-location") {
      fetchMyLocation();
    }
  }, [fetchMyLocation]);

  const handleManualAddressSearch = useCallback(async () => {
    if (!manualAddress.trim()) {
      alert("Please enter a valid address.");
      return;
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`
      );
      const data = await response.json();
      
      if (data.length > 0 && data[0].lat && data[0].lon) {
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
  }, [manualAddress]);

  const allLocations = useMemo(() => {
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

  useEffect(() => {
    setAllLocations(allLocations);
  }, [allLocations, setAllLocations]);

  const renderMarkers = useMemo(() => {
    return graphData.map((data, index) => {
      const color = LINE_COLORS[index % LINE_COLORS.length];
      const latitude = data.clinic_latitude || data.mvz_latitude || data.neurologe_latitude || data.onkologe_latitude;
      const longitude = data.clinic_longitude || data.mvz_longitude || data.neurologe_longitude || data.onkologe_longitude;

      if (!latitude || !longitude) return null;

      return (
        <Marker 
          key={`marker-${index}`} 
          position={[latitude, longitude]} 
          icon={getColoredClinicIcon(color)}
          eventHandlers={{ click: () => handleMarkerClick(data) }}
        >
          <Popup>
            <strong>{data.clinic_name || data.mvz_name || data.neurologe_name || data.onkologe_name}</strong><br />
            <strong>City:</strong> {data.clinic_city || data.mvz_city || data.neurologe_city || data.onkologe_city}
          </Popup>
        </Marker>
      );
    });
  }, [graphData, handleMarkerClick]);

  const renderPolylines = useMemo(() => {
    if (!userLocation) return null;

    return graphData.map((data, index) => {
      const color = LINE_COLORS[index % LINE_COLORS.length];
      const latitude = data.clinic_latitude || data.mvz_latitude || data.neurologe_latitude || data.onkologe_latitude;
      const longitude = data.clinic_longitude || data.mvz_longitude || data.neurologe_longitude || data.onkologe_longitude;

      if (!latitude || !longitude) return null;

      return (
        <Polyline 
          key={`polyline-${index}`}
          positions={[
            [userLocation.latitude, userLocation.longitude], 
            [latitude, longitude]
          ]} 
          color={color} 
          weight={2} 
        />
      );
    });
  }, [graphData, userLocation]);

  return (
    <div style={{
      backgroundColor: "#f0ffff",
      border: "1px solid #b3e5fc",
      borderRadius: "10px",
      padding: "10px",
      marginBottom: "15px",
      boxShadow: "0px 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h3>Wählen Sie Ihren Standort:</h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", paddingLeft: "10px" }}>
        <Button variant="contained" color="primary" onClick={() => handleLocationChoice("my-location")}>
          Meinen Standort verwenden
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleLocationChoice("manual")}>
          Standort manuell eingeben
        </Button>
      </div>

      {locationChoice === "manual" && (
        <div style={{ paddingLeft: "10px", marginBottom: "10px" }}>
          <input 
            type="text" 
            placeholder="Geben Sie Ihre Adresse ein" 
            value={manualAddress} 
            onChange={(e) => setManualAddress(e.target.value)}
            style={{ 
              padding: "8px", 
              width: "250px", 
              border: "1px solid #ccc", 
              borderRadius: "5px", 
              marginRight: "10px" 
            }} 
          />
          <button 
            onClick={handleManualAddressSearch}
            style={{
              padding: "8px 12px",
              borderRadius: "5px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              transition: "background-color 0.3s",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#007BFF"} 
          >
            Search Address
          </button>
        </div>
      )}

      <SearchForm setGraphData={setGraphData} />
      
      <div style={MAP_CONTAINER_STYLE}>
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

          {allLocations.length > 0 ? (
            <AutoZoom locations={allLocations} />
          ) : (
            <div style={{ textAlign: "center", fontSize: "18px", color: "red", marginTop: "20px" }}>
              ❌ No locations found. Try a different search.
            </div>
          )}

          {userLocation && (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup><strong>Your Location</strong></Popup>
            </Marker>
          )}
          
          {renderMarkers}
          {renderPolylines}
        </MapContainer>
      </div>
    </div>
  );
};

export default React.memo(Map);