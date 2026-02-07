import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, DomEvent } from 'leaflet';
import { Province, City } from '../types';
import type { FeatureCollection } from 'geojson';
import L from 'leaflet';


interface MapProps {
  provinces: FeatureCollection | null;
  cities?: City[];
  onProvinceClick?: (province: Province) => void;
  onCityClick?: (city: City) => void;
  highlightedProvinceId?: string;
  foundIds?: Set<string>;
}

const CANADA_CENTER: LatLngExpression = [60.10867, -113.64258]; // Approximate center
const ZOOM_LEVEL = 3;

// --- Custom Icons ---
// Simple SVG pin
const PinIcon = ({ color }: { color: string }) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 drop-shadow-md">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
`;

const DefaultIcon = L.divIcon({
  className: 'custom-pin-icon',
  html: PinIcon({ color: '#3b82f6' }), // Blue-500
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const HighlightIcon = L.divIcon({
  className: 'custom-pin-icon',
  html: PinIcon({ color: '#f97316' }), // Orange-500
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const FoundIcon = L.divIcon({
  className: 'custom-pin-icon',
  html: PinIcon({ color: '#22c55e' }), // Green-500
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});


export default function CanadaMap({ provinces, cities, onProvinceClick, onCityClick, highlightedProvinceId, foundIds }: MapProps) {
  return (
    <MapContainer 
      center={CANADA_CENTER} 
      zoom={ZOOM_LEVEL} 
      style={{ height: '100%', width: '100%', background: '#b9d3c2' }} // Light blue/green background
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />
      
      {/* Provinces Layer */}
      {provinces && (
        <GeoJSON 
          key={`provinces-${foundIds?.size || 0}-${highlightedProvinceId || 'none'}`}
          data={provinces} 
          style={(feature) => {
             const props = feature?.properties || {};
             const id = props.id || props.PRUID || props.name;
             const name = props.name || props.PRENAME || "Unknown";
             const isHighlighted = highlightedProvinceId && (id === highlightedProvinceId || name === highlightedProvinceId);
             const isFound = foundIds?.has(name);

             // Color logic: Found = Green, Highlighted = Orange (for questions), Default = White
             let fillColor = '#ffffff';
             if (isFound) fillColor = '#86efac'; // Pale green
             else if (isHighlighted) fillColor = '#f97316'; // Orange (Identify Mode Target)
             
             return {
               fillColor: fillColor,
               weight: isHighlighted ? 2 : 1,
               opacity: 1,
               color: isHighlighted ? '#c2410c' : '#94a3b8',
               fillOpacity: isHighlighted || isFound ? 0.6 : 0.4,
               className: (onProvinceClick && !isFound) ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''
             };
          }}
          onEachFeature={(feature, layer) => {
             const props = feature.properties || {};
             const p: Province = {
                id: props.id || props.PRUID,
                name: props.name || props.PRENAME || "Unknown",
                type: 'Province', 
             };
             const isFound = foundIds?.has(p.name);
             
             if (onProvinceClick && !isFound) {
                layer.on({
                  click: (e) => {
                    DomEvent.stopPropagation(e); // Prevent map click?
                    onProvinceClick(p);
                  }
                });
             } else if (isFound) {
                 layer.bindTooltip(p.name); // Simple tooltip for found items
             }
          }}
        />
      )}

      {/* Cities Layer */}
      {cities?.map(city => {
        const isHighlighted = highlightedProvinceId === city.Name; 
        const isFound = foundIds?.has(city.Name);
        
        // Determine icon based on state
        let icon = DefaultIcon;
        if (isFound) icon = FoundIcon;
        else if (isHighlighted) icon = HighlightIcon;
        // else if (highlightedProvinceId) icon = FadedIcon? No, just keep default opacity logic.

        return (
        <Marker 
          key={city.Name} 
          position={[city.Latitude, city.Longitude]}
          icon={icon}
          eventHandlers={{
            click: () => {
                if (!isFound) onCityClick?.(city);
            }
          }}
          opacity={isFound ? 1 : (highlightedProvinceId ? (isHighlighted ? 1 : 0.4) : 1)}
        >
          {/* Show name only if completed or if Identify mode reveals it */}
          {(isFound) && <Popup>{city.Name}</Popup>}
        </Marker>
      )})}
    </MapContainer>
  );
}
