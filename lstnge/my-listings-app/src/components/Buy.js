import React, { useState, useEffect, useCallback } from 'react';
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import placeholderIcon from "../assets/placeholder.png";  // Import the image

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";

const icon = L.icon({
  iconUrl: placeholderIcon,  // Use the imported image
  iconSize: [38, 38],
});

const initialPosition = [51.505, -0.09];

function ResetCenterView({ selectPosition }) {
  const map = useMap();

  useEffect(() => {
    if (selectPosition) {
      map.setView(
        L.latLng(selectPosition.lat, selectPosition.lon),
        map.getZoom(),
        { animate: true }
      );
    }
  }, [selectPosition, map]);

  return null;
}

const Buy = () => {
  const [selectPosition, setSelectPosition] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [listPlace, setListPlace] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const fetchPlaces = useCallback(async (query) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        q: query,
        format: "json",
        addressdetails: 1,
        polygon_geojson: 0,
      };
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${NOMINATIM_BASE_URL}${queryString}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setListPlace(result);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    fetchPlaces(searchText);
  };

  // Add a debounce to prevent excessive requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim()) {
        handleSearch();
      }
    }, 500); // Debounce time of 500ms

    return () => clearTimeout(timer);
  }, [searchText, handleSearch]);

  useEffect(() => {
    if (selectPosition && selectPosition.address) {
      setCountry(selectPosition.address.country || "");
      setCity(selectPosition.address.city || selectPosition.address.town || selectPosition.address.village || "");
    }
  }, [selectPosition]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div style={{ width: "50vw", height: "100%" }}>
        <MapContainer
          center={initialPosition}
          zoom={8}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=b7RZUb54YLGwnDOTZXsz"  // Verify this URL and key
          />
          {selectPosition && (
            <Marker
              position={[selectPosition.lat, selectPosition.lon]}
              icon={icon}
            >
              <Popup>
                <div>
                  <strong>{selectPosition.display_name}</strong>
                  <br />
                  {selectPosition.address ? (
                    <div>
                      {Object.entries(selectPosition.address).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {value}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>No additional address details available.</div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          <ResetCenterView selectPosition={selectPosition} />
        </MapContainer>
      </div>
      <div style={{ width: "50vw", padding: "20px" }}>
        <p>Your location is {country}, {city}</p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex" }}>
            <OutlinedInput
              style={{ width: "100%" }}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search for a place"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => fetchPlaces(searchText)}
              style={{ marginLeft: "20px" }}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          <List component="nav" aria-label="main mailbox folders">
            {listPlace.map((item) => (
              <div key={item?.place_id}>
                <ListItem button onClick={() => setSelectPosition(item)}>
                  <ListItemIcon>
                    <img
                      src={placeholderIcon}  // Use the imported image
                      alt="Placeholder"
                      style={{ width: 38, height: 38 }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={item?.display_name} />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}

export default Buy;
