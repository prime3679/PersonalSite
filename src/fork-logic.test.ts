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
  it('R0 returns the flat reading exclusively when all marks are within epsilon', () => {
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

  it('R1 names different clear pull and sting winners without choosing for the visitor', () => {
    expect(readMap(state())[0]).toBe(
      'take the offer pulls hardest today. start over would sting most to lose at ten years. those are two different futures.',
    );
  });

  it('R2 names one future when clear want and mourning match', () => {
    const observations = readMap(state({
      marks: [
        { pull: 94, sting: 95, reversibility: 'ink' },
        { pull: 40, sting: 55, reversibility: 'pencil' },
        { pull: 30, sting: 45, reversibility: 'pencil' },
      ],
    }));

    expect(observations[0]).toBe(
      'want and mourning point at the same future. whatever keeps you standing at this fork, it is not on this map.',
    );
  });

  it('R3 names a clear pull winner written in ink', () => {
    expect(readMap(state({
      marks: [
        { pull: 90, sting: 50, reversibility: 'ink' },
        { pull: 70, sting: 54, reversibility: 'pencil' },
        { pull: 68, sting: 57, reversibility: 'pencil' },
      ],
    }))).toEqual([
      'stay put pulls hardest, and it is the one you cannot walk back.',
    ]);
  });

  it('R4 names a clear sting winner written in pencil', () => {
    expect(readMap(state({
      marks: [
        { pull: 50, sting: 50, reversibility: 'ink' },
        { pull: 56, sting: 90, reversibility: 'pencil' },
        { pull: 58, sting: 52, reversibility: 'ink' },
      ],
    }))[0]).toBe(
      'take the offer would sting most to lose, and it is written in pencil. it is a future you could test and still return from.',
    );
  });

  it('R5 names the only ink branch when it is both minimum pull and minimum sting', () => {
    expect(readMap(state({
      marks: [
        { pull: 30, sting: 30, reversibility: 'ink' },
        { pull: 36, sting: 37, reversibility: 'pencil' },
        { pull: 39, sting: 35, reversibility: 'pencil' },
      ],
    }))).toEqual([
      'stay put is the only branch in ink, and the one you would miss least.',
    ]);
  });

  it('R6 names all-pencil permanence', () => {
    expect(readMap(state({
      marks: [
        { pull: 30, sting: 30, reversibility: 'pencil' },
        { pull: 36, sting: 35, reversibility: 'pencil' },
        { pull: 39, sting: 37, reversibility: 'pencil' },
      ],
    }))).toEqual([
      'all three are in pencil. whatever this decision costs, it is not permanence.',
    ]);
  });

  it('R7 names all-ink permanence', () => {
    expect(readMap(state({
      marks: [
        { pull: 30, sting: 30, reversibility: 'ink' },
        { pull: 36, sting: 35, reversibility: 'ink' },
        { pull: 39, sting: 37, reversibility: 'ink' },
      ],
    }))).toEqual([
      'all three are in ink. standing still is starting to look like a fourth branch.',
    ]);
  });

  it('R8 names top pull ambiguity when ten-year sting separates it', () => {
    expect(readMap(state({
      marks: [
        { pull: 80, sting: 20, reversibility: 'pencil' },
        { pull: 76, sting: 70, reversibility: 'ink' },
        { pull: 20, sting: 30, reversibility: 'pencil' },
      ],
    }))).toEqual([
      'today cannot tell stay put from take the offer. ten years from now can.',
    ]);
  });

  it('priority and cap keep only the first two matching readings', () => {
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

  it('exact epsilon boundaries do not create clear winners', () => {
    const observations = readMap(state({
      marks: [
        { pull: 58, sting: 30, reversibility: 'pencil' },
        { pull: 50, sting: 36, reversibility: 'ink' },
        { pull: 0, sting: 28, reversibility: 'pencil' },
      ],
    }));

    expect(observations).toEqual([
      'the marks do not point to one answer. that is the map, not a failure of it.',
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

  it('produces deterministic readings and geometry', () => {
    const input = state({
      marks: [
        { pull: 90, sting: 10, reversibility: 'ink' },
        { pull: 10, sting: 90, reversibility: 'pencil' },
        { pull: 40, sting: 40, reversibility: 'pencil' },
      ],
    });
    const firstGeometry = mapGeometry(input);
    const secondGeometry = mapGeometry(input);

    expect(readMap(input)).toEqual(readMap(input));
    expect(firstGeometry.entries.map((entry) => entry.path)).toEqual(secondGeometry.entries.map((entry) => entry.path));
    expect(firstGeometry.crossing).not.toBeNull();
  });
});
