import { describe, it, expect } from 'vitest';
import { normalizeInput } from './stringUtils';

describe('normalizeInput', () => {
  it('should trim whitespace and lowercase', () => {
    expect(normalizeInput('  Ottawa  ')).toBe('ottawa');
  });

  it('should handle St. John\'s correctly with various quotes', () => {
    const target = "st john's";
    expect(normalizeInput("St. John's")).toBe(target);
    expect(normalizeInput("st. john's")).toBe(target);
    expect(normalizeInput("St. John’s")).toBe(target); // Smart quote u2019
    expect(normalizeInput("st. john’s")).toBe(target); 
    expect(normalizeInput("St John's")).toBe(target); // No period
  });

  it('should handle variations in spacing and punctuation if needed (future proofing)', () => {
    // Current requirement: exact match after normalization
    // If we wanted to ignore periods, we'd add it to normalizeInput.
    // For now, let's just ensure standard behavior.
    expect(normalizeInput("St Johns")).toBe("st johns");
  });

  it('should replace smart double quotes with standard quotes', () => {
    expect(normalizeInput('“Quote”')).toBe('"quote"');
  });

  it('should handle empty input', () => {
    expect(normalizeInput('')).toBe('');
  });
});
