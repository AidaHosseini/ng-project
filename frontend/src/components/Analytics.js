import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "./LocationContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LINE_COLORS = ["red", "blue", "green", "purple", "orange", "pink", "yellow"];

const styles = {
  scrollWrapper: {
    width: "35%",
    position: "absolute",
    right: "10px",
    top: "130px",
    bottom: "5px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
    fontSize: "12px",
    fontWeight: "600",
    boxSizing: "border-box"
  },
  scrollSection: (percentage) => ({
    height: `${percentage}%`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  }),
  scrollSectionContent: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: "#F0F1F1",
    border: "2px solid #b3e5fc",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  title: {
    fontSize: "16px",
    marginBottom: "4px",
    fontWeight: "600",
    padding: "2px 6px",
    borderRadius: "2px"
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0
  },
  listItem: {
    marginBottom: "8px",
    padding: "8px",
    borderBottom: "1px solid #ddd"
  },
  bold: { fontWeight: "600" },
  noData: {
    fontStyle: "italic",
    color: "#999"
  },
  colorDot: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginRight: "5px"
  },
  calculatingText: {
    color: "#666",
    fontStyle: "italic"
  }
};

const getRoadDistance = async (startLat, startLon, endLat, endLon) => {
  if (!startLat || !startLon || !endLat || !endLon) {
    console.warn("Missing coordinates for distance calculation!", { startLat, startLon, endLat, endLon });
    return "N/A";
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return (data.routes[0].distance / 1000).toFixed(2);
    } else {
      console.warn("No valid route found for coordinates:", { startLat, startLon, endLat, endLon });
      return "N/A";
    }
  } catch (error) {
    console.error("Error fetching road distance:", error);
    return "N/A";
  }
};

