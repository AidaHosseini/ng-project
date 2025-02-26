import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import SearchForm from "./SearchForm";
import L from "leaflet";
import { useLocation } from "./LocationContext";


// Custom icon for user location
const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});



// Predefined colors for lines (cycling through these)
const lineColors = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];

// Auto-zoom component
const AutoZoom = ({ locations }) => {
    const map = useMap(); // Access the map instance

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] }); // Adjust padding for better view
        }
    }, [locations, map]);

    return null; // This component only handles map logic
};
const Map = () => {

    const [latitude, setlatitude] = useState(0);
    const [longitude, setlongitude] = useState(0);
    const [graphData, setGraphData] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [locationChoice, setLocationChoice] = useState(""); // "my-location" or "manual"
    const [manualAddress, setManualAddress] = useState(""); // User's address input
    const { setAllLocations } = useLocation();


    console.log(graphData[0]);
    // setlatitude(graphData[0].latitude);
    // setlongitude(graphData[0].longitude);
    useEffect(() => {
        if (graphData.length > 0) {
            graphData.forEach((data, index) => {
                console.log(`Position ${index + 1}: Latitude ${data.latitude}, Longitude ${data.longitude}`);
                setlatitude(data.latitude);
                setlongitude(data.longitude);
            });
            
        }
    }, [graphData]);  // Runs when graphData updates
    
    const position = [latitude, longitude];
    console.log(position);

   // Get user's current location
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


// Handle location selection
const handleLocationChoice = (choice) => {
    setLocationChoice(choice);
    setUserLocation(null);
    setManualAddress(""); // Reset manual input
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


  // ✅ UseMemo prevents re-creating allLocations on every render
  const allLocations = useMemo(() => {
    const locations = [...graphData];
    if (userLocation) {
        locations.push({ clinic_name: "Your Location", ...userLocation });
    }
    return locations;
}, [graphData, userLocation]); // Recalculates only when these change

// ✅ useEffect only updates when allLocations changes
useEffect(() => {
    setAllLocations(allLocations);
}, [allLocations, setAllLocations]);

  return (
    <div>
      <h1>New Ways of Care Provision and Analysis of Patient Flows</h1>
       {/* Location Selection */}
       <div>
                <h3>Select Your Location:</h3>
                <button onClick={() => handleLocationChoice("my-location")}>Use My Location</button>
                <button onClick={() => handleLocationChoice("manual")}>Enter Location Manually</button>
            </div>

            {/* Manual Address Input */}
            {locationChoice === "manual" && (
                <div>
                    <input 
                        type="text" 
                        placeholder="Enter your address" 
                        value={manualAddress} 
                        onChange={(e) => setManualAddress(e.target.value)}
                    />
                    <button onClick={handleManualAddressSearch}>Search Address</button>
                </div>
            )}


      <SearchForm setGraphData={setGraphData} />

      <MapContainer center={[50.851, 8.015]} zoom={8} scrollWheelZoom={false} style={{height: 500, width: "60%"}}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {/* Auto-Zoom Feature */}
    <AutoZoom locations={allLocations} />
    {/* <Marker position={position} >
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker> */}
    {graphData.map((data, index) => (
                <Marker key={index} position={[data.latitude, data.longitude]}>
                    <Popup>
                        <strong>{data.clinic_name}</strong><br />
                        City: {data.city} <br />
                        Lat: {data.latitude}, Lng: {data.longitude}
                    </Popup>
                </Marker>

            ))}

            {/* Show User's Current Location */}
            {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                        <Popup>
                            <strong>Your Location</strong><br />
                            Lat: {userLocation.latitude}, Lng: {userLocation.longitude}
                        </Popup>
                    </Marker>
                )}

                  {/* Draw lines from user to each clinic with different colors */}
                {userLocation && graphData.map((data, index) => (
                    <Polyline 
                        key={index} 
                        positions={[[userLocation.latitude, userLocation.longitude], [data.latitude, data.longitude]]} 
                        color={lineColors[index % lineColors.length]} // Cycle through colors
                        weight={3} // Line thickness
                    />
                ))}

                
  </MapContainer>,
    </div>
  );
};

export default Map;
