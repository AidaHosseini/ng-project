import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "./LocationContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { providerColors } from "../components/Constants.js";
import { useNavigate } from "react-router-dom"; 
import icdNames from "../data/icd_names.json";




// This function calculates the Haversine distance between two geographical points
// It returns the distance in kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Analytics component to display various analytics and information about healthcare providers
// It shows selected location info, provider lists, top ICDs, and recommended routes
const Analytics = () => {
  const navigate = useNavigate();
  const { allLocations, selectedLocation, icd, cooperations, focus, topICDs, searchResult } = useLocation();
  const [distances, setDistances] = useState({});
  
  // Find the user's location from allLocations
  const userLocation = useMemo(() =>
    allLocations.find(loc => loc.clinic_name === "Your Location"),
    [allLocations]
  );

  // Filter source and target providers from allLocations (source and target providers are for "HAS_KOOPERIERT_MIT" relations)
  // Source providers are those without target_name and not "Your Location"
  const sourceProviders = useMemo(() =>
    allLocations.filter(loc =>
      loc.clinic_name !== "Your Location" &&
      loc.name && !loc.target_name
    ), [allLocations]
  );


  const targetProviders = useMemo(() =>
    allLocations.filter(loc =>
      loc.clinic_name !== "Your Location" &&
      loc.target_name
    ), [allLocations]
  );

  // const getProviderKey = (name, address) => `${(name || '').trim()}-${(address || '').trim()}`;
  const getProviderKey = (name, address) => {
  return `${String(name || "").trim()}_${String(address || "").trim()}`;
};

  useEffect(() => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) return;

    // Calculate distances from user location to each source provider
    // and store them in a map with provider key as the key
    const distanceMap = {};
    sourceProviders.forEach((provider) => {
      const lat = provider.lat || provider.latitude;
      const lon = provider.lon || provider.longitude;
      const name = provider.name;
      const address = provider.address;

      if (!lat || !lon || !name) return;

      // Calculate the distance using haversine formula
      const d = haversineDistance(userLocation.latitude, userLocation.longitude, lat, lon);
      const key = getProviderKey(name, address);
      distanceMap[key] = d.toFixed(2);
    });

    setDistances(distanceMap);
  }, [userLocation, sourceProviders]);

  // Function to render selected location information
  // It displays the name, address, city, chief physician, specialty, and distance from
  const renderSelectedLocationInfo = () => {
    if (!selectedLocation) return <p style={styles.noData}>Keine Einrichtung ausgewählt.</p>;
    const name = selectedLocation.name || selectedLocation.target_name;
    const address = selectedLocation.address || selectedLocation.target_address;
    const city = selectedLocation.city || selectedLocation.target_city;
    const chefarzt = selectedLocation.chefarzt || selectedLocation.target_chefarzt;
    const specialty = selectedLocation.specialty || selectedLocation.target_specialty;
    //const website = selectedLocation.website || selectedLocation.target_website || "website";;
    const key = getProviderKey(name, address);
    
    return (
      <>
        <p>
          <strong>Name:</strong> {name}
          <span style={{ marginLeft: "8px", color: "#FFD700", fontSize: "16px" }}>
            ★★★★★
          </span>
        </p>

        <p><strong>Adresse:</strong> {address}</p>
        <p><strong>Stadt:</strong> {city}</p>
        {chefarzt && <p><strong>Chefarzt:</strong> {chefarzt}</p>}
        {specialty && <p><strong>Fachgebiet:</strong> {Array.isArray(specialty) ? specialty.join(", ") : specialty}</p>}
        <p><strong>Beste Route von Ihren/ausgewählten Standort:</strong> {distances[key] ? `${distances[key]} km` : "Berechne..."}</p>
        
        
        <div style={{display: "flex", gap: "10px", marginTop: "10px"}}>
          <button
          onClick={() => navigate("/rate", { state: { provider: selectedLocation } })}
          style={styles.button}
        >
          Bewerten
        </button>
        <button onClick={() => navigate("/edit-providers")}
          style={styles.button}>
          🔧 Einrichtungen bearbeiten
        </button>
        </div>

      </>
    );
  };

  // Function to render the list of providers (source and target)
  // It combines both source and target providers, displays their details,
  const renderProviderList = () => {
    const combined = [...sourceProviders, ...targetProviders];

    if (combined.length === 0) {
      return <p style={styles.noData}>Keine Leistungserbringer verfügbar.</p>;
    }

    return (
      <ul style={styles.list}>
        {combined.map((provider, index) => {
          const isTarget = !!provider.target_name;
          const name = provider.name || provider.target_name;
          const address = provider.address || provider.target_address;
          const city = provider.city || provider.target_city;
          const type = provider.type || provider.target_type || "Kooperation";
          const chefarzt = provider.chefarzt || provider.target_chefarzt;
          const specialty = provider.specialty || provider.target_specialty;
          // const website = selectedLocation.website || selectedLocation.target_website || "website";
          const key = getProviderKey(name, address);

          return (
            <li key={index} style={styles.listItem}>
              <span style={{
                ...styles.colorDot,
                backgroundColor: providerColors[type] || (isTarget ? "pink" : "gray")
              }} />
              <strong>{name}</strong><br />
              {city && <>Stadt: {city}<br /></>}
              {address && <>Adresse: {address}<br /></>}
              
              {chefarzt && <>Chefarzt: {chefarzt}<br /></>}
              {specialty && <>Fachgebiet: {Array.isArray(specialty) ? specialty.join(", ") : specialty}<br /></>}
              {!isTarget && <>
                Beste Route von Ihren/ausgewählten Standort: <span style={styles.bold}>{distances[key] || "?"} km</span><br />
              </>}
              
              {isTarget && <i style={{ color: "#999" }}>Kooperationspartner</i>}
            </li>
          );
        })}
      </ul>
    );
  };
  
  const providers = searchResult?.providers || [];

  // ----- Filter clinics -----
  // Filter only clinics from the providers list
  const clinics = providers.filter(p => p.type === "Clinic");

  // ----- Top 3 by number of cases -----
    const selectedFocus = focus[0]; // entweder "Onkologie" oder "Neurologie"

    const fieldName = selectedFocus === "Neurologie" ? "fallzahlNeurologie" : "fallzahlOnkologie";

    const topFocus = [...clinics]
      .map(p => ({
        ...p,
        fallzahl: parseInt(p[fieldName]) || 0
      }))
      .sort((a, b) => b.fallzahl - a.fallzahl)
      .slice(0, 3);
    console.log("TopFocus raw clinics:", clinics.map(c => ({
      name: c.name,
      fallzahlNeurologie: c.fallzahlNeurologie,
      fallzahlOnkologie: c.fallzahlOnkologie
    })));

  // ----- Top 3 by number of beds -----
  const topBeds = [...clinics]
    .map(p => ({
      ...p,
      number_of_bed: parseInt(p.number_of_bed) || 0
    }))
    .sort((a, b) => b.number_of_bed - a.number_of_bed)
    .slice(0, 3);


  // Function to render recommended routes based on user location and source providers
  // It calculates the distance from user location to each source provider
  const renderRecommendedRoutes = () => {
    if (!userLocation || !sourceProviders.length) {
      return <p style={styles.noData}>Keine Standortdaten oder Anbieter verfügbar.</p>;
    }

    const sortedProviders = sourceProviders
      .map((provider) => {
        const lat = provider.lat || provider.latitude;
        const lon = provider.lon || provider.longitude;
        const name = provider.name;
        const address = provider.address;
        const key = getProviderKey(name, address);

        return {
          ...provider,
          distance: parseFloat(distances[key]) || Infinity
        };
      })
      .filter(p => p.distance !== Infinity)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // 3 nearest providers

    return (
      <ul style={styles.list}>
        {sortedProviders.map((provider, index) => (
          <li key={index} style={styles.listItem}>
            <span style={{
              ...styles.colorDot,
              backgroundColor: providerColors[provider.type] || "gray"
            }} />
            <strong>{provider.name}</strong><br />
            Stadt: {provider.city}<br />
            Adresse: {provider.address}<br />
            Entfernung: <span style={styles.bold}>{provider.distance.toFixed(2)} km</span>
          </li>
        ))}
      </ul>
    );
  };

  // Function to render cooperation list
  // It displays the cooperation relationships between source and target providers
  const renderCooperationList = () => {
    if (!Array.isArray(cooperations) || cooperations.length === 0) {
      return <p style={styles.noData}>Keine Kooperationsdaten verfügbar.</p>;
    }

    return (
      <ul style={styles.list}>
        {cooperations.map((coop, index) => (
          <li key={index} style={styles.listItem}>
            <span style={{
              ...styles.colorDot,
              backgroundColor: providerColors[coop.source_type] || "gray"
            }} />
            <strong>{coop.source_name}</strong> ({coop.source_type})<br />
            <span style={{ marginLeft: "18px" }}>⮕ kooperiert mit </span>
            <strong>{coop.target_name}</strong> ({coop.target_type})
          </li>
        ))}
      </ul>
    );
  };
  
  // ----- Render Top ICDs -----
