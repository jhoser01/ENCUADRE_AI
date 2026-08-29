/**
 * alignment.ts
 * Deterministic Alignment Score calculation engine.
 * Pure mathematical code — NO language model is involved in computing the score.
 * Version: v1.0.0
 */

import type {
  ImageFeatureVector,
  AlignmentDimension,
  AlignmentMismatch,
} from '@/types/database';

export const ALGORITHM_VERSION = 'v1.0.0';

/**
 * Weights assigned to each of the 14 visual dimensions.
 * Higher weight = more critical dimension for creative/practical alignment.
 * RetouchLevel has the highest weight (1.6) as mismatch causes significant friction.
 */
export const DIMENSION_WEIGHTS: Record<keyof ImageFeatureVector, number> = {
  retouchLevel:       1.6,
  brightness:         1.5,
  candidness:         1.4,
  naturalLight:       1.3,
  warmth:             1.2,
  intimacy:           1.2,
  posedness:          1.1,
  emotionalIntensity: 1.0,
  documentaryness:    1.0,
  editorialness:      0.9,
  contrast:           0.8,
  wideComposition:    0.8,
  saturation:         0.7,
  minimalism:         0.7,
};

export const DIMENSION_LABELS_ES: Record<keyof ImageFeatureVector, string> = {
  warmth:             'Calidez de color',
  brightness:         'Luminosidad / Exposición',
  contrast:           'Nivel de contraste',
  saturation:         'Saturación de color',
  naturalLight:       'Preferencia por luz natural',
  candidness:         'Espontaneidad en tomas',
  posedness:          'Retratos posados',
  editorialness:      'Estilo editorial / moda',
  documentaryness:    'Estilo documental / narrativo',
  intimacy:           'Intimidad / cercanía',
  wideComposition:    'Planos abiertos / contexto',
  retouchLevel:       'Nivel de retoque y pulido',
  emotionalIntensity: 'Intensidad emocional',
  minimalism:         'Composición minimalista',
};

export type AlignmentLevel = 'very_high' | 'good' | 'medium' | 'low';

export interface AlignmentCalculationResult {
  score: number;
  level: AlignmentLevel;
  dimensions: AlignmentDimension[];
  mismatches: AlignmentMismatch[];
  matches: AlignmentMismatch[];
  confidence: number;
  explanation: string;
  algorithm_version: string;
}

/**
 * Pure function: calculates the deterministic alignment score between
 * photographer style DNA and client preference vector.
 */
export function calculateAlignmentScore(
  styleVector: ImageFeatureVector,
  clientVector: ImageFeatureVector,
  sampleConfidence = 0.95
): AlignmentCalculationResult {
  const keys = Object.keys(DIMENSION_WEIGHTS) as Array<keyof ImageFeatureVector>;

  let weightedDiffSum = 0;
  let totalWeight = 0;
  let dotProduct = 0;
  let normStyleSq = 0;
  let normClientSq = 0;

  const dimensions: AlignmentDimension[] = [];
  const differences: Array<{
    dimension: keyof ImageFeatureVector;
    photographerValue: number;
    clientValue: number;
    difference: number;
    absDiff: number;
    weightedDiff: number;
  }> = [];

  for (const key of keys) {
    const s = Math.max(0, Math.min(1, styleVector[key] ?? 0.5));
    const c = Math.max(0, Math.min(1, clientVector[key] ?? 0.5));
    const diff = c - s;
    const absDiff = Math.abs(diff);
    const w = DIMENSION_WEIGHTS[key];

    weightedDiffSum += absDiff * w;
    totalWeight += w;

    dotProduct += s * c;
    normStyleSq += s * s;
    normClientSq += c * c;

    dimensions.push({
      key,
      photographerValue: Math.round(s * 100) / 100,
      clientValue: Math.round(c * 100) / 100,
      difference: Math.round(diff * 100) / 100,
      weight: w,
    });

    differences.push({
      dimension: key,
      photographerValue: s,
      clientValue: c,
      difference: diff,
      absDiff,
      weightedDiff: absDiff * w,
    });
  }

  // 1. Weighted L1 distance normalized in [0, 1]
  const weightedL1 = totalWeight > 0 ? weightedDiffSum / totalWeight : 0;

  // 2. Cosine similarity normalized in [0, 1]
  const normStyle = Math.sqrt(normStyleSq);
  const normClient = Math.sqrt(normClientSq);
  let normalizedCosine = 1;
  if (normStyle > 0 && normClient > 0) {
    const cosine = dotProduct / (normStyle * normClient);
    normalizedCosine = Math.max(0, Math.min(1, (cosine + 1) / 2));
  }

  // 3. Combined score formula: 60% Weighted L1 + 40% Cosine
  const rawScore = 100 * (0.60 * (1 - weightedL1) + 0.40 * normalizedCosine);
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  // 4. Determine UX alignment level
  let level: AlignmentLevel;
  if (score >= 85) level = 'very_high';
  else if (score >= 70) level = 'good';
  else if (score >= 55) level = 'medium';
  else level = 'low';

  // 5. Sort by weighted difference for mismatches vs matches
  differences.sort((a, b) => b.weightedDiff - a.weightedDiff);

  const topMismatches = differences.slice(0, 3).map((item) => ({
    dimension: item.dimension,
    photographerValue: Math.round(item.photographerValue * 100) / 100,
    clientValue: Math.round(item.clientValue * 100) / 100,
    difference: Math.round(item.difference * 100) / 100,
    explanation: getMismatchExplanation(item.dimension, item.photographerValue, item.clientValue),
  }));

  // Matches: lowest differences
  differences.sort((a, b) => a.absDiff - b.absDiff);
  const topMatches = differences.slice(0, 3).map((item) => ({
    dimension: item.dimension,
    photographerValue: Math.round(item.photographerValue * 100) / 100,
    clientValue: Math.round(item.clientValue * 100) / 100,
    difference: Math.round(item.difference * 100) / 100,
    explanation: getMatchExplanation(item.dimension, item.photographerValue, item.clientValue),
  }));

  const explanation = generateOverallExplanation(score, level, topMismatches, topMatches);

  return {
    score,
    level,
    dimensions,
    mismatches: topMismatches,
    matches: topMatches,
    confidence: Math.round(sampleConfidence * 100) / 100,
    explanation,
    algorithm_version: ALGORITHM_VERSION,
  };
}

