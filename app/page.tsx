
"use client";

import { useEffect, useState } from "react";




import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});





export default function Home() {
  type LocationType = {
  lat: number;
  lng: number;
};
const [location, setLocation] = useState<LocationType | null>(null);
type Cafe = {
  name: string;
  lat: number;
  lng: number;
  rating: string;
};
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [maxDistance, setMaxDistance] = useState(10);
  const [loading, setLoading] = useState(true);
  
  const userIconConfig = {
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
};

const cafeIconConfig = {
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
};
 const [error, setError] = useState<string | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
   const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);


  const [view, setView] = useState("spider");
  

 const fetchCafes = async (lat:number, lng:number) => {
  try {
    const query = `
      [out:json];
      node
        [amenity~"cafe|restaurant|coffee_shops"]
        (around:10000, ${lat}, ${lng});
      out;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
         headers: {
      "Content-Type": "text/plain",
    },
      }
    );
    if (!response.ok) {
  setError("Failed to fetch cafes");
  setLoading(false);
  return;
}
    const data = await response.json();
    const cafesWithRatings = data.elements
  .slice(0, 50)
  .map((place: any) => ({
    name: place.tags?.name || "Unnamed Cafe",
    lat: place.lat,
    lng: place.lon,
    rating: (Math.random() * 2 + 3).toFixed(1),
  }));



    setCafes(cafesWithRatings);
    setLoading(false);
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation(() => ({ lat, lng }));
        fetchCafes(lat, lng);
      },
      (err) => {
        console.error("Location error:", err);
        setError("Location access denied");
      }
    );
  }, []);
  useEffect(() => {
  if (selectedCafe && location) {
    const distance = getDistance(
      location.lat,
      location.lng,
      selectedCafe.lat,
      selectedCafe.lng
    );

    if (distance > maxDistance) {
      setSelectedCafe(null);
    }
  }
}, [maxDistance]);

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};
const filteredCafes = cafes.filter((cafe) => {
  if (!location) return false;

  const distance = getDistance(
    location.lat,
    location.lng,
    cafe.lat,
    cafe.lng
  );

  return distance <= maxDistance;
});
const size = Math.min(90, maxDistance * 12);
const CENTER = 200;
 return (
  <main
  style={{
    minHeight: "100dvh",
    background: "#0f172a",
    color: "white",
    padding: "20px",
    fontFamily: "sans-serif",
  }}
>
      
    <style>
      {`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
          @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}
    </style>
      
   
 <div style={{ textAlign: "center", marginBottom: "20px" }}>
    <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
  ☕ Cafe Spider
</h1>

<p style={{ opacity: 0.7 }}>
 Discover cafes and restaurants around you visually
</p>
</div>

    {location ? (
      <>
        <p style={{ textAlign: "center" }}>
          Your Location: {location.lat}, {location.lng}
        </p>
        {/* ✅ ADD BUTTONS EXACTLY HERE */}
<div style={{
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  }}
>
 

<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  }}
>
  <div
    style={{
      display: "flex",
      background: "#1e293b",
      borderRadius: "999px",
      padding: "4px",
      position: "relative",
      width: "220px",
    }}
  >
    {/* Sliding background */}
    <div
      style={{
        position: "absolute",
        top: "1px",
        left: view === "spider" ? "2px" : "110px",
        width: "106px",
        height: "35px",
        background: "#3b82f6",
        borderRadius: "999px",
        transition: "all 0.3s ease",
      }}
    />

    {/* Spider */}
    <button
      onClick={() => setView("spider")}
      style={{
        flex: 1,
        zIndex: 1,
        border: "none",
        background: "transparent",
        color: "white",
        cursor: "pointer",
      }}
    >
      🕸️ Spider
    </button>

    {/* Map */}
    <button
      onClick={() => setView("map")}
      style={{
        flex: 1,
        zIndex: 1,
        border: "none",
        background: "transparent",
        color: "white",
        cursor: "pointer",
      }}
    >
      🗺️ Map
    </button>
  </div>
</div>


</div>
<div style={{ textAlign: "center", marginBottom: "20px" }}>
  <p style={{ marginBottom: "5px" }}>
    Distance: <strong>{maxDistance} km</strong>
  </p>
  <input
    type="range"
    min="1"
    max="10"
    value={maxDistance}
    onChange={(e) => setMaxDistance(Number(e.target.value))}
    style={{ width: "200px" }}
  />
   <p style={{ marginTop: "5px", opacity: 0.6 }}>
    {filteredCafes.length} cafes found
  </p>
</div>{loading && <p>Loading cafes...</p>}
  
{view === "spider" && (
  

  <>
  
        <div
          style={{
           position: "relative",
               width: `${size}vw`,
    height: `${size}vw`,
    maxWidth: "600px",
    maxHeight: "600px",
  aspectRatio: "1 / 1",
  margin: "40px auto",
  border: "1px solid #334155",
  background: "#020617",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  borderRadius: "50%",
  overflow: "hidden",
          }}
        >
          {/* SVG LINES (spider web) */}
  <svg
  viewBox="0 0 400 400"
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  }}
>
    {/* ✅ ADD RINGS HERE */}
  {[1, 2, 3, 4, 5].map((step) => {
  const r = (step / 5) * 180;
    
  return (
    <circle
      key={step}
      cx="200"
      cy="200"
      r={r}
      fill="none"
      stroke="rgba(150,150,150,0.3)"
      strokeWidth="1"
    />
  );
})}
    {filteredCafes.map((cafe, index) => {
      const angle = (index * 2 * Math.PI) / filteredCafes.length;
      const distance = getDistance(
        location.lat,
        location.lng,
        cafe.lat,
        cafe.lng
      );

      
     const radius = Math.min((distance / maxDistance) * 180, 180);



      
      
      const x = CENTER + radius * Math.cos(angle);
const y = CENTER + radius * Math.sin(angle);
      
      return (
        <line
          key={index}
          x1="200"
          y1="200"
          x2={x}
          y2={y}
          stroke="rgba(80,80,80,0.6)"
          strokeWidth="1.5"
          style={{
            strokeDasharray: "300",
            strokeDashoffset: "300",
            animation: "drawLine 1s ease forwards",
            animationDelay: `${index * 0.1}s`,
  }}
        />
      );
    })}
  </svg>
          {/* YOU (center) */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: "red",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              }}
              
            
          />

          {/* CAFES */}
       {filteredCafes.map((cafe, index) => {
  const angle = (index * 2 * Math.PI) / filteredCafes.length;

  const distance = getDistance(
    location.lat,
    location.lng,
    cafe.lat,
    cafe.lng
  );

  
  const radius = Math.min((distance / maxDistance) * 180, 180);

  const x = CENTER + radius * Math.cos(angle);
const y = CENTER + radius * Math.sin(angle);

  return (
    <div
      key={index}
      title={`${cafe.name} (${distance.toFixed(2)} km)`}
     
      onMouseEnter={() => setSelectedCafe(cafe)}
      onClick={() => {
      setSelectedCafe(cafe);
      setView("map"); // 🔥 switch to map
       if (window.innerWidth < 768) {
    setView("map"); // optional for mobile UX
  }
}}
      style={{
        position: "absolute",
        left: `${(x / 400) * 100}%`,
top: `${(y / 400) * 100}%`,
        transform:
          selectedCafe?.lat === cafe.lat &&
          selectedCafe?.lng === cafe.lng
            ? "translate(-50%, -50%) scale(1.6)"
            : "translate(-50%, -50%) scale(1)",
        background:
        selectedCafe?.lat === cafe.lat &&
        selectedCafe?.lng === cafe.lng 
          ? "#22c55e"
          : "#3b82f6",
        boxShadow:
        selectedCafe?.lat === cafe.lat &&
        selectedCafe?.lng === cafe.lng
          ? "0 0 15px #22c55e"
          : "none",
        
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        cursor: "pointer",
         opacity: 1,
      
      animationDelay: `${index * 0.1}s`,
      transition: "all 0.2s ease",
      }}
    />
  );
})}
        </div>
        {selectedCafe && (
          <div style={{ marginTop: "20px" }}>
            <h3>{selectedCafe.name}</h3>
          </div>
        )}
      </>
)}  
{/* ✅ MAP VIEW WRAPPER */}
        {view === "map" &&(
          <MapView
    location={location}
    cafes={filteredCafes}
    selectedCafe={selectedCafe}
    setSelectedCafe={setSelectedCafe}
    setView={setView}
    
  />
)}{selectedCafe && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      borderRadius: "12px",
      background: "#1e293b",
      border: "1px solid #334155",
      backdropFilter: "blur(10px)",
      color: "white",
      width: "300px",
      marginLeft: "auto",
      marginRight: "auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    }}
  >
    <h3 style={{ marginBottom: "10px" }}>
      ☕ {selectedCafe.name}
    </h3>
      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>

  

  {/* 📍 Open in Google Maps */}
  <a
    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCafe.lat},${selectedCafe.lng}`}
    target="_blank"
    style={{
      padding: "8px",
      borderRadius: "8px",
      background: "#22c55e",
      color: "white",
      textAlign: "center",
      textDecoration: "none",
    }}
  >
    Get Directions
  </a>

  {/* 🖼️ View Photos */}
  <a
    href={`https://www.google.com/search?q=${encodeURIComponent(selectedCafe.name)}+cafe`}
    target="_blank"
    style={{
      padding: "8px",
      borderRadius: "8px",
      background: "#f59e0b",
      color: "white",
      textAlign: "center",
      textDecoration: "none",
    }}
  >
    View Photos
  </a>

</div>
   {location && (
      <p style={{ fontSize: "14px", opacity: 0.8 }}>
        📏{" "}
        {getDistance(
          location.lat,
          location.lng,
          selectedCafe.lat,
          selectedCafe.lng
        ).toFixed(2)}{" "}
        km away
      </p>
    )}

    <button
      onClick={() => setSelectedCafe(null)}
      style={{
        marginTop: "10px",
        padding: "6px 12px",
        border: "none",
        borderRadius: "8px",
        background: "#ff4d4d",
        color: "white",
        cursor: "pointer",
      }}
    >
      Close
    </button>
  </div>
)}

      </>
      
    ) : (
      <p>Getting your location...</p>
    )}
  </main>
);
}