const renderTopICDs = () => {
  if (!Array.isArray(topICDs) || topICDs.length === 0) {
    return <p style={styles.noData}>Keine ICD-Informationen verfügbar.</p>;
  }

  // Kategorie bestimmen
  const selected = (focus || []).includes("Neurologie") ? "Neurologie" : "Onkologie";

  // Nur ICDs aus der ausgewählten Kategorie auswählen + sortieren + Top 3
  const icds = topICDs
    
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Beste year-Array aus den Clinics finden (die mit den meisten Jahren)
  const yearArray = clinics
    .filter(c => Array.isArray(c.year) && c.year.length > 0)
    .sort((a, b) => b.year.length - a.year.length)[0]?.year;

  const yearsText = yearArray ? ` (Durchschnitt der Jahre ${yearArray.join(", ")})` : "";

  return (
    <div style={{ marginBottom: "15px" }}>
      <h4>
        Häufigste {selected.toLowerCase()} ICD-Diagnosen (Krankheiten)
        {yearsText}
      </h4>
      <ul style={{ paddingLeft: "15px" }}>
        {icds.map((icd, index) => {
          const info = icdNames[icd.code];
          const description = info ? info.common_term : "(Beschreibung nicht gefunden)";
          return (
            <li key={index}>
              <strong>{icd.code}</strong>: {description} ({icd.total} Fälle)
            </li>
          );
        })}
      </ul>
    </div>
  );
};

  
  return (
    <div style={styles.scrollWrapper}>
      <div style={styles.scrollSection(25)}>
        <h3 style={styles.title}>Informationen zur ausgewählten Einrichtung</h3>
        <div style={styles.scrollSectionContent}>{renderSelectedLocationInfo()}</div>
      </div>

      <div style={styles.scrollSection(30)}>
        <h3 style={styles.title}>Leistungserbringer Informationen</h3>
        <div style={styles.scrollSectionContent}>{renderProviderList()}</div>
      </div>

    <div style={styles.scrollSection(75)}>
  <h3 style={styles.title}>Analytics Dashboard</h3>
  <div style={styles.scrollSectionContent}>
    {renderTopICDs()} 
    
    {/* Top Onkologie Fälle */}
    <div style={{ marginBottom: "30px" }}>
      <h4>Top 3 Kliniken mit den meisten Fällen ({selectedFocus})</h4>
      <div style={{ height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topFocus.map(p => ({ name: p.name, value: p.fallzahl }))}>
            <XAxis dataKey="name" tick={{ fontSize: 6, angle: 0 }} interval={0} height={60} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Top Kliniken mit Betten */}
    <div style={{ marginBottom: "30px" }}>
      <h4>Top 3 Kliniken mit den meisten Betten</h4>
      <div style={{ height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topBeds.map(p => ({ name: p.name, value: p.number_of_bed }))}>
            <XAxis dataKey="name" tick={{ fontSize:6, angle: 0 }} interval={0} height={60} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div>
      <h4>Erreichbarkeit von Ihrem/Eingangsort</h4>
      {renderRecommendedRoutes()}
    </div>
   
    <hr style={{ borderColor: "#ddd", margin: "15px 0" }} />
    <div>
      <h4>Kooperationsverbindungen zwischen Einrichtungen</h4>
      {renderCooperationList()}
    </div>

    <hr style={{ borderColor: "#ddd", margin: "15px 0" }} />
    <div><h4>Empfohlene Behandlungsorte</h4><p style={styles.noData}>Analyse in Bearbeitung...</p></div>

  </div>
</div>
    </div>
  );
};

