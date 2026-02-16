export interface Effect {
  id: string;
  name: string;
  description: string;
  /** Duration in ms before navigation proceeds */
  duration: number;
  /** Render the effect into the Shadow DOM container */
  render(container: HTMLElement, targetUrl: string): void;
  /** Clean up intervals, animation frames, elements */
  destroy(): void;
}

export interface ColorPalette {
  green: string;
  greenDim: string;
  amber: string;
  red: string;
  cyan: string;
  bg: string;
  panelBg: string;
}

export interface EffectPack {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
  colors: ColorPalette;
}

export interface ExtensionSettings {
  enabled: boolean;
  selectedEffect: string;
  speed: 'fast' | 'normal' | 'slow';
  customDuration?: number;
  siteMode: 'all' | 'allowlist' | 'blocklist';
  siteList: string[];
  pageFilter: 'off' | 'green-terminal' | 'blue-terminal' | 'pink-terminal' | 'yellow-terminal' | 'crt';
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  selectedEffect: 'random',
  speed: 'normal',
  siteMode: 'all',
  siteList: [],
  pageFilter: 'off',
};

export const SPEED_MULTIPLIERS: Record<string, number> = {
  fast: 0.6,
  normal: 1.0,
  slow: 1.5,
};
