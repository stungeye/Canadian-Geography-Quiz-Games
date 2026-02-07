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
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [activeTarget, setActiveTarget] = useState<City | null>(null);

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
      const targetFeature = provinceFeatures[Math.floor(Math.random() * provinceFeatures.length)];
      const props = targetFeature.properties || {};
      const targetName = props.name || props.PRENAME || "Unknown";
      const targetId = props.id || props.PRUID || targetName; 

      setCurrentQuestion({
        type: 'province',
        targetId,
        targetName,
        options: [] // No options needed for location mode
      });
    } else {
       const target = CITIES[Math.floor(Math.random() * CITIES.length)];
       setCurrentQuestion({
         type: 'city',
         targetId: target.Name, // Using Name as ID for cities
         targetName: target.Name,
         options: [] 
       });
    }
    setGameStatus('playing');
    setHighlightedId(null); // No highlighting in location mode!
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
        gameModeRef.current = mode;
    }
  }, [provinces, mode, generateIdentifyQuestion, generateLocationQuestion]);

  // Use ref to track mode changes to trigger regen
  const gameModeRef = useRef(mode);


  // --- Handlers ---
  const handleIdentifyAnswer = (answer: string) => {
    if (!currentQuestion || gameStatus !== 'playing') return;

    if (answer === currentQuestion.targetName) {
      setGameStatus('correct');
      setScore(s => s + 1);
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

      let isCorrect = false;
      if ('type' in selected && selected.type === 'Province') {
          // It's a province
          // Check ID or Name
          isCorrect = currentQuestion.type === 'province' && (selected.id === currentQuestion.targetId || selected.name === currentQuestion.targetName);
      } else if ('Name' in selected) {
          // It's a city
          isCorrect = currentQuestion.type === 'city' && selected.Name === currentQuestion.targetName;
      }

      if (isCorrect) {
          setGameStatus('correct');
          setScore(s => s + 1);
          triggerSuccess();
          setTimeout(() => {
            generateLocationQuestion();
          }, 1500);
      } else {
          setGameStatus('incorrect');
          triggerFailure();
          // Maybe highlight the correct one momentarily? 
          setHighlightedId(currentQuestion.targetId); 
          setTimeout(() => {
             setHighlightedId(null);
             generateLocationQuestion();
          }, 1500);
      }
  }

  const handleRecallSelect = (city: City) => {
    // In Recall mode, user clicks a city marker
    if (mode === 'recall') {
       setActiveTarget(city);
    }
  };
   
  // ... recall submit ...

  const handleRecallSubmit = (inputName: string) => {
    if (!activeTarget) return;

    // Fuzzy match or exact? Spec says "type in their name". 
    // Let's do case-insensitive exact match for now.
    if (inputName.trim().toLowerCase() === activeTarget.Name.toLowerCase()) {
      setCompletedIds(prev => new Set(prev).add(activeTarget.Name));
      setScore(s => s + 1);
      triggerSuccess();
      setActiveTarget(null); // Close dialog
      // If all done? Check length.
    } else {
      // Incorrect logic: "shown corrections for which they got incorrect"
      // Maybe shake input?
      triggerFailure();
      alert(`Incorrect! That was NOT ${inputName}.`); // Temporary feedback
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
    completedIds,
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