export function getMismatchExplanation(
  dimension: keyof ImageFeatureVector,
  photographerVal: number,
  clientVal: number
): string {
  const diff = clientVal - photographerVal;
  const pct = Math.round(Math.abs(diff) * 100);
  const label = DIMENSION_LABELS_ES[dimension];

  switch (dimension) {
    case 'retouchLevel':
      return diff > 0
        ? `El cliente espera un nivel de retoque y pulido ${pct}% mayor al habitual en tu portafolio.`
        : `El cliente busca un acabado mucho más crudo y natural (-${pct}% retoque) que tu estilo estándar.`;
    case 'brightness':
      return diff > 0
        ? `El cliente prefiere fotografías con mayor exposición y luminosidad (+${pct}%).`
        : `El cliente se inclina por un ambiente más dramático y contrastado (-${pct}% brillo).`;
    case 'candidness':
      return diff > 0
        ? `El cliente prioriza capturas 100% espontáneas (+${pct}%) sobre posados guiados.`
        : `El cliente espera mayor dirección y retratos estructurados (-${pct}% espontaneidad).`;
    case 'naturalLight':
      return diff > 0
        ? `Preferencia marcada por luz natural (+${pct}%) frente a esquemas de flash/estudio.`
        : `Abierto o expectante de iluminación artificial/editorial (-${pct}% luz natural).`;
    case 'warmth':
      return diff > 0
        ? `Preferencia por tonos más cálidos y dorados (+${pct}% calidez).`
        : `Preferencia por tonos más fríos, neutros o limpios (-${pct}% calidez).`;
    case 'intimacy':
      return diff > 0
        ? `El cliente desea retratos cerrados con alto nivel de intimidad y detalle (+${pct}%).`
        : `El cliente prefiere mayor distancia y planos que muestren el entorno (-${pct}% intimidad).`;
    case 'wideComposition':
      return diff > 0
        ? `Preferencia por composiciones abiertas donde el paisaje sea coprotagonista (+${pct}%).`
        : `Preferencia por encuadres más cerrados y centrados en el sujeto.`;
    default:
      return diff > 0
        ? `Diferencia de +${pct}% en ${label.toLowerCase()} respecto a tu portafolio base.`
        : `Diferencia de -${pct}% en ${label.toLowerCase()} respecto a tu portafolio base.`;
  }
}

export function getMatchExplanation(
  dimension: keyof ImageFeatureVector,
  _photographerVal: number,
  _clientVal: number
): string {
  const label = DIMENSION_LABELS_ES[dimension];
  switch (dimension) {
    case 'candidness':
      return 'Coincidencia total en el gusto por la fotografía espontánea y momentos genuinos.';
    case 'naturalLight':
      return 'Ambos coinciden en el protagonismo y aprovechamiento de la luz natural.';
    case 'documentaryness':
      return 'Alineación plena con el estilo narrativo y documental de tu trabajo.';
    case 'warmth':
      return 'Excelente sintonía en la temperatura de color y tono visual general.';
    case 'minimalism':
      return 'Visión compartida respecto a la limpieza y simplicidad compositiva.';
    default:
      return `Gran alineación en ${label.toLowerCase()}.`;
  }
}

function generateOverallExplanation(
  score: number,
  level: AlignmentLevel,
  mismatches: AlignmentMismatch[],
  _matches: AlignmentMismatch[]
): string {
  if (level === 'very_high') {
    return `Compatibilidad excepcional (${score}%). El cliente comprende y busca exactamente tu lenguaje visual. La sesión fluirá con naturalidad sin necesidad de ajustes estilísticos mayores.`;
  }
  if (level === 'good') {
    const mainMismatch = mismatches[0]?.explanation ?? 'revisar algunos matices de iluminación o retoque';
    return `Buena compatibilidad general (${score}%). Existe sólida sintonía con tu trabajo, aunque conviene alinear antes: ${mainMismatch}`;
  }
  if (level === 'medium') {
    return `Compatibilidad moderada (${score}%). Hay coincidencias valiosas pero existen divergencias estilísticas claras. Es fundamental revisar el Visual Brief juntos antes de la sesión para evitar sorpresas en la entrega final.`;
  }
  return `Divergencias importantes (${score}%). Las expectativas visuales del cliente difieren notablemente de tu estilo habitual. Se recomienda una llamada previa de alineación utilizando las fotografías de referencia del brief.`;
}
