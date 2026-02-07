import { useState, useCallback, useEffect } from 'react';
import { CITIES } from '../data/data';
import type { FeatureCollection, Feature } from 'geojson';

type QuestionType = 'province' | 'city';

export interface Question {
  type: QuestionType;
  targetId: string; // Province ID (e.g. 'ON') or City Name ('Ottawa')
  targetName: string; // Display name
  options: string[]; // List of names to choose from
}

interface UseGameLogicProps {
  provinces: FeatureCollection | null;
  mode: 'identify' | 'recall' | 'locate';
  optionCount?: number; // N possibilities
}

export function useGameLogic({ provinces, mode, optionCount = 4 }: UseGameLogicProps) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'correct' | 'incorrect' | 'finished'>('playing');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const generateQuestion = useCallback(() => {
    if (!provinces) return;

    // Random choice: Province or City?
    // Let's bias slightly towards Provinces initially if we want, or pure random.
    const isProvince = Math.random() > 0.5;
    
    if (isProvince) {
      const provinceFeatures = provinces.features as Feature[];
      if (provinceFeatures.length === 0) return;

      const targetFeature = provinceFeatures[Math.floor(Math.random() * provinceFeatures.length)];
      const props = targetFeature.properties || {};
      const targetName = props.name || props.PRENAME || "Unknown"; // Shapefile might have PRENAME
      const targetId = props.id || props.PRUID || targetName; 

      const allNames = provinceFeatures.map(f => f.properties?.name || f.properties?.PRENAME).filter(Boolean);
      // Filter out unique names for options
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
       // City Question
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

  // Initial start
  useEffect(() => {
    if (provinces && !currentQuestion) {
      generateQuestion();
    }
  }, [provinces, currentQuestion, generateQuestion]);

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || gameStatus !== 'playing') return;

    if (answer === currentQuestion.targetName) {
      setGameStatus('correct');
      setScore(s => s + 1);
      setTimeout(() => {
        generateQuestion();
      }, 1500);
    } else {
      setGameStatus('incorrect');
      // Simple logic: Incorrect ends the attempt for this question? 
      // Or lets them retry? "Incorrect selections go to end of queue" applies to Mode 3.
      // Mode 1 spec: "Select the correct one from N possibilities". 
      // Doesn't specify penalty or retry. Let's assume standard quiz style -> show Correct, then next.
      // If we want to implement "Scored immediately", we might just move on.
      // Let's move on after a brief delay so they see they were wrong.
       setTimeout(() => {
        generateQuestion();
      }, 1500);
    }
  };

  return {
    score,
    currentQuestion,
    gameStatus,
    highlightedId,
    handleAnswer,
    nextQuestion: generateQuestion
  };
}

// Helpers
function shuffle(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandomElements(arr: any[], n: number) {
  // Simple random selection
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}
