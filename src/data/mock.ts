import { Province, City } from '../types';

export const MOCK_CITIES: City[] = [
  {
    name: "Ottawa",
    provinceId: "ON",
    lat: 45.4215,
    lng: -75.6972,
    isCapital: true
  },
  {
    name: "Toronto",
    provinceId: "ON",
    lat: 43.6532,
    lng: -79.3832,
    isCapital: false
  }
];

export const MOCK_PROVINCES_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Ontario",
        "id": "ON"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-95.15625, 41.77131167976407],
            [-74.421875, 41.77131167976407],
            [-74.421875, 56.9449741808516],
            [-95.15625, 56.9449741808516],
            [-95.15625, 41.77131167976407]
          ]
        ]
      }
    }
  ]
};
