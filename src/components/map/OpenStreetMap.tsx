'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  companyName?: string;
  onLocationChange?: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
  className?: string;
}

interface MapControllerProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

function MapController({ latitude, longitude, onLocationChange }: MapControllerProps) {
  const map = useMap();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);

  useEffect(() => {
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);
    const handleMoveEnd = () => {
      if (isDragging && onLocationChange) {
        const center = map.getCenter();
        onLocationChange(center.lat, center.lng);
      }
    };

    map.on('dragstart', handleDragStart);
    map.on('dragend', handleDragEnd);
    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('dragstart', handleDragStart);
      map.off('dragend', handleDragEnd);
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onLocationChange, isDragging]);

  return null;
}

export default function OpenStreetMap({
  latitude = 13.7563,
  longitude = 100.5018,
  address,
  companyName,
  onLocationChange,
  height = '400px',
  zoom = 13,
  className = ''
}: MapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([latitude, longitude]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setMapCenter([latitude, longitude]);
  }, [latitude, longitude]);

  const handleLocationChange = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };

  if (!isClient) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={mapCenter}>
          <Popup>
            <div className="p-2">
              {companyName && (
                <h3 className="font-bold text-lg mb-2">{companyName}</h3>
              )}
              {address && (
                <p className="text-sm text-gray-600 mb-2">{address}</p>
              )}
              <p className="text-xs text-gray-500">
                ละติจูด: {mapCenter[0].toFixed(6)}<br />
                ลองจิจูด: {mapCenter[1].toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>

        <MapController
          latitude={mapCenter[0]}
          longitude={mapCenter[1]}
          onLocationChange={handleLocationChange}
        />
      </MapContainer>
    </div>
  );
}

// Geocoding function to convert address to coordinates
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=th`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Reverse geocoding function to convert coordinates to address
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
