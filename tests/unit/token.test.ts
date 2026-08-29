import { test, expect } from 'vitest'
import { generateClientToken, hashToken, verifyToken, buildSessionUrl } from '@/lib/security/token'

test('generateClientToken returns a 32-char hex string (128-bit)', () => {
  const token = generateClientToken()
  expect(token).toHaveLength(32)
  expect(token).toMatch(/^[0-9a-f]+$/)
})

test('two generated tokens are never identical', () => {
  const t1 = generateClientToken()
  const t2 = generateClientToken()
  expect(t1).not.toBe(t2)
})

test('hashToken produces a 64-char SHA-256 hex string', async () => {
  const token = generateClientToken()
  const hash = await hashToken(token)
  expect(hash).toHaveLength(64)
  expect(hash).toMatch(/^[0-9a-f]+$/)
})

test('hashToken is deterministic for the same input', async () => {
  const token = 'test-token-12345678'
  const h1 = await hashToken(token)
  const h2 = await hashToken(token)
  expect(h1).toBe(h2)
})

test('different tokens produce different hashes', async () => {
  const t1 = generateClientToken()
  const t2 = generateClientToken()
  const h1 = await hashToken(t1)
  const h2 = await hashToken(t2)
  expect(h1).not.toBe(h2)
})

test('verifyToken returns true for matching token and hash', async () => {
  const token = generateClientToken()
  const hash = await hashToken(token)
  const isValid = await verifyToken(token, hash)
  expect(isValid).toBe(true)
})

test('verifyToken returns false for wrong token', async () => {
  const token = generateClientToken()
  const wrongToken = generateClientToken()
  const hash = await hashToken(token)
  const isValid = await verifyToken(wrongToken, hash)
  expect(isValid).toBe(false)
})

test('buildSessionUrl constructs correct URL', () => {
  const token = 'abc123def456789012345678'
  const url = buildSessionUrl('https://encuadre.app', token)
  expect(url).toBe('https://encuadre.app/s/abc123def456789012345678')
})
