import type { Effect, EffectPack, ColorPalette } from './types';

// --- Cyberpunk pack ---
import { decryptEffect } from './decrypt';
import { matrixRainEffect } from './matrix-rain';
import { glitchEffect } from './glitch';
import { dosBootEffect } from './dos-boot';
import { typewriterEffect } from './typewriter';

// --- Clean // Minimal pack ---
import { curtainEffect } from './curtain';
import { slideEffect } from './slide';
import { dissolveEffect } from './dissolve';
import { blindsEffect } from './blinds';
import { morphWipeEffect } from './morph-wipe';

// --- Static // Retro pack ---
import { vhsTrackingEffect } from './vhs-tracking';
import { crtShutdownEffect } from './crt-shutdown';
import { channelFlipEffect } from './channel-flip';
import { filmstripEffect } from './filmstrip';
import { teletextEffect } from './teletext';

// --- Neo // Eastern pack ---
import { kanjiDecodeEffect } from './kanji-decode';
import { neonRainEffect } from './neon-rain';
import { cipherScrollEffect } from './cipher-scroll';
import { pulseGridEffect } from './pulse-grid';
import { spiritGateEffect } from './spirit-gate';

// --- Effect Packs ---

export const cyberpunkPack: EffectPack = {
  id: 'cyberpunk',
  name: 'CYBERPUNK',
  description: 'Hacker-themed transitions with decrypt sequences, matrix rain, and glitch effects',
  effects: [decryptEffect, matrixRainEffect, glitchEffect, dosBootEffect, typewriterEffect],
  colors: {
    green: '#00ff41',
    greenDim: '#00aa2a',
    amber: '#ffb000',
    red: '#ff0040',
    cyan: '#00e5ff',
    bg: '#0a0a0a',
    panelBg: '#0d0d0d',
  },
};

export const cleanPack: EffectPack = {
  id: 'clean',
  name: 'CLEAN // Minimal',
  description: 'Subtle, professional transitions — curtains, wipes, and smooth slides',
  effects: [curtainEffect, slideEffect, dissolveEffect, blindsEffect, morphWipeEffect],
  colors: {
    green: '#a0a0a0',
    greenDim: '#666666',
    amber: '#c8a050',
    red: '#c05050',
    cyan: '#6090c0',
    bg: '#1a1a1a',
    panelBg: '#222222',
  },
};

export const retroPack: EffectPack = {
  id: 'retro',
  name: 'STATIC // Retro',
  description: 'Old-school tech nostalgia — VHS glitches, CRT shutdowns, and teletext pages',
  effects: [vhsTrackingEffect, crtShutdownEffect, channelFlipEffect, filmstripEffect, teletextEffect],
  colors: {
    green: '#ff71ce',
    greenDim: '#b34d8f',
    amber: '#b967ff',
    red: '#ff6b9d',
    cyan: '#01cdfe',
    bg: '#1a0a2e',
    panelBg: '#200d3a',
  },
};

export const neoPack: EffectPack = {
  id: 'neo',
  name: 'NEO // Eastern',
  description: 'Neon-soaked CJK transitions — kanji decryption, neon rain, and spirit gates',
  effects: [kanjiDecodeEffect, neonRainEffect, cipherScrollEffect, pulseGridEffect, spiritGateEffect],
  colors: {
    green: '#ff2d95',
    greenDim: '#991a5c',
    amber: '#b967ff',
    red: '#ff0040',
    cyan: '#00d4ff',
    bg: '#0a0012',
    panelBg: '#12001f',
  },
};

export const packs: EffectPack[] = [cyberpunkPack, cleanPack, retroPack, neoPack];

const packsById: Record<string, EffectPack> = Object.fromEntries(packs.map(p => [p.id, p]));

const effects: Record<string, Effect> = {};
const effectToPackMap: Record<string, EffectPack> = {};
for (const pack of packs) {
  for (const effect of pack.effects) {
    effects[effect.id] = effect;
    effectToPackMap[effect.id] = pack;
  }
}

const allEffects: Effect[] = Object.values(effects);

export function getEffect(id: string): Effect | undefined {
  return effects[id];
}

/** Get the pack that an effect belongs to */
export function getPackForEffect(effectId: string): EffectPack | undefined {
  return effectToPackMap[effectId];
}

/** Get a random effect from the full pool */
export function getRandomEffect(): Effect {
  return allEffects[Math.floor(Math.random() * allEffects.length)];
}

/** Get a random effect from a specific pack */
export function getRandomFromPack(packId: string): Effect | undefined {
  const pack = packsById[packId];
  if (!pack) return undefined;
  return pack.effects[Math.floor(Math.random() * pack.effects.length)];
}

// --- Filter color palettes ---
// When a terminal filter is active, these monochrome palettes replace pack colors

export const FILTER_PALETTES: Record<string, ColorPalette> = {
  'green-terminal': {
    green: '#1acc00',
    greenDim: '#0f7a00',
    amber: '#1acc00',
    red: '#0f7a00',
    cyan: '#1acc00',
    bg: '#0a0a0a',
    panelBg: '#0d0d0d',
  },
  'blue-terminal': {
    green: '#00ccff',
    greenDim: '#007a99',
    amber: '#00ccff',
    red: '#007a99',
    cyan: '#00ccff',
    bg: '#0a0a0a',
    panelBg: '#0d0d0d',
  },
  'pink-terminal': {
    green: '#ff0055',
    greenDim: '#990033',
    amber: '#ff0055',
    red: '#990033',
    cyan: '#ff0055',
    bg: '#0a0a0a',
    panelBg: '#0d0d0d',
  },
  'yellow-terminal': {
    green: '#ffff00',
    greenDim: '#999900',
    amber: '#ffff00',
    red: '#999900',
    cyan: '#ffff00',
    bg: '#0a0a0a',
    panelBg: '#0d0d0d',
  },
};
