import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, DomEvent } from 'leaflet';
import { Province, City } from '../types';
import type { FeatureCollection } from 'geojson';

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
  provinces: FeatureCollection | null;
  cities?: City[];
  onProvinceClick?: (province: Province) => void;
  onCityClick?: (city: City) => void;
  highlightedProvinceId?: string;
  foundIds?: Set<string>;
}

const CANADA_CENTER: LatLngExpression = [60.10867, -113.64258]; // Approximate center
const ZOOM_LEVEL = 3;

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
          data={provinces} 
          style={(feature) => {
             const props = feature?.properties || {};
             const id = props.id || props.PRUID || props.name;
             const isHighlighted = highlightedProvinceId && (id === highlightedProvinceId || props.name === highlightedProvinceId);
             const isFound = foundIds?.has(props.name);

             // Color logic: Found = Green, Highlighted = Orange (for questions), Default = White
             let fillColor = '#ffffff';
             if (isFound) fillColor = '#86efac'; // Pale green
             else if (isHighlighted) fillColor = '#f97316'; // Orange (Identify Mode Target)
             // Note: Identify mode traditionally uses Red for highlight? User asked for Orange for cities, what about map? 
             // "highlighted city should be different colour... say orange". 
             // "When a province or territory has been properly select it should also turn a pale shade of green."

             return {
               fillColor: fillColor,
               weight: isHighlighted ? 2 : 1,
               opacity: 1,
               color: isHighlighted ? '#c2410c' : '#94a3b8',
               fillOpacity: isHighlighted || isFound ? 0.6 : 0.4
             };
          }}
          onEachFeature={(feature, layer) => {
             const props = feature.properties || {};
             const p: Province = {
                id: props.id || props.PRUID,
                name: props.name,
                type: 'Province', 
             };
             const isFound = foundIds?.has(p.name);
             
             // Only allow click if interaction is enabled AND not already found (unless we want to show info?)
             // User said: "provinces and territories aren't selectable when clicking within a boundary" -> Fixed by adding onProvinceClick logic
             // "green entity is clicked it should simply display a tooltip" (Todo)
             
             if (onProvinceClick && !isFound) {
                // @ts-ignore
                layer._path.style.cursor = 'pointer'; 
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
        
        // Todo: Custom icons for stars vs dots? Leaflet default is blue marker.
        // We can change color via CSS filters or custom icon. 
        // Quick hack: Opacity/Color logic via props isn't enough for Marker color.
        
        return (
        <Marker 
          key={city.Name} 
          position={[city.Latitude, city.Longitude]}
          eventHandlers={{
            click: () => {
                if (!isFound) onCityClick?.(city);
            }
          }}
          opacity={isFound ? 0.8 : (highlightedProvinceId ? (isHighlighted ? 1 : 0.5) : 1)}
        >
          {/* Show name only if completed or if Identify mode reveals it */}
          {(isFound) && <Popup>{city.Name}</Popup>}
        </Marker>
      )})}
    </MapContainer>
  );
}
