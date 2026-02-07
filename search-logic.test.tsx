import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameLogic } from './src/hooks/useGameLogic';
import type { FeatureCollection } from 'geojson';

// Mock Data
const MOCK_PROVINCES: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Ontario", id: "ON" },
      geometry: { type: "Polygon", coordinates: [] }
    },
    {
      type: "Feature",
      properties: { name: "Quebec", id: "QC" },
      geometry: { type: "Polygon", coordinates: [] }
    }
  ]
};

describe('useGameLogic - Identify Mode', () => {
  it('should generate a question on initialization', () => {
    const { result } = renderHook(() => useGameLogic({ 
      provinces: MOCK_PROVINCES, 
      mode: 'identify' 
    }));

    expect(result.current.currentQuestion).toBeDefined();
    expect(result.current.currentQuestion?.options).toHaveLength(4); // Default is 4
    expect(result.current.gameStatus).toBe('playing');
  });

  it('should handle correct answers', () => {
    const { result } = renderHook(() => useGameLogic({ 
      provinces: MOCK_PROVINCES, 
      mode: 'identify' 
    }));

    const targetName = result.current.currentQuestion!.targetName;

    act(() => {
      result.current.handleAnswer(targetName);
    });

    expect(result.current.gameStatus).toBe('correct');
    // Score updates immediately
    expect(result.current.score).toBe(1);
  });

  it('should handle incorrect answers', () => {
    const { result } = renderHook(() => useGameLogic({ 
      provinces: MOCK_PROVINCES, 
      mode: 'identify' 
    }));

    const targetName = result.current.currentQuestion!.targetName;
    const wrongAnswer = result.current.currentQuestion!.options.find(o => o !== targetName) || "Wrong";

    act(() => {
      result.current.handleAnswer(wrongAnswer);
    });

    expect(result.current.gameStatus).toBe('incorrect');
    expect(result.current.score).toBe(0);
  });
});
