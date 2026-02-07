import { useState } from 'react';
import { City } from '../types';

interface RecallModeProps {
  target: City | null;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export default function RecallMode({ target, onSubmit, onCancel }: RecallModeProps) {
  const [input, setInput] = useState('');

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(input);
    setInput('');
  };

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4 text-slate-800">Name this City</h3>
        
        {/* Hint (maybe remove later) */}
        <p className="text-sm text-slate-500 mb-4">Located in {target.Prov_Ter}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Type city name..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
