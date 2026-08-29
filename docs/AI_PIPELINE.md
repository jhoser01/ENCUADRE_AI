# ENCUADRE — AI Pipeline & Feature Extraction

## 1. Pipeline Overview

The multimodal AI layer in ENCUADRE is strictly decoupled from business logic and score calculation:

1. **Input**: A photographer uploads a portfolio image.
2. **Optimization**: Sharp resizes to 1920px max, strips EXIF, and generates a WebP derivative.
3. **Signed URL**: A short-lived signed URL is generated for private image access.
4. **Multimodal Analysis**: Gemini 2.0 Flash extracts 14 visual features normalized between 0.0 and 1.0.
5. **Schema Validation**: The output is strictly parsed and validated with Zod (`imageFeatureVectorSchema`).
6. **Persistence**: Features are stored in `image_features`.
7. **Style DNA**: The statistical mean and spread across the photographer's portfolio are recalculated.

---

## 2. 14 Visual Dimensions

| Attribute | Technical Meaning | Range |
|-----------|-------------------|-------|
| `warmth` | Color temperature (kelvin shift) | 0.0 (cool) - 1.0 (warm) |
| `brightness` | Overall exposure and key levels | 0.0 (low-key) - 1.0 (high-key) |
| `contrast` | Dynamic range / tonal curve | 0.0 (flat) - 1.0 (punchy) |
| `saturation` | Color intensity | 0.0 (muted/BW) - 1.0 (vivid) |
| `naturalLight` | Available ambient light vs flash | 0.0 (artificial/flash) - 1.0 (natural) |
| `candidness` | Spontaneity of captured moment | 0.0 (posed) - 1.0 (candid) |
| `posedness` | Direction and structure in subject pose | 0.0 (unguided) - 1.0 (directed) |
| `editorialness` | Commercial/fashion styling | 0.0 (casual) - 1.0 (editorial) |
| `documentaryness` | Narrative / storytelling focus | 0.0 (aesthetic) - 1.0 (documentary) |
| `intimacy` | Framing closeness and emotional proximity | 0.0 (distant) - 1.0 (close-up) |
| `wideComposition` | Environmental / landscape integration | 0.0 (tight) - 1.0 (wide) |
| `retouchLevel` | Frequency separation / skin smoothing | 0.0 (raw) - 1.0 (polished) |
| `emotionalIntensity` | Expressiveness of subjects | 0.0 (subdued) - 1.0 (intense) |
| `minimalism` | Clutter level in background composition | 0.0 (busy) - 1.0 (minimalist) |

---

## 3. Reliability & Fallbacks

- **Timeout**: 30 seconds per request.
- **Bounded Retry**: 3 attempts with exponential backoff (1s, 2s).
- **Zod Enforced**: Unparseable responses trigger immediate retries.
- **Fallback**: Neutral vector returned if provider is unavailable, ensuring the application never crashes.
