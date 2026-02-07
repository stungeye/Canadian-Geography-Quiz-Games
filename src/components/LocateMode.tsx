import { Question } from '../hooks/useGameLogic';

interface LocateModeProps {
  question: Question | null;
  gameStatus: string;
}

export default function LocateMode({ question, gameStatus }: LocateModeProps) {
  if (!question) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
      <div className={`
        bg-white/95 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl border-2
        transition-all duration-300 transform
        ${gameStatus === 'correct' ? 'border-green-500 scale-110 bg-green-50' : 
          gameStatus === 'incorrect' ? 'border-red-500 shake bg-red-50' : 'border-slate-100'}
      `}>
        <h3 className="text-center text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
          Where is...
        </h3>
        <p className="text-center text-3xl font-black text-slate-800">
          {question.targetName}
        </p>
      </div>
    </div>
  );
}
