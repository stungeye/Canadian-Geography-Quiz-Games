import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { Province, City } from '../types';

// Fix for default marker icon in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  provinces?: any; // Todo: Type GeoJSON FeatureCollection
  cities?: City[];
  onProvinceClick?: (province: Province) => void;
  onCityClick?: (city: City) => void;
  highlightedProvinceId?: string;
}

const CANADA_CENTER: LatLngExpression = [60.10867, -113.64258]; // Approximate center
const ZOOM_LEVEL = 3;

export default function CanadaMap({ provinces, cities, onProvinceClick, onCityClick, highlightedProvinceId }: MapProps) {
  return (
    <MapContainer 
      center={CANADA_CENTER} 
      zoom={ZOOM_LEVEL} 
      style={{ height: '100%', width: '100%', background: '#b9d3c2' }} // Light blue/green background
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Provinces Layer */}
      {provinces && (
        <GeoJSON 
          data={provinces} 
          style={(feature) => {
             const props = feature?.properties || {};
             const id = props.id || props.PRUID || props.name;
             const isHighlighted = highlightedProvinceId && (id === highlightedProvinceId || props.name === highlightedProvinceId);
             
             return {
               fillColor: isHighlighted ? '#ef4444' : '#ffffff',
               weight: isHighlighted ? 3 : 1,
               opacity: 1,
               color: isHighlighted ? '#b91c1c' : '#94a3b8',
               fillOpacity: isHighlighted ? 0.6 : 0.4
             };
          }}
          onEachFeature={(feature, layer) => {
             // For future interaction
             layer.on({
               click: () => {
                 const props = feature.properties || {};
                 const p: Province = {
                    id: props.id || props.PRUID,
                    name: props.name,
                    type: 'Province', 
                 };
                 onProvinceClick?.(p);
               }
             });
          }}
        />
      )}

      {/* Cities Layer */}
      {cities?.map(city => {
        const isHighlighted = highlightedProvinceId === city.Name; // Reusing prop for city name too for now
        
        return (
        <Marker 
          key={city.Name} 
          position={[city.Latitude, city.Longitude]}
          eventHandlers={{
            click: () => onCityClick?.(city)
          }}
          opacity={highlightedProvinceId ? (isHighlighted ? 1 : 0.5) : 1}
        >
          <Popup>{city.Name}</Popup>
        </Marker>
      )})}
    </MapContainer>
  );
}
