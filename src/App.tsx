import { useState, useEffect } from 'react';
import { Map, IdentifyMode, RecallMode, LocateMode } from './components';
import { CITIES, getProvinces } from './data/data';
import type { FeatureCollection } from 'geojson';
import { useGameLogic } from './hooks/useGameLogic';

function App() {
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);

  // Hook handles logic only when provinces are loaded and mode is selected
  const { 
    currentQuestion, 
    handleAnswer, 
    handleLocationAnswer,
    gameStatus, 
    highlightedId,
    // Recall
    handleRecallSelect,
    handleRecallSubmit,
    activeTarget,
    onCancelRecall,
    foundIds
  } = useGameLogic({ 
    provinces, 
    mode: gameMode as 'identify' | 'recall' | 'locate' || 'identify' 
  });

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
      <header className="bg-red-600 text-white p-4 shadow-md z-50 relative">
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

      <main className="flex-grow container mx-auto p-4 relative">
        {!gameMode ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Game Mode Selection Cards */}
            <ModeCard 
              title="Identify" 
              description="Learn to identify provinces and capitals."
              onClick={() => setGameMode('identify')}
            />
            {/* ... other cards ... */}
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
          <div className="bg-white rounded-lg shadow-lg p-0 md:p-1 h-[80vh] overflow-hidden relative border border-slate-200">
             {/* Map takes full space of the container */}
             <Map 
                 cities={CITIES} 
                 provinces={provinces}
                 highlightedProvinceId={gameMode === 'identify' ? (highlightedId || undefined) : undefined}
                 foundIds={foundIds}
                 onCityClick={gameMode === 'recall' ? handleRecallSelect : (gameMode === 'locate' ? handleLocationAnswer : undefined)}
                 onProvinceClick={gameMode === 'recall' ? handleRecallSelect : (gameMode === 'locate' ? handleLocationAnswer : undefined)}
             />
             
             {/* Identify Overlay */}
             {gameMode === 'identify' && (
               <IdentifyMode 
                 question={currentQuestion} 
                 onAnswer={handleAnswer} 
                 gameStatus={gameStatus} 
               />
             )}

             {/* Recall Overlay */}
             {gameMode === 'recall' && activeTarget && (
                <RecallMode 
                  target={activeTarget}
                  onSubmit={handleRecallSubmit}
                  onCancel={onCancelRecall}
                />
             )}

             {/* Locate Mode Overlay */}
             {gameMode === 'locate' && (
                <LocateMode 
                   question={currentQuestion}
                   gameStatus={gameStatus}
                />
             )}

             {/* Victory Overlay */}
             {gameStatus === 'finished' && (
               <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                 <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 animate-bounce-in">
                   <div className="text-6xl mb-4">🎉</div>
                   <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 mb-2">
                     Congratulations!
                   </h2>
                   <p className="text-lg text-slate-600 mb-4">
                     You've identified all {foundIds.size} locations!
                   </p>
                   <p className="text-sm text-slate-400 mb-6">
                     You're a Canadian geography expert! 🍁
                   </p>
                   <button 
                     onClick={() => setGameMode(null)}
                     className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                   >
                     Play Again
                   </button>
                 </div>
               </div>
             )}

             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 px-4 rounded-full shadow-md text-sm font-bold text-slate-600 pointer-events-none z-[400]">
                 {gameMode.toUpperCase()} MODE
                 {gameMode !== 'identify' && <span className="ml-2 text-green-600">({foundIds.size} found)</span>}
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