const Analytics = () => {
  const { allLocations, selectedLocation } = useLocation();
  const [distances, setDistances] = useState({});

  // Extract Unique ICD Information
  // const uniqueICDInfo = useMemo(() => {
  //   return allLocations.length > 0
  //     ? { 
  //         icd_name: allLocations[0].icd_name || "N/A",
  //         icd_fallzahl: allLocations[0].icd_fallzahl || "N/A"
  //       } 
  //     : null;
  // }, [allLocations]);
  const { icd } = useLocation();
  const uniqueICDInfo = icd || null;


  // Find User's Location
  const userLocation = useMemo(() => 
    allLocations.find(loc => loc.clinic_name === "Your Location"), 
    [allLocations]
  );

  // Get provider details helper function
  const getProviderDetails = (provider, focus) => {
    const type = provider.clinic_name ? "clinic" :
      provider.mvz_name ? "mvz" :
      provider.asv_name ? "asv" :
      provider.niedergelassene_name ? "niedergelassene" :
      provider.neurologe_name ? "neurologe" :
      provider.onkologe_name ? "onkologe" : null;

    const name = provider.clinic_name || provider.mvz_name || provider.asv_name || provider.niedergelassene_name || provider.neurologe_name || provider.onkologe_name;
    const address = provider.clinic_address || provider.mvz_address || provider.asv_address || provider.niedergelassene_address || provider.neurologe_address || provider.onkologe_address;
    const city = provider.clinic_city || provider.mvz_city || provider.asv_city || provider.niedergelassene_city || provider.neurologe_city || provider.onkologe_city;

    const lat = provider.clinic_latitude || provider.mvz_latitude || provider.asv_latitude || provider.niedergelassene_latitude || provider.neurologe_latitude || provider.onkologe_latitude;
    const lon = provider.clinic_longitude || provider.mvz_longitude || provider.asv_longitude || provider.niedergelassene_longitude || provider.neurologe_longitude || provider.onkologe_longitude;

    return { type, name, address, city, lat, lon };
  };

  // Generate unique key for each provider
  const getProviderKey = (type, name, address) => `${type}-${(name || '').trim()}-${(address || '').trim()}`;

  // Filter out user location
  const filteredLocations = useMemo(() => 
    allLocations.filter(loc => loc.clinic_name !== "Your Location"), 
    [allLocations]
  );

  // Fetch distances for all providers
  useEffect(() => {
    const fetchDistances = async () => {
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        console.warn("No valid user location found!");
        return;
      }

      const newDistances = {};

      for (const provider of filteredLocations) {
        const { type, name, address, lat, lon } = getProviderDetails(provider);
        
        if (!type || !name || !lat || !lon) {
          console.warn(`Skipping provider with missing data: ${name}`);
          continue;
        }

        const roadDistance = await getRoadDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          lat, 
          lon
        );

        const providerKey = getProviderKey(type, name, address);
        newDistances[providerKey] = roadDistance;
      }

      setDistances(newDistances);
    };

    fetchDistances();
  }, [userLocation, filteredLocations]);

  // Render selected location info
  const renderSelectedLocationInfo = () => {
    if (!selectedLocation) return <p style={styles.noData}>Keine Einrichtung ausgewählt.</p>;
    
    const { type, name, address, city } = getProviderDetails(selectedLocation);
    const key = getProviderKey(type, name, address);
    
    return (
      <>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Adresse:</strong> {address}</p>
        <p><strong>Stadt:</strong> {city}</p>
        <p><strong>Beste Route:</strong> {distances[key] ? `${distances[key]} km` : "Berechne..."}</p>
      </>
    );
  };

  // Render ICD info
  const renderICDInfo = () => (
    uniqueICDInfo ? (
      <>
        <p><strong>Kooperation mit:</strong> {uniqueICDInfo.icd_name}</p>
        <p><strong>Fallzahl:</strong> {uniqueICDInfo.icd_fallzahl}</p>
      </>
    ) : <p style={styles.noData}>Keine Kooperationsinformationen verfügbar.</p>
  );

  // Render provider list
  const renderProviderList = () => (
    filteredLocations.length === 0 ? (
      <p style={styles.noData}>Keine Leistungserbringer verfügbar.</p>
    ) : (
      <ul style={styles.list}>
        {filteredLocations.map((provider, index) => {
          const { type, name, address, city } = getProviderDetails(provider);
          if (!type || !name) return null;

          const providerKey = getProviderKey(type, name, address);
          
          return (
            <li key={index} style={styles.listItem}>
              <span style={{ ...styles.colorDot, backgroundColor: LINE_COLORS[index % LINE_COLORS.length] }} />
              <strong>{name}</strong><br />
              {city && <>Stadt: {city}<br /></>}
              {address && <>Adresse: {address}<br /></>}
              {provider.clinic_number_of_beds && <>Anzahl von Betten: {provider.clinic_number_of_beds}<br /></>}
              {provider.cooperation && <>Kooperation: {provider.cooperation}<br /></>}
              {provider.clinic_chefarzt && <>Chefarzt: {provider.clinic_chefarzt}<br /></>}
              Beste Route: <span style={styles.bold}>{distances[providerKey] || "Berechne..."} km</span>
            </li>
          );
        })}
      </ul>
    )
  );

  // Mock data for ICD chart
  const mockICDData = [
    { icd: "D27", count: 120 },
    { icd: "C50", count: 85 },
    { icd: "G40", count: 42 },
    { icd: "I10", count: 60 },
    { icd: "C34", count: 30 }
  ];

  return (
    <div style={styles.scrollWrapper}>
      {/* Section 1: Selected Location Information */}
      <div style={styles.scrollSection(15)}>
        <h3 style={styles.title}>Informationen zur ausgewählten Einrichtung</h3>
        <div style={styles.scrollSectionContent}>
          {renderSelectedLocationInfo()}
        </div>
      </div>
  
      {/* Section 2: Provider Information */}
      <div style={styles.scrollSection(25)}>
        <h3 style={styles.title}>Leistungserbringer Informationen</h3>
        <div style={styles.scrollSectionContent}>
          {renderProviderList()}
        </div>
      </div>
  
      {/* Section 3: Analytics Dashboard */}
      <div style={styles.scrollSection(55)}>
        <h3 style={styles.title}>Analytics Dashboard</h3>
        <div style={styles.scrollSectionContent}>
          {/* ICD Distribution Chart */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ marginBottom: "8px" }}>Verteilung der ICD-Fälle</h4>
            <p style={{ marginBottom: "12px", fontSize: "12px" }}>
              Zeigt an, wie viele Fälle (Fallzahlen) mit jedem ICD-Code verbunden sind.
            </p>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockICDData}>
                  <XAxis dataKey="icd" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: "12px",
                      borderRadius: "4px",
                      padding: "6px"
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <hr style={{ borderColor: "#ddd", margin: "15px 0" }} />
          
          {/* Reachability Section */}
          <div style={{ margin: "15px 0" }}>
            <h4 style={{ marginBottom: "8px" }}>Erreichbarkeit</h4>
            <p style={{ marginBottom: "12px", fontSize: "12px" }}>
            Nächstgelegene und entfernteste Anbieter deutlich anzeigen.
                   
            Unterversorgte Gebiete deutlich hervorheben.
            </p>
            <p style={styles.noData}>Analyse in Bearbeitung...</p>
          </div>
  
          <hr style={{ borderColor: "#ddd", margin: "15px 0" }} />
  
          {/* Additional Analytics Sections */}
          <div style={{ margin: "15px 0" }}>
            <h4 style={{ marginBottom: "8px" }}>Spezialisierungsgrad</h4>
            <p style={{ marginBottom: "12px", fontSize: "12px" }}>
              Zentren mit hoher Fallzahl in spezifischen ICD-Bereichen.Kennzeichnen Sie diese als „Centers of Excellence“.
            </p>
            <p style={styles.noData}>Analyse in Bearbeitung...</p>
          </div>
          <hr style={{ borderColor: "#ddd", margin: "15px 0" }} />
          {/* Additional Analytics Sections */}
          <div style={{ margin: "15px 0" }}>
            <h4 style={{ marginBottom: "8px" }}>Kooperationsnetzwerke (Kooperationsnetzwerke)</h4>
            <p style={{ marginBottom: "12px", fontSize: "12px" }}>
              
            </p>
            <p style={styles.noData}>Analyse in Bearbeitung...</p>
          </div>
          <hr style={{ borderColor: "#ddd", margin: "15px 0" }} />
          {/* Additional Analytics Sections */}
          <div style={{ margin: "15px 0" }}>
            <h4 style={{ marginBottom: "8px" }}>Empfohlene Behandlungsorte (Smart Recommendations)</h4>
            <p style={{ marginBottom: "12px", fontSize: "12px" }}>
            Kombinationen von Distanz, Spezialisierung und Kooperation. Oder Verwenden ein Scoring-System oder ein einfaches ML-Modell, um Anbieter zu bewerten.
            </p>
            <p style={styles.noData}>Analyse in Bearbeitung...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Analytics;