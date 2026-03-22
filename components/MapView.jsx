"use client";

import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

export default function MapView({
  location,
  cafes,
  selectedCafe,
  setSelectedCafe,
  setView,
}) 
{
  const userIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
  });

  const cafeIcon = (cafe) =>
    new L.Icon({
      iconUrl: selectedCafe?.name === cafe.name
          ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
          : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      iconSize: [32, 32],
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
}, []);
   if (!mounted) return null;
  return (
    <div
  style={{
    width: "90vw",
    maxWidth: "400px",
    height: "90vw",
    maxHeight: "400px",
    margin: "0 auto",
  }}
>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* YOU */}
        <Marker position={[location.lat, location.lng]} icon={userIcon}>
          <Tooltip>You are here</Tooltip>
        </Marker>

        {/* CAFES */}
        {cafes.map((cafe, index) => (
          <Marker
            key={index}
            position={[cafe.lat, cafe.lng]}
            icon={L.icon({
    iconUrl:
      selectedCafe?.lat === cafe.lat &&
      selectedCafe?.lng === cafe.lng
        ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
  })}
            eventHandlers={{
              click: () => {
                setSelectedCafe(cafe);
                
              },
            }}
          >
            <Tooltip
              permanent={selectedCafe?.name === cafe.name}
            >
              {cafe.name}
            </Tooltip>
            <Popup>{cafe.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}