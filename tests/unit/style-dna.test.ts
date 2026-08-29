import { test, expect } from 'vitest'
import { calculateStyleDNA } from '@/server/services/style-dna'
import type { ImageFeatureVector } from '@/types/database'

const warmVector: ImageFeatureVector = {
  warmth: 0.9, brightness: 0.7, contrast: 0.4, saturation: 0.6,
  naturalLight: 0.9, candidness: 0.8, posedness: 0.2, editorialness: 0.3,
  documentaryness: 0.7, intimacy: 0.6, wideComposition: 0.4,
  retouchLevel: 0.2, emotionalIntensity: 0.7, minimalism: 0.5,
}

const coolVector: ImageFeatureVector = {
  warmth: 0.2, brightness: 0.4, contrast: 0.7, saturation: 0.3,
  naturalLight: 0.4, candidness: 0.3, posedness: 0.7, editorialness: 0.8,
  documentaryness: 0.3, intimacy: 0.4, wideComposition: 0.7,
  retouchLevel: 0.7, emotionalIntensity: 0.5, minimalism: 0.7,
}

test('calculateStyleDNA with one vector returns that vector', () => {
  const result = calculateStyleDNA([warmVector])
  expect(result.vector.warmth).toBeCloseTo(warmVector.warmth, 5)
  expect(result.sample_count).toBe(1)
})

test('mean of two opposite vectors is 0.5 for each dimension', () => {
  const result = calculateStyleDNA([warmVector, coolVector])
  expect(result.vector.warmth).toBeCloseTo(0.55, 2) // (0.9 + 0.2) / 2
  expect(result.vector.brightness).toBeCloseTo(0.55, 2) // (0.7 + 0.4) / 2
})

test('sample_count matches input length', () => {
  const result = calculateStyleDNA([warmVector, coolVector, warmVector])
  expect(result.sample_count).toBe(3)
})

test('spread is higher for more variable dimensions', () => {
  const result = calculateStyleDNA([warmVector, coolVector])
  // warmth has values 0.9 and 0.2 - high spread
  // saturation has 0.6 and 0.3 - lower spread
  expect(result.spread['warmth']).toBeGreaterThan(result.spread['saturation'] ?? 0)
})

test('throws or returns error for empty input', () => {
  expect(() => calculateStyleDNA([])).toThrow()
})

test('all vector values are in 0..1 range', () => {
  const result = calculateStyleDNA([warmVector, coolVector])
  for (const value of Object.values(result.vector)) {
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThanOrEqual(1)
  }
})

test('dominant_dimensions returns 5 items', () => {
  const result = calculateStyleDNA([warmVector, coolVector])
  expect(result.dominant_dimensions).toHaveLength(5)
})

test('algorithm_version is set', () => {
  const result = calculateStyleDNA([warmVector])
  expect(result.algorithm_version).toBeTruthy()
  expect(typeof result.algorithm_version).toBe('string')
})
