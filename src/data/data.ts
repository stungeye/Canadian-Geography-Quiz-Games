import { City } from '../types';
import { CONFIG } from '../config';
import citiesData from './cities.json';
import { feature } from 'topojson-client';
import type { Topology, Objects } from 'topojson-specification';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

// --- Types ---

// Define the structure of our TopoJSON objects slightly more specifically if we knew the key names.
// For now, we assume the main object key might be something standard or we find the first one.
interface TopologyObjects extends Objects {
  [key: string]: any; 
}

// --- Data Loading ---

export const CITIES: City[] = citiesData as City[];

// We use a dynamic import to load the heavy border files only when needed
// and to select the resolution based on config.
export async function getProvinces(): Promise<FeatureCollection<Geometry, GeoJsonProperties>> {
  let topology: Topology<TopologyObjects>;

  if (CONFIG.MAP_RESOLUTION === 'medium') {
      // Dynamic import returns a module with a default export usually, or the JSON content directly
      // Vite handles JSON imports by default.
      const module = await import('./borders/provinces_medium.topo.json');
      topology = module.default as unknown as Topology<TopologyObjects>;
  } else {
      const module = await import('./borders/provinces_low.topo.json');
      topology = module.default as unknown as Topology<TopologyObjects>;
  }

  // Convert TopoJSON to GeoJSON
  // We need to find the name of the objects group. Usually it's the filename sans extension or 'provinces'.
  // Let's inspect the keys or try a common one. 
  // If we don't know the key, we can try Object.keys(topology.objects)[0]
  const objectKey = Object.keys(topology.objects)[0];
  
  if (!objectKey) {
    throw new Error('Invalid TopoJSON: No objects found.');
  }

  const geojson = feature(topology, topology.objects[objectKey]) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
  return geojson;
}
