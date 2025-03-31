import React, { createContext, useContext, useState } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [allLocations, setAllLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null); // ✅ Add this

    return (
        <LocationContext.Provider value={{ 
            allLocations, 
            setAllLocations, 
            selectedLocation, 
            setSelectedLocation,
            userLocation,
            setUserLocation // ✅ Include setter as well
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    return useContext(LocationContext);
};

