import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "./components/LocationContext";


// SearchForm component for searching locations based on city, radius, and focus areas
// It allows users to filter by providers and cooperation options, and updates the global state with search
const SearchForm = ({ setGraphData, setCooperationData, setInputRadius, setInputCity, setSearchCenter }) => {
  const {
    allLocations,
    selectedLocation,
    setSelectedLocation,
    userLocation,
    setSearchRadius,
    setFocus: setGlobalFocus, // ✅ global setFocus holen
    setSearchResult,
    setTopICDs
  } = useLocation();

  const [city, setCity] = useState("");
  const [icdCode, setIcdCode] = useState("");
  const [radius, setRadius] = useState(20);
  const [focus, setFocus] = useState({ onkologie: false, neurologie: false });
  const [providers, setProviders] = useState({ clinics: false, mvz: false, asv: false, niedergelasseneAertze: false });
  const [cooperation, setCooperation] = useState(false);

  useEffect(() => {
    if (setSearchRadius) {
      setSearchRadius(Number(radius));
    }
  }, [radius, setSearchRadius]);

  useEffect(() => {
    if (icdCode.trim() !== "") {
      setFocus({ onkologie: false, neurologie: false });
    }
  }, [icdCode]);

  // Set global focus(Onkologie/Neurologie) based on local state
  useEffect(() => {
    const selected = [];
    if (focus.onkologie) selected.push("Onkologie");
    if (focus.neurologie) selected.push("Neurologie");
    setGlobalFocus(selected);
  }, [focus, setGlobalFocus]);

  useEffect(() => {
    setInputRadius(radius);
    setInputCity(city);
  }, [radius, city, setInputRadius, setInputCity]);

  const geocodeCity = async (cityName) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
      if (response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
        };
      }
    } catch (err) {
      console.error("❌ Geocoding error:", err);
    }
    return null;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("🔵 Search Button Clicked");

    let coords = userLocation;

    if (!coords && city.trim()) {
      coords = await geocodeCity(city);
      if (!coords) {
        alert("❌ Stadt konnte nicht gefunden werden.");
        return;
      }
    }
 
    const params = {
      city,
      icd_code: icdCode,
      radius,
      onkologie: focus.onkologie,
      neurologie: focus.neurologie,
      clinic: providers.clinics,
      mvz: providers.mvz,
      asv: providers.asv,
      niedergelasseneArzt: providers.niedergelasseneAertze,
      cooperation: cooperation ? "true" : "false",
      lat: coords?.latitude,
      lon: coords?.longitude,
    };

    try {
      const response = await axios.get("http://127.0.0.1:5000/search/A", { params });
      const { providers, cooperations, center, top_icds } = response.data;
      setSearchResult(response.data); 


      const validProvider = (providers || []).filter(loc => loc.lat && loc.lon);
      setGraphData(validProvider);

      const validCooperation = (cooperations || []).filter(loc => loc.target_lat && loc.target_lon);
      setCooperationData(validCooperation);

      if (center && center.lat && center.lon) {
        setSearchCenter([center.lat, center.lon]);
      }

      // 
      setTopICDs(top_icds || []);

    } catch (error) {
      console.error("❌ API Error:", error);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch} style={styles.form}>
        <div style={styles.searchRow}>
          <div style={styles.inputContainer}>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={styles.input}
              required={!userLocation}
            />
          </div>
          <div style={styles.guideBox}>
            <strong>Sucheingaben: Bitte geben Sie die gewünschte Stadt ein.</strong>
          </div>
        </div>

        <div style={styles.radiusContainer}>
          <label>Umkreis </label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            style={styles.radiusInput}
          />
          <span>km</span>
        </div>

        <div style={styles.filterRow}>
          <div style={styles.filterBox}>
            <h3>Schwerpunkt</h3>
            <label>
              <input
                type="checkbox"
                checked={focus.onkologie}
                onChange={() => setFocus({ onkologie: !focus.onkologie, neurologie: false })}
              />
              Onkologie
            </label>
            <div style={{ marginTop: "5px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={focus.neurologie}
                  onChange={() => setFocus({ neurologie: !focus.neurologie, onkologie: false })}
                />
                Neurologie
              </label>
            </div>
          </div>

          <div style={styles.filterBox}>
            <h3>Leistungserbringer</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <label><input type="checkbox" checked={providers.clinics} onChange={() => setProviders({ ...providers, clinics: !providers.clinics })} /> Kliniken</label>
              <label><input type="checkbox" checked={providers.mvz} onChange={() => setProviders({ ...providers, mvz: !providers.mvz })} /> MVZ</label>
              <label><input type="checkbox" checked={providers.asv} onChange={() => setProviders({ ...providers, asv: !providers.asv })} /> ASV</label>
            </div>
            <div style={{ marginTop: "5px" }}>
              <label><input type="checkbox" checked={providers.niedergelasseneAertze} onChange={() => setProviders({ ...providers, niedergelasseneAertze: !providers.niedergelasseneAertze })} /> Niedergelassene Ärzte</label>
            </div>
          </div>

          <div style={styles.filterBox}>
            <h3>Kooperationen</h3>
            <label>
              <input type="checkbox" checked={cooperation} onChange={() => setCooperation(!cooperation)} />
              Kooperationen anzeigen
            </label>
          </div>
        </div>

        <button type="submit" style={styles.searchButton}>Suche</button>
      </form>
    </div>
  );
};

const styles = {
  container: { padding: "10px", borderRadius: "8px", border: "2px solid #b3e5fc", backgroundColor: "#f9f9f9", width: "59%", height: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", overflow: "auto", marginBottom: "5px" },
  form: { display: "flex", flexDirection: "column", gap: "10px", width: "100%" },
  searchRow: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
  inputContainer: { display: "flex", gap: "10px", alignItems: "center", flex: "2" },
  input: { fontSize: "12px", padding: "5px", width: "100%" },
  guideBox: { flex: "3", backgroundColor: "#e3f2fd", justifyContent: "space-between", padding: "5px", borderRadius: "5px", fontSize: "14px", marginLeft: "10px", marginRight: "10px", boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)" },
  radiusContainer: { display: "flex", alignItems: "center", gap: "8px", paddingLeft: "5px" },
  radiusInput: { width: "60px", padding: "5px" },
  filterRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", width: "100%" },
  filterBox: { flex: 1, backgroundColor: "#fff", padding: "10px", borderRadius: "5px", boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)", fontSize: "12px", width: "30%", minWidth: "250px", height: "100px", justifyContent: "space-between" },
  searchButton: { padding: "10px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", width: "10%", fontSize: "14px" }
};

export default SearchForm;
