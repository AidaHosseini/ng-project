import React from "react";
import { LocationProvider } from "./components/LocationContext";
import Analytics from "./components/Analytics";
import Map from "./components/Map"; 

function App() {
  return (
    <div>
      <div style={{
        display: "flex", 
        alignItems: "center",
        justifyContent: "space-between", 
        backgroundColor: "#ffffff",
        border: "2px solid #b3e5fc",
        borderRadius: "10px",
        padding: "15px",
        textAlign: "center",
        boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
        margin: "15px auto",  // Center horizontally while reducing space
        width: "97%",  // Make it take up more width
        maxWidth: "1450px"  // Limit maximum width for responsiveness
      }}>
        
        {/* Left Logo */}
        <img src="/Images/UNIS-f5.jpg" alt="UNIS-f5" style={{ height: "50px", width: "75px" }} />



      {/* Title */}
      <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0", flexGrow: 1, textAlign: "center" }}>
          Herzlich Willkommen zu neuen Wegen der Versorgung durch Analyse von Patientenströmen!
      </h1>

      {/* Right Logo */}
      <img src="/Images/UNIS.jpg" alt="UNIS" style={{ height: "50px", width: "75px" }} />

  </div>

      <LocationProvider>
        <Map />
        <Analytics />
      </LocationProvider>
    </div>
  );
}


export default App;