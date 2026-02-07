# 🍁 Canadian Geography Quiz

An interactive web application for learning Canadian geography through three engaging game modes. Test your knowledge of provinces, territories, and major cities across Canada!

## 🎮 Game Modes

### Mode 1: Identify
- **Objective**: Identify highlighted provinces/territories or cities by selecting from multiple choice options
- **Visual Feedback**: Target locations are highlighted in **orange**
- **Progression**: Correctly identified locations turn **green** and won't appear again

### Mode 2: Recall
- **Objective**: Click on map markers and type the correct name
- **Interaction**: Click any city marker or province/territory boundary to begin
- **Validation**: Case-insensitive name matching

### Mode 3: Locate
- **Objective**: Find and click the location based on the given name
- **Challenge**: No visual hints - pure geography knowledge!
- **Feedback**: Incorrect guesses briefly highlight the correct location

## ✨ Features

- **Interactive Map**: Built with React-Leaflet and OpenStreetMap tiles
- **Visual Feedback**: 
  - Orange highlights for current questions
  - Green coloring for correctly identified locations
  - Custom SVG map pins (blue/orange/green)
- **Audio & Visual Celebrations**:
  - Success tones and confetti for correct answers
  - Epic "ta-da" fanfare with massive confetti burst upon completion
- **Smart Question Generation**: Already-found locations are excluded from future questions
- **Responsive Design**: Works on desktop and tablet devices
- **Victory Screen**: Congratulatory message when all locations are identified

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS 4
- **Mapping**: React-Leaflet + Leaflet
- **Geospatial Data**: TopoJSON (Canadian provinces/territories boundaries)
- **Animations**: Framer Motion + canvas-confetti
- **Audio**: Web Audio API (synthesized tones)
- **Language**: TypeScript

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Netlify

**Build Settings:**
- **Base directory**: (leave blank)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables**: None required

### Alternative: netlify.toml

Create a `netlify.toml` file in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 📁 Project Structure

```
mapper/
├── src/
│   ├── components/       # React components (Map, game modes)
│   ├── hooks/           # Custom hooks (game logic, feedback)
│   ├── data/            # GeoJSON/TopoJSON files and city data
│   ├── types.ts         # TypeScript type definitions
│   └── App.tsx          # Main application component
├── public/              # Static assets
└── dist/                # Production build output
```

## 🎯 Game Data

- **Provinces/Territories**: 13 total (10 provinces + 3 territories)
- **Cities**: Major Canadian cities with coordinates
- **Map Data**: Cartographic boundary files from Statistics Canada (converted to TopoJSON)

## 🎨 Design Highlights

- Modern, clean UI with glassmorphism effects
- Gradient accents and smooth transitions
- Accessible color scheme with clear visual hierarchy
- Mobile-friendly responsive layout

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Map data: Statistics Canada
- Base map tiles: OpenStreetMap contributors + CARTO
- Icons: Lucide React