export default Analytics;

// Styles for the Analytics component
// These styles are used to format the layout and appearance of the component
const styles = {
  scrollWrapper: {
    width: "35%", position: "absolute", right: "10px", top: "130px", bottom: "5px",
    height: "100%", display: "flex", flexDirection: "column", gap: "10px", padding: "10px",
    fontSize: "12px", fontWeight: "600", boxSizing: "border-box"
  },
  scrollSection: (percentage) => ({
    height: `${percentage}%`, display: "flex", flexDirection: "column", overflow: "hidden", bottom: "5px"
  }),
  scrollSectionContent: {
    flex: 1, overflowY: "auto", backgroundColor: "#F0F1F1", border: "2px solid #b3e5fc",
    padding: "10px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", bottom: "20px"
  },
  title: {
    fontSize: "16px", marginBottom: "4px", fontWeight: "600", padding: "2px 6px", borderRadius: "2px"
  },
  list: { listStyleType: "none", padding: 0, margin: 0 },
  listItem: { marginBottom: "8px", padding: "8px", borderBottom: "1px solid #ddd" },
  bold: { fontWeight: "600" },
  noData: { fontStyle: "italic", color: "#999" },
  colorDot: {
    display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", marginRight: "5px"
  },
  
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "10px",
    flex: 1
  }



};
