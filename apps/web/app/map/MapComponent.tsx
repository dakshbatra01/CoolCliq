'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix for default Leaflet icon not loading in Next.js
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  activeUserCount: number;
}

export default function MapComponent({ venues, userLat, userLng }: { venues: Venue[], userLat: number, userLng: number }) {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={[userLat, userLng]} 
        zoom={14} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        {/* Dark theme map tiles from CartoDB */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* User location marker (Blue dot) */}
        <Marker position={[userLat, userLng]} icon={new Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Venue markers (Violet dots) */}
        {venues.map(venue => (
          <Marker 
            key={venue.id} 
            position={[venue.lat, venue.lng]}
            icon={new Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>
              <div className="text-[#13131F] font-medium">
                <p className="font-bold mb-1">{venue.name}</p>
                <p className="text-xs">{venue.activeUserCount} people active here</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
