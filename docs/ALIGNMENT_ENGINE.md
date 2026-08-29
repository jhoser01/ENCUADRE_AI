# ENCUADRE — Alignment Score Engine

## Overview

The Alignment Score is calculated **deterministically by code**, never by a language model.

The LLM (Gemini/OpenAI) is used **only** to:
1. Extract 14 visual feature values (0.0–1.0) from portfolio images
2. Generate the textual content of the Visual Brief

The score itself is a pure mathematical function.

---

## Feature Vector

14 visual dimensions, each normalized to [0, 1]:

| Dimension | Spanish Label | Weight | Description |
|-----------|--------------|--------|-------------|
| warmth | Calidez | 1.2 | Warm vs cool color temperature |
| brightness | Luminosidad | 1.5 | Dark vs bright |
| contrast | Contraste | 0.8 | Low vs high contrast |
| saturation | Saturación | 0.7 | Desaturated vs vivid colors |
| naturalLight | Luz natural | 1.3 | Artificial vs natural lighting |
| candidness | Espontaneidad | 1.4 | Posed vs candid/spontaneous |
| posedness | Posado | 1.1 | Casual vs formally posed |
| editorialness | Editorial | 0.9 | Documentary vs editorial style |
| documentaryness | Documental | 1.0 | Editorial vs documentary |
| intimacy | Intimidad | 1.2 | Wide/impersonal vs intimate/close |
| wideComposition | Plano abierto | 0.8 | Close-up vs wide shots |
| retouchLevel | Retoque | 1.6 | Natural vs heavy retouching |
| emotionalIntensity | Intensidad emocional | 1.0 | Neutral vs emotionally intense |
| minimalism | Minimalismo | 0.7 | Busy/complex vs minimal |

**retouchLevel** has the highest weight (1.6) because client-photographer mismatches on this dimension cause the most practical issues.

---

## Algorithm: v1.0.0

### Input
- `styleVector` — mean feature vector of photographer's portfolio (from Style DNA)
- `clientVector` — derived from pairwise choice deltas

### Step 1: Weighted L1 Distance

```
totalWeight = Σ w_i
weightedL1 = Σ (|s_i - c_i| × w_i) / totalWeight
```

Result: value in [0, 1], where 0 = identical, 1 = maximum difference.

### Step 2: Cosine Similarity

```
dotProduct = Σ (s_i × c_i)
magA = √(Σ s_i²)
magB = √(Σ c_i²)
cosine = dotProduct / (magA × magB)
```

Normalized to [0, 1]: `normalizedCosine = (cosine + 1) / 2`

### Step 3: Combined Score

```
score = 100 × [0.60 × (1 - weightedL1) + 0.40 × normalizedCosine]
score = clamp(score, 0, 100)
```

**Rationale for weights:**
- 0.60 × L1: L1 captures absolute differences per dimension, weighted by importance
- 0.40 × cosine: cosine captures directional similarity (overall style alignment)

### Step 4: Classification

| Range | Level | Spanish Label |
|-------|-------|---------------|
| 85–100 | very_high | Alineación muy alta |
| 70–84 | good | Buena alineación |
| 55–69 | medium | Alineación media |
| < 55 | low | Divergencias importantes |

> ⚠️ These bands are MVP heuristics, not scientific claims. Document this to users.

### Step 5: Mismatch Detection

1. Sort all 14 dimensions by `|photographer_value - client_value|` descending
2. Take top 3 as mismatches
3. Generate explanation text in Spanish for each mismatch

---

## Preference Vector Calculation

The client preference vector is derived from pairwise choices:

```
For each choice:
  delta = features(selected) - features(rejected)

clientVector = normalize(Σ delta_i × diversity_weight_i)
```

Where `diversity_weight_i` increases for later choices with more diverse images.

Final vector is clamped to [0, 1] per dimension.

---

## Implementation

See: [`src/server/services/alignment.ts`](../src/server/services/alignment.ts)

Unit tests: [`tests/unit/alignment.test.ts`](../tests/unit/alignment.test.ts)

```bash
npm run test -- alignment.test.ts
```

---

## Future Improvements (Post-MVP)

- Bradley-Terry model for pairwise ranking
- Adaptive weighting based on historical session outcomes
- Per-photography-type weight profiles (wedding vs. editorial)
- Confidence intervals from Bayesian estimation
