import { describe, expect, it } from 'vitest';
// @ts-ignore public browser module has no TypeScript declarations.
import { mapGeometry, normalizeState, readMap } from '../public/lab/fork/fork-logic.js';

function state(overrides = {}) {
  return normalizeState({
    decision: 'choose a door',
    futures: ['stay put', 'take the offer', 'start over'],
    marks: [
      { pull: 20, sting: 20, reversibility: 'pencil', pullSet: true, stingSet: true },
      { pull: 60, sting: 45, reversibility: 'ink', pullSet: true, stingSet: true },
      { pull: 40, sting: 90, reversibility: 'pencil', pullSet: true, stingSet: true },
    ],
    ...overrides,
  });
}

describe('fork reading engine', () => {
  it('returns the flat reading exclusively when all marks are within epsilon', () => {
    const observations = readMap(state({
      marks: [
        { pull: 48, sting: 49, reversibility: 'ink' },
        { pull: 52, sting: 51, reversibility: 'ink' },
        { pull: 50, sting: 50, reversibility: 'ink' },
      ],
    }));

    expect(observations).toEqual([
      'the map came out flat. either these futures are truly even, or the fork you are standing at is not the one you wrote down.',
    ]);
  });

  it('names different clear pull and sting winners without choosing for the visitor', () => {
    expect(readMap(state())[0]).toBe(
      'take the offer pulls hardest today. start over would sting most to lose at ten years. those are two different futures.',
    );
  });

  it('caps readings at two observations in priority order', () => {
    const observations = readMap(state({
      marks: [
        { pull: 12, sting: 20, reversibility: 'pencil' },
        { pull: 92, sting: 50, reversibility: 'ink' },
        { pull: 40, sting: 94, reversibility: 'pencil' },
      ],
    }));

    expect(observations).toEqual([
      'take the offer pulls hardest today. start over would sting most to lose at ten years. those are two different futures.',
      'start over would sting most to lose, and it is written in pencil. it is a future you could test and still return from.',
    ]);
  });

  it('uses the truthful fallback when no reading rule fires', () => {
    const observations = readMap(state({
      marks: [
        { pull: 50, sting: 50, reversibility: 'pencil' },
        { pull: 55, sting: 62, reversibility: 'ink' },
        { pull: 62, sting: 55, reversibility: 'pencil' },
      ],
    }));

    expect(observations).toEqual([
      'the marks do not point to one answer. that is the map, not a failure of it.',
    ]);
  });

  it('detects one crossing when branch order swaps between axes', () => {
    const geometry = mapGeometry(state({
      marks: [
        { pull: 90, sting: 10, reversibility: 'ink' },
        { pull: 10, sting: 90, reversibility: 'pencil' },
        { pull: 40, sting: 40, reversibility: 'pencil' },
      ],
    }));

    expect(geometry.crossing).not.toBeNull();
  });
});
