/**
 * constants/index.ts
 * Global application constants, dimension definitions, and UI metadata.
 */

import type { ImageFeatureVector } from '@/types/database';

export const APP_NAME = 'ENCUADRE';
export const APP_SLOGAN = 'Alinea la visión. Antes de tomar la foto.';

export const FEATURE_DIMENSIONS: Array<{
  key: keyof ImageFeatureVector;
  label: string;
  shortLabel: string;
  description: string;
  lowLabel: string;
  highLabel: string;
}> = [
  {
    key: 'warmth',
    label: 'Calidez de color',
    shortLabel: 'Calidez',
    description: 'Temperatura general de color en la escena',
    lowLabel: 'Frío / Neutro',
    highLabel: 'Cálido / Dorado',
  },
  {
    key: 'brightness',
    label: 'Luminosidad / Exposición',
    shortLabel: 'Luminosidad',
    description: 'Nivel de exposición y luz en la toma',
    lowLabel: 'Oscuro / Dramático',
    highLabel: 'Luminoso / Aireado',
  },
  {
    key: 'contrast',
    label: 'Contraste',
    shortLabel: 'Contraste',
    description: 'Diferencia entre luces altas y sombras',
    lowLabel: 'Suave / Plano',
    highLabel: 'Marcado / Punch',
  },
  {
    key: 'saturation',
    label: 'Saturación de color',
    shortLabel: 'Saturación',
    description: 'Intensidad y viveza de los colores',
    lowLabel: 'Desaturado / Muted',
    highLabel: 'Vívido / Saturado',
  },
  {
    key: 'naturalLight',
    label: 'Luz natural vs. Artificial',
    shortLabel: 'Luz Natural',
    description: 'Preferencia por luz disponible vs flash/estudio',
    lowLabel: 'Flash / Estudio',
    highLabel: '100% Luz Natural',
  },
  {
    key: 'candidness',
    label: 'Espontaneidad',
    shortLabel: 'Espontáneo',
    description: 'Momentos sin posar vs tomas dirigidas',
    lowLabel: 'Posado guiado',
    highLabel: '100% Espontáneo',
  },
  {
    key: 'posedness',
    label: 'Retrato estructurado',
    shortLabel: 'Posado',
    description: 'Grado de dirección y estructura en poses',
    lowLabel: 'Libre / Casual',
    highLabel: 'Pose formal / Guiada',
  },
  {
    key: 'editorialness',
    label: 'Estilo editorial / moda',
    shortLabel: 'Editorial',
    description: 'Acabado de revista o campaña comercial',
    lowLabel: 'Casual / Cotidiano',
    highLabel: 'Alta Moda / Editorial',
  },
  {
    key: 'documentaryness',
    label: 'Estilo documental',
    shortLabel: 'Documental',
    description: 'Narrativa secuencial y fotoperiodística',
    lowLabel: 'Estético / Estilizado',
    highLabel: 'Puro relato documental',
  },
  {
    key: 'intimacy',
    label: 'Intimidad / Cercanía',
    shortLabel: 'Intimidad',
    description: 'Proximidad emocional y física al sujeto',
    lowLabel: 'Distante / Ambiental',
    highLabel: 'Íntimo / Primer plano',
  },
  {
    key: 'wideComposition',
    label: 'Composición abierta',
    shortLabel: 'Plano abierto',
    description: 'Importancia del paisaje y entorno',
    lowLabel: 'Encuadre cerrado',
    highLabel: 'Gran angular / Paisaje',
  },
  {
    key: 'retouchLevel',
    label: 'Nivel de retoque',
    shortLabel: 'Retoque',
    description: 'Pieles naturales vs acabado pulido/beauty',
    lowLabel: 'Piel 100% natural',
    highLabel: 'Retoque pulido / Beauty',
  },
  {
    key: 'emotionalIntensity',
    label: 'Intensidad emocional',
    shortLabel: 'Emoción',
    description: 'Fuerza expresiva (risas, llanto, pasión)',
    lowLabel: 'Sobrio / Calmo',
    highLabel: 'Alta carga emotiva',
  },
  {
    key: 'minimalism',
    label: 'Minimalismo compositivo',
    shortLabel: 'Minimalismo',
    description: 'Limpieza visual vs escenas con riqueza de elementos',
    lowLabel: 'Rico en elementos',
    highLabel: 'Limpio / Minimalista',
  },
];

export const PROJECT_STATUS_LABELS: Record<string, { label: string; variant: 'active' | 'aligned' | 'waiting' | 'archived' }> = {
  active:   { label: 'En progreso', variant: 'active' },
  waiting:  { label: 'Esperando cliente', variant: 'waiting' },
  aligned:  { label: 'Alineado', variant: 'aligned' },
  draft:    { label: 'Borrador', variant: 'archived' },
  archived: { label: 'Archivado', variant: 'archived' },
};

export const SESSION_EXPIRY_DAYS = 14;
export const MAX_PAIRWISE_CHOICES = 12;
export const MIN_PORTFOLIO_FOR_DNA = 3;
