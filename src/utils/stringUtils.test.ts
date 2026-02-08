import { describe, it, expect } from 'vitest';
import { normalizeInput } from './stringUtils';

describe('normalizeInput', () => {
  it('should trim whitespace and lowercase', () => {
    expect(normalizeInput('  Ottawa  ')).toBe('ottawa');
  });

  it('should replace smart single quotes with standard quotes', () => {
    // iPad smart quotes: ’ (u2019)
    expect(normalizeInput("St. John’s")).toBe("st. john's");
    expect(normalizeInput("St. John‘s")).toBe("st. john's");
  });

  it('should replace smart double quotes with standard quotes', () => {
    expect(normalizeInput('“Quote”')).toBe('"quote"');
  });

  it('should handle empty input', () => {
    expect(normalizeInput('')).toBe('');
  });
});
