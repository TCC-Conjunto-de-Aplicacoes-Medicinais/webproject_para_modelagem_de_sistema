'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// ─── Helper to recenter map ─────────────────────────────

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 16);
  }, [coords, map]);
  return null;
}

// ─── Main Map Component ─────────────────────────────────

interface AddressMapProps {
  coords: [number, number] | null;
}

export default function AddressMap({ coords }: AddressMapProps) {
  // Default center: São Paulo
  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const center = coords || defaultCenter;

  if (!coords) {
    return (
      <Box
        sx={{
          height: 250,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.03)',
          border: '1px dashed',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <LocationOnIcon sx={{ fontSize: 36, color: 'grey.400' }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          O mapa será exibido após preencher o endereço completo
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 250,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
          borderRadius: 'inherit',
        },
      }}
    >
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} />
        <RecenterMap coords={center} />
      </MapContainer>
    </Box>
  );
}
