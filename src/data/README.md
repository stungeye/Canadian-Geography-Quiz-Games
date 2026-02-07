# Data Setup Instructions

1.  **Provinces & Territories**
    -   Download the Cartographic Boundary Files (CBF) from Stats Canada.
    -   Link: [Stats Canada CBF](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/index2021-eng.cfm?year=21)
    -   Format approved: `.shp` (Shapefile) or `GeoJSON`.
    -   Please place the files in a subdirectory here, e.g., `src/data/borders/`.
    -   If you have a `GeoJSON` file directly, name it `canada.json`.

2.  **Cities**
    -   Create a file named `cities.json` in this directory.
    -   Format:
        ```json
        [
          {
            "name": "Ottawa",
            "provinceId": "ON",
            "lat": 45.4215,
            "lng": -75.6972,
            "isCapital": true
          },
          ...
        ]
        ```
