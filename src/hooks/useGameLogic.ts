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

  // --- Refs for current values (to avoid stale closures in callbacks) ---
  const gameStatusRef = useRef(gameStatus);
  const currentQuestionRef = useRef(currentQuestion);
  const foundIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => { gameStatusRef.current = gameStatus; }, [gameStatus]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);

  // --- Feedback ---
  const { triggerSuccess, triggerFailure } = useFeedback();

  // --- Mode 2: Recall State ---
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [activeTarget, setActiveTarget] = useState<City | Province | null>(null);

  // Keep foundIds ref in sync
  useEffect(() => { foundIdsRef.current = foundIds; }, [foundIds]);

  // --- Mode 1 Logic ---
  const generateIdentifyQuestion = useCallback(() => {
    if (!provinces) return;

    // Use ref to get current foundIds (avoids stale closure in setTimeout)
    const currentFoundIds = foundIdsRef.current;

    // Filter out found items
    const provinceFeatures = provinces.features as Feature[];
    const validProvinces = provinceFeatures.filter(f => {
        const props = f.properties || {};
        const name = props.name || props.PRENAME || "Unknown";
        return !currentFoundIds.has(name);
    });

    const validCities = CITIES.filter(c => !currentFoundIds.has(c.Name));

    console.log('generateIdentifyQuestion:', { 
        foundCount: currentFoundIds.size, 
        validProvinces: validProvinces.length, 
        validCities: validCities.length 
    });

    if (validProvinces.length === 0 && validCities.length === 0) {
        setGameStatus('finished');
        setHighlightedId(null);
        setCurrentQuestion(null);
        return;
    }

    // Decide type based on availability
    let isProvince = false;
    if (validProvinces.length > 0 && validCities.length > 0) {
        isProvince = Math.random() > 0.5;
    } else if (validProvinces.length > 0) {
        isProvince = true;
    } else {
        isProvince = false; // Must be cities
    }
    
    if (isProvince) {
      const targetFeature = validProvinces[Math.floor(Math.random() * validProvinces.length)];
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
       const target = validCities[Math.floor(Math.random() * validCities.length)];
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

    // Use ref to get current foundIds (avoids stale closure in setTimeout)
    const currentFoundIds = foundIdsRef.current;

    // Filter out found items
    const provinceFeatures = provinces.features as Feature[];
    const validProvinces = provinceFeatures.filter(f => {
        const props = f.properties || {};
        const name = props.name || props.PRENAME || "Unknown";
        return !currentFoundIds.has(name);
    });

    const validCities = CITIES.filter(c => !currentFoundIds.has(c.Name));

    console.log('generateLocationQuestion:', { 
        foundCount: currentFoundIds.size, 
        validProvinces: validProvinces.length, 
        validCities: validCities.length 
    });

    if (validProvinces.length === 0 && validCities.length === 0) {
        setGameStatus('finished');
        setHighlightedId(null);
        setCurrentQuestion(null);
        return;
    }

    // Decide type based on availability
    let isProvince = false;
    if (validProvinces.length > 0 && validCities.length > 0) {
        isProvince = Math.random() > 0.5;
    } else if (validProvinces.length > 0) {
        isProvince = true;
    } else {
        isProvince = false;
    }

    if (isProvince) {
      const targetFeature = validProvinces[Math.floor(Math.random() * validProvinces.length)];
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
       const target = validCities[Math.floor(Math.random() * validCities.length)];
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
      const status = gameStatusRef.current;
      const question = currentQuestionRef.current;
      
      console.log('handleLocationAnswer called', { mode, status, question, selected });
      if (mode !== 'locate' || !question || status !== 'playing') {
          console.log('handleLocationAnswer early return', { mode, status, hasQuestion: !!question });
          return;
      }

      // Check if already found?
      let selectedName = '';
      if ('type' in selected && selected.type === 'Province') selectedName = selected.name;
      else if ('Name' in selected) selectedName = selected.Name;

      if (foundIdsRef.current.has(selectedName)) return; // Ignore clicks on already found items

      console.log('Mode 3 Check:', { 
        selected, 
        question 
      });

      let isCorrect = false;
      if ('type' in selected && selected.type === 'Province') {
          // Relaxed check: name OR ID match (case-insensitive for name?)
          // Also check PRENAME in case props differ?
          isCorrect = question.type === 'province' && (
              String(selected.id) === String(question.targetId) || 
              selected.name === question.targetName
          );
      } else if ('Name' in selected) {
          isCorrect = question.type === 'city' && selected.Name === question.targetName;
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
          setHighlightedId(question.targetId); 
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

    const normalizedInput = inputName.trim().toLowerCase();
    const normalizedTarget = targetName.trim().toLowerCase();

    if (normalizedInput === normalizedTarget) {
      setFoundIds(prev => new Set(prev).add(targetName));
      setScore(s => s + 1);
      triggerSuccess();
      setActiveTarget(null); 
    } else {
      triggerFailure();
      alert(`Incorrect! You typed "${inputName}". We were looking for "${targetName}".`); 
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
