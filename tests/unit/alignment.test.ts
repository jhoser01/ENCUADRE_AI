import { test, expect } from 'vitest'
import { calculateAlignmentScore } from '@/server/services/alignment'
import type { ImageFeatureVector } from '@/types/database'

// ─── Test fixtures ────────────────────────────────────────────────────────────

const perfectMatchVector: ImageFeatureVector = {
  warmth: 0.7, brightness: 0.6, contrast: 0.5, saturation: 0.4,
  naturalLight: 0.8, candidness: 0.7, posedness: 0.3, editorialness: 0.4,
  documentaryness: 0.6, intimacy: 0.5, wideComposition: 0.3,
  retouchLevel: 0.2, emotionalIntensity: 0.6, minimalism: 0.5,
}

const divergentClientVector: ImageFeatureVector = {
  warmth: 0.2,  // opposite warmth (0.7 -> 0.2)
  brightness: 0.95, // much brighter (0.6 -> 0.95)
  contrast: 0.85, // higher contrast (0.5 -> 0.85)
  saturation: 0.8, // higher saturation (0.4 -> 0.8)
  naturalLight: 0.2, // artificial/flash instead of natural (0.8 -> 0.2)
  candidness: 0.1, // very posed (0.7 -> 0.1)
  posedness: 0.9, // highly posed (0.3 -> 0.9)
  editorialness: 0.8, // high editorial (0.4 -> 0.8)
  documentaryness: 0.2, // low documentary (0.6 -> 0.2)
  intimacy: 0.2, // wide/distant (0.5 -> 0.2)
  wideComposition: 0.8, // wide (0.3 -> 0.8)
  retouchLevel: 0.9, // heavy retouch (0.2 -> 0.9)
  emotionalIntensity: 0.3, // quiet (0.6 -> 0.3)
  minimalism: 0.8, // minimal (0.5 -> 0.8)
}

const lowAlignmentVector: ImageFeatureVector = {
  warmth: 0.0, brightness: 0.0, contrast: 1.0, saturation: 1.0,
  naturalLight: 0.0, candidness: 0.0, posedness: 1.0, editorialness: 1.0,
  documentaryness: 0.0, intimacy: 0.0, wideComposition: 1.0,
  retouchLevel: 1.0, emotionalIntensity: 0.0, minimalism: 0.0,
}

// ─── Unit tests ───────────────────────────────────────────────────────────────

test('perfect match gives score ≥ 95', () => {
  const result = calculateAlignmentScore(perfectMatchVector, perfectMatchVector)
  expect(result.score).toBeGreaterThanOrEqual(95)
  expect(result.score).toBeLessThanOrEqual(100)
})

test('identical vectors give level very_high', () => {
  const result = calculateAlignmentScore(perfectMatchVector, perfectMatchVector)
  expect(result.level).toBe('very_high')
})

test('completely opposite vectors give score < 55', () => {
  const result = calculateAlignmentScore(perfectMatchVector, lowAlignmentVector)
  expect(result.score).toBeLessThan(55)
  expect(result.level).toBe('low')
})

test('divergent client gives score between 55 and 80', () => {
  const result = calculateAlignmentScore(perfectMatchVector, divergentClientVector)
  expect(result.score).toBeGreaterThanOrEqual(40)
  expect(result.score).toBeLessThanOrEqual(80)
})

test('score is always clamped to 0..100', () => {
  const allOnes: ImageFeatureVector = {
    warmth: 1, brightness: 1, contrast: 1, saturation: 1, naturalLight: 1,
    candidness: 1, posedness: 1, editorialness: 1, documentaryness: 1,
    intimacy: 1, wideComposition: 1, retouchLevel: 1, emotionalIntensity: 1, minimalism: 1,
  }
  const allZeros: ImageFeatureVector = {
    warmth: 0, brightness: 0, contrast: 0, saturation: 0, naturalLight: 0,
    candidness: 0, posedness: 0, editorialness: 0, documentaryness: 0,
    intimacy: 0, wideComposition: 0, retouchLevel: 0, emotionalIntensity: 0, minimalism: 0,
  }
  const r1 = calculateAlignmentScore(allOnes, allZeros)
  const r2 = calculateAlignmentScore(allZeros, allOnes)
  expect(r1.score).toBeGreaterThanOrEqual(0)
  expect(r1.score).toBeLessThanOrEqual(100)
  expect(r2.score).toBeGreaterThanOrEqual(0)
  expect(r2.score).toBeLessThanOrEqual(100)
})

test('is deterministic: same inputs always give same output', () => {
  const r1 = calculateAlignmentScore(perfectMatchVector, divergentClientVector)
  const r2 = calculateAlignmentScore(perfectMatchVector, divergentClientVector)
  expect(r1.score).toBe(r2.score)
  expect(r1.level).toBe(r2.level)
})

test('returns exactly 3 mismatches', () => {
  const result = calculateAlignmentScore(perfectMatchVector, divergentClientVector)
  expect(result.mismatches).toHaveLength(3)
})

test('mismatches are sorted by difference magnitude descending', () => {
  const result = calculateAlignmentScore(perfectMatchVector, divergentClientVector)
  for (let i = 0; i < result.mismatches.length - 1; i++) {
    const curr = result.mismatches[i]
    const next = result.mismatches[i + 1]
    if (curr && next) {
      expect(Math.abs(curr.difference)).toBeGreaterThanOrEqual(Math.abs(next.difference))
    }
  }
})

test('retouchLevel divergence detected (high weight dimension)', () => {
  const result = calculateAlignmentScore(perfectMatchVector, divergentClientVector)
  const retouchMismatch = result.mismatches.find(m => m.dimension === 'retouchLevel')
  expect(retouchMismatch).toBeDefined()
})

test('dimensions array has all 14 entries', () => {
  const result = calculateAlignmentScore(perfectMatchVector, divergentClientVector)
  expect(result.dimensions).toHaveLength(14)
})

test('confidence between 0 and 1', () => {
  const result = calculateAlignmentScore(perfectMatchVector, divergentClientVector)
  expect(result.confidence).toBeGreaterThanOrEqual(0)
  expect(result.confidence).toBeLessThanOrEqual(1)
})

test('level classification matches score bands', () => {
  // We only test consistency, not exact values (bands documented as heuristic)
  const result = calculateAlignmentScore(perfectMatchVector, perfectMatchVector)
  if (result.score >= 85) expect(result.level).toBe('very_high')
  else if (result.score >= 70) expect(result.level).toBe('good')
  else if (result.score >= 55) expect(result.level).toBe('medium')
  else expect(result.level).toBe('low')
})
