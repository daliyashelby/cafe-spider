"use client";

import { useEffect, useState } from "react";




import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});





export default function Home() {
  const [location, setLocation] = useState<{
  lat: number;
  lng: number;
} | null>(null);
  const [cafes, setCafes] = useState([]);
  const [maxDistance, setMaxDistance] = useState(6);
  const [loading, setLoading] = useState(true);
  
  const userIconConfig = {
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
};

const cafeIconConfig = {
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
};
  const [error, setError] = useState(null);
  const [selectedCafe, setSelectedCafe] = useState(null);
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
        [amenity=cafe]
        (around:6000, ${lat}, ${lng});
      out;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
      }
    );

    const data = await response.json();
    const cafesWithRatings = data.elements
  .slice(0, 25)
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

        setLocation({ lat, lng });
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

const getDistance = (lat1, lon1, lat2, lon2) => {
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

 return (
  <main
  style={{
    minHeight: "100vh",
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
 Discover cafes around you visually
</p>
</div>

    {location ? (
      <>
        <p>
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
    max="6"
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
            width: "90vw",
            maxWidth: "400px",
            height: "90vw",
            maxHeight: "400px",
            margin: "40px auto",
            border: "1px solid #334155",
            background: "#020617",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            borderRadius: "50%",
          }}
        >
          {/* SVG LINES (spider web) */}
  <svg
    width="400"
    height="400"
    style={{ position: "absolute", top: 0, left: 0 }}
  >
    {/* ✅ ADD RINGS HERE */}
  {[50, 100, 150, 180].map((r, i) => (
    <circle
      key={i}
      cx="200"
      cy="200"
      r={r}
      fill="none"
      stroke="rgba(150,150,150,0.3)"
      strokeWidth="1"
    />
  ))}
    {filteredCafes.map((cafe, index) => {
      const angle = (index / filteredCafes.length) * 2 * Math.PI;

      const distance = getDistance(
        location.lat,
        location.lng,
        cafe.lat,
        cafe.lng
      );

      const maxDistance = 5;
      const radius = Math.min((distance / maxDistance) * 180, 180);

      const x = 200 + radius * Math.cos(angle);
      const y = 200 + radius * Math.sin(angle);

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
  const angle = (index / filteredCafes.length) * 2 * Math.PI;

  const distance = getDistance(
    location.lat,
    location.lng,
    cafe.lat,
    cafe.lng
  );

  const maxDistance = 5; // normalize (5km max)
  const radius = Math.min((distance / maxDistance) * 180, 180);

  const x = 200 + radius * Math.cos(angle);
  const y = 200 + radius * Math.sin(angle);
  

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
        left: x,
        top: y,
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
         opacity: 0,
      animation: "fadeIn 0.5s ease forwards",
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

  {/* 🗺️ View in App Map */}
  <button
    onClick={() => setView("map")}
    style={{
      padding: "8px",
      borderRadius: "8px",
      border: "none",
      background: "#3b82f6",
      color: "white",
      cursor: "pointer",
    }}
  >
    View on Map
  </button>

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
