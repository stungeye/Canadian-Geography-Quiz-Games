import { Question } from "../hooks/useGameLogic";

interface IdentifyModeProps {
  question: Question | null;
  onAnswer: (answer: string) => void;
  gameStatus: 'playing' | 'correct' | 'incorrect' | 'finished';
}

export default function IdentifyMode({ question, onAnswer, gameStatus }: IdentifyModeProps) {
  if (!question) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm sm:max-w-md md:max-w-lg z-[1000]">
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-100/50">
        <h3 className="text-center text-lg font-bold text-slate-700 mb-6">
          {question.type === 'province' ? 'Which province/territory is highlighted?' : 'Which city is highlighted?'}
        </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option: string) => (
          <button
            key={option}
            onClick={() => onAnswer(option)}
            disabled={gameStatus !== 'playing'}
            className={`
              p-4 rounded-lg text-sm font-bold transition-all transform active:scale-95
              ${gameStatus === 'playing' 
                ? 'bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700' 
                : option === question.targetName 
                  ? 'bg-green-500 text-white shadow-green-200'
                  : 'bg-slate-100 text-slate-400 opacity-50'
              }
              ${gameStatus === 'incorrect' && 'grayscale'} 
            `}
          >
            {option}
          </button>
        ))}
      </div>
      
      {gameStatus === 'correct' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-bold animate-bounce">
          Correct! 🎉
        </div>
      )}
      
      {gameStatus === 'incorrect' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg font-bold animate-shake">
          Try Again! ❌
        </div>
      )}
      </div>
    </div>
  );
}
