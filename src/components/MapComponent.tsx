"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons in leaflet with webpack
const iconBlue = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconGreen = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconRed = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Checkpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

interface Scan {
  id: string;
  reportRef: string;
  lat: number;
  lng: number;
  status: string;
  personnel: string;
  timestamp: string;
}

export default function MapComponent({ checkpoints, scans }: { checkpoints: Checkpoint[], scans: Scan[] }) {
  // Center map on the first checkpoint or a default location
  const center: [number, number] = checkpoints.length > 0 
    ? [checkpoints[0].lat, checkpoints[0].lng] 
    : [14.5995, 120.9842]; // Manila default

  return (
    <div style={{ height: "600px", width: "100%", borderRadius: "0.5rem", overflow: "hidden" }}>
      <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render Checkpoints (Blue pins + Geofence circle) */}
        {checkpoints.map(cp => (
          <div key={`cp-${cp.id}`}>
            <Marker position={[cp.lat, cp.lng]} icon={iconBlue}>
              <Popup>
                <strong>{cp.name}</strong><br/>
                Radius: {cp.radius}m
              </Popup>
            </Marker>
            <Circle 
              center={[cp.lat, cp.lng]} 
              radius={cp.radius} 
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1, weight: 1 }} 
            />
          </div>
        ))}

        {/* Render Actual Scans (Green = Verified, Red = Flagged) */}
        {scans.map(scan => (
          <Marker 
            key={`scan-${scan.id}`} 
            position={[scan.lat, scan.lng]} 
            icon={scan.status === 'Verified' ? iconGreen : iconRed}
          >
            <Popup>
              <strong>{scan.reportRef}</strong><br/>
              Status: {scan.status}<br/>
              Personnel: {scan.personnel}<br/>
              Time: {new Date(scan.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
