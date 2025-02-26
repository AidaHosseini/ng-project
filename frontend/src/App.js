import React from "react";
import { LocationProvider } from "./components/LocationContext";
import Analystics from "./components/Analystics";
import Map from "./components/map"; 

function App() {
  return (
    <div>
      <h1>Welcome!</h1>
      {/* <GraphView /> */}
         
      <LocationProvider>
            <Map />
            <Analystics />
        </LocationProvider>
    </div>
  );
}

export default App;
