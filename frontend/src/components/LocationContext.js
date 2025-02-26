import React, { createContext, useContext, useState } from "react";

// Create context
const LocationContext = createContext();

// Provider component
export const LocationProvider = ({ children }) => {
    const [allLocations, setAllLocations] = useState([]);

    return (
        <LocationContext.Provider value={{ allLocations, setAllLocations }}>
            {children}
        </LocationContext.Provider>
    );
};

// Custom hook to use context
export const useLocation = () => {
    return useContext(LocationContext);
};

