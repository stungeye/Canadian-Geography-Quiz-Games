import { useState, useEffect } from 'react';
import Map from './components/Map';
import { CITIES, getProvinces } from './data/data';
import type { FeatureCollection } from 'geojson';

function App() {
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProvinces().then(data => {
      setProvinces(data);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load map data", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Loading Map Data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-red-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🇨🇦 Canadian Geography</h1>
          <nav>
            <button 
              onClick={() => setGameMode(null)}
              className="text-white hover:text-red-100 font-semibold"
            >
              Home
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {!gameMode ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Game Mode Selection Cards */}
            <ModeCard 
              title="Identify" 
              description="Learn to identify provinces and capitals."
              onClick={() => setGameMode('identify')}
            />
            <ModeCard 
              title="Recall" 
              description="Type the names of cities and provinces."
              onClick={() => setGameMode('recall')}
            />
            <ModeCard 
              title="Locate" 
              description="Find locations on the map."
              onClick={() => setGameMode('locate')}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 h-full">
            <h2 className="text-xl font-bold mb-4 capitalize">{gameMode} Mode</h2>
            <div className="h-96 bg-blue-50 flex items-center justify-center border-2 border-dashed border-blue-200 text-blue-400 overflow-hidden relative">
               <Map 
                 cities={CITIES} 
                 provinces={provinces} 
               />
               <div className="absolute top-2 right-2 bg-white/80 p-2 rounded text-xs text-slate-500 pointer-events-none">
                 mode: {gameMode}
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-800 text-slate-300 p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Canadian Geography Learning</p>
      </footer>
    </div>
  );
}

function ModeCard({ title, description, onClick }: { title: string, description: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left border border-slate-200 hover:border-red-300 group"
    >
      <h3 className="text-xl font-bold text-slate-800 group-hover:text-red-600 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </button>
  );
}

export default App;
