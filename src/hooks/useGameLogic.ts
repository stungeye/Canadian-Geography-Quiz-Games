import { useState, useCallback, useEffect, useRef } from 'react';
import { City, Province } from '../types';
import { CITIES } from '../data/data';
import type { FeatureCollection, Feature } from 'geojson';

// --- Types ---

type QuestionType = 'province' | 'city';

export interface Question {
  type: QuestionType;
  targetId: string; 
  targetName: string; 
  options: string[]; 
}

interface RecallState {
  completedIds: Set<string>; // IDs of cities/provinces correctly named
  currentInput: string;
  targetCity: City | null; // The city currently being asked about (if we do one by one, but spec says "tap each in turn")
  // Actually spec: "User must tap each in turn and type in their name." 
  // So we need to potentialy track which one is tapped.
  activeTarget: City | null;
}

interface UseGameLogicProps {
  provinces: FeatureCollection | null;
  mode: 'identify' | 'recall' | 'locate';
  optionCount?: number; 
}

import { useFeedback } from './useFeedback';

export function useGameLogic({ provinces, mode, optionCount = 4 }: UseGameLogicProps) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'correct' | 'incorrect' | 'finished'>('playing');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // --- Feedback ---
  const { triggerSuccess, triggerFailure } = useFeedback();

  // --- Mode 2: Recall State ---
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [activeTarget, setActiveTarget] = useState<City | Province | null>(null);

  // --- Mode 1 Logic ---
  const generateIdentifyQuestion = useCallback(() => {
    if (!provinces) return;
    const isProvince = Math.random() > 0.5;
    
    if (isProvince) {
      const provinceFeatures = provinces.features as Feature[];
      if (provinceFeatures.length === 0) return;

      const targetFeature = provinceFeatures[Math.floor(Math.random() * provinceFeatures.length)];
      const props = targetFeature.properties || {};
      const targetName = props.name || props.PRENAME || "Unknown"; 
      const targetId = props.id || props.PRUID || targetName; 

      const allNames = provinceFeatures.map(f => f.properties?.name || f.properties?.PRENAME).filter(Boolean);
      const uniqueNames = Array.from(new Set(allNames));
      
      const options = shuffle([
        targetName, 
        ...getRandomElements(uniqueNames.filter(n => n !== targetName), optionCount - 1)
      ]);      

      setCurrentQuestion({
        type: 'province',
        targetId,
        targetName,
        options
      });
      setHighlightedId(targetId);

    } else {
       const target = CITIES[Math.floor(Math.random() * CITIES.length)];
       const allNames = CITIES.map(c => c.Name);
       
       const options = shuffle([
        target.Name, 
        ...getRandomElements(allNames.filter(n => n !== target.Name), optionCount - 1)
       ]);

       setCurrentQuestion({
         type: 'city',
         targetId: target.Name,
         targetName: target.Name,
         options
       });
       setHighlightedId(target.Name);
    }
    setGameStatus('playing');
  }, [provinces, optionCount]);

  // --- Mode 3: Location Logic ---
  const generateLocationQuestion = useCallback(() => {
    if (!provinces) return;
    const isProvince = Math.random() > 0.5;

    if (isProvince) {
      const provinceFeatures = provinces.features as Feature[];
      if (provinceFeatures.length === 0) return;
      // Filter out already found provinces if possible? For now random is fine.
      const targetFeature = provinceFeatures[Math.floor(Math.random() * provinceFeatures.length)];
      const props = targetFeature.properties || {};
      const targetName = props.name || props.PRENAME || "Unknown";
      const targetId = props.id || props.PRUID || targetName; 

      setCurrentQuestion({
        type: 'province',
        targetId,
        targetName,
        options: [] 
      });
    } else {
       const target = CITIES[Math.floor(Math.random() * CITIES.length)];
       setCurrentQuestion({
         type: 'city',
         targetId: target.Name, 
         targetName: target.Name,
         options: [] 
       });
    }
    setGameStatus('playing');
    setHighlightedId(null); 
  }, [provinces]);

  // --- Initializer ---
  useEffect(() => {
    if (provinces && !currentQuestion) {
      if (mode === 'identify') generateIdentifyQuestion();
      if (mode === 'locate') generateLocationQuestion();
    }
    // Reset when mode changes
    if (mode !== gameModeRef.current) {
        if (mode === 'identify') generateIdentifyQuestion();
        if (mode === 'locate') generateLocationQuestion();
        // Reset found state on mode change? Or persist? 
        // User implied "in this mode cities that have already been selected". 
        // Let's reset for now to simulate a fresh game per mode, or keep it if they switch back and forth?
        // Usually games reset.
        setFoundIds(new Set());
        gameModeRef.current = mode;
    }
  }, [provinces, mode, generateIdentifyQuestion, generateLocationQuestion]);

  const gameModeRef = useRef(mode);


  // --- Handlers ---
  const handleIdentifyAnswer = (answer: string) => {
    if (!currentQuestion || gameStatus !== 'playing') return;

    if (answer === currentQuestion.targetName) {
      setGameStatus('correct');
      setScore(s => s + 1);
      // Add to found
      if (currentQuestion.type === 'city') {
          setFoundIds(prev => new Set(prev).add(currentQuestion.targetName));
      } else {
          // For province, targetId might be ID or Name. Let's use Name for consistency in foundIds if possible
          // But Map uses Name to check found status.
          setFoundIds(prev => new Set(prev).add(currentQuestion.targetName));
      }
      
      triggerSuccess();
      setTimeout(() => {
        generateIdentifyQuestion();
      }, 1500);
    } else {
      setGameStatus('incorrect');
      triggerFailure();
       setTimeout(() => {
        generateIdentifyQuestion();
      }, 1500);
    }
  };

  const handleLocationAnswer = (selected: Province | City) => {
      if (mode !== 'locate' || !currentQuestion || gameStatus !== 'playing') return;

      // Check if already found?
      let selectedName = '';
      if ('type' in selected && selected.type === 'Province') selectedName = selected.name;
      else if ('Name' in selected) selectedName = selected.Name;

      if (foundIds.has(selectedName)) return; // Ignor clicks on already found items

      let isCorrect = false;
      if ('type' in selected && selected.type === 'Province') {
          isCorrect = currentQuestion.type === 'province' && (selected.id === currentQuestion.targetId || selected.name === currentQuestion.targetName);
      } else if ('Name' in selected) {
          isCorrect = currentQuestion.type === 'city' && selected.Name === currentQuestion.targetName;
      }

      if (isCorrect) {
          setGameStatus('correct');
          setScore(s => s + 1);
          setFoundIds(prev => new Set(prev).add(selectedName));
          triggerSuccess();
          setTimeout(() => {
            generateLocationQuestion();
          }, 1500);
      } else {
          setGameStatus('incorrect');
          triggerFailure();
          setHighlightedId(currentQuestion.targetId); 
          setTimeout(() => {
             setHighlightedId(null);
             generateLocationQuestion();
          }, 1500);
      }
  }

  const handleRecallSelect = (item: City | Province) => {
    if (mode !== 'recall') return;
    
    // Check if already found
    let name = '';
    if ('type' in item) name = item.name;
    else name = item.Name;

    if (foundIds.has(name)) return;

    setActiveTarget(item);
  };

  const handleRecallSubmit = (inputName: string) => {
    if (!activeTarget) return;

    let targetName = '';
    if ('type' in activeTarget) targetName = activeTarget.name;
    else targetName = activeTarget.Name;

    if (inputName.trim().toLowerCase() === targetName.toLowerCase()) {
      setFoundIds(prev => new Set(prev).add(targetName));
      setScore(s => s + 1);
      triggerSuccess();
      setActiveTarget(null); 
    } else {
      triggerFailure();
      alert(`Incorrect! That was NOT ${inputName}.`); 
    }
  };

  return {
    score,
    currentQuestion,
    gameStatus,
    highlightedId,
    handleAnswer: handleIdentifyAnswer,
    handleLocationAnswer,
    
    // Recall specific
    handleRecallSelect,
    handleRecallSubmit,
    activeTarget,
    foundIds,
    onCancelRecall: () => setActiveTarget(null),
    
    nextQuestion: generateIdentifyQuestion
  };
}

// Helpers
function shuffle(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandomElements(arr: any[], n: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}
