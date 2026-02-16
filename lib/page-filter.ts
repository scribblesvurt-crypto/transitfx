import type { ExtensionSettings } from '@/effects/types';

const STYLE_ID = 'transitfx-page-filter';
const OVERLAY_ID = 'transitfx-page-filter-overlay';
const SCANLINE_ID = 'transitfx-page-filter-scanlines';
const CACHE_KEY = 'transitfx-page-filter-cache';

type FilterId = ExtensionSettings['pageFilter'];

interface FilterCache {
  pageFilter: FilterId;
}

const TERMINAL_FILTERS: FilterId[] = ['green-terminal', 'blue-terminal', 'pink-terminal', 'yellow-terminal'];
const SCANLINE_FILTERS: FilterId[] = ['green-terminal', 'blue-terminal', 'pink-terminal', 'yellow-terminal', 'crt'];

// Scrollbar colors for each terminal mode
const SCROLLBAR_CONFIG: Record<string, { color: string; track: string }> = {
  'green-terminal':  { color: '#1acc00', track: '#0a3300' },
  'blue-terminal':   { color: '#00ccff', track: '#002a33' },
  'pink-terminal':   { color: '#ff0055', track: '#330011' },
  'yellow-terminal': { color: '#ffff00', track: '#333300' },
  'crt':             { color: '#666666', track: '#1a1a1a' },
};

function getScrollbarCSS(filterId: FilterId): string {
  const cfg = SCROLLBAR_CONFIG[filterId];
  if (!cfg) return '';
  return `
    html {
      scrollbar-color: ${cfg.color} ${cfg.track} !important;
    }
    ::-webkit-scrollbar { width: 12px; }
    ::-webkit-scrollbar-track { background: ${cfg.track} !important; }
    ::-webkit-scrollbar-thumb { background: ${cfg.color} !important; border-radius: 6px; }
    ::-webkit-scrollbar-thumb:hover { filter: brightness(1.2); }
  `;
}

function getFilterCSS(filterId: FilterId): string | null {
  if (TERMINAL_FILTERS.includes(filterId)) {
    return 'html { filter: contrast(1.2) brightness(0.9) !important; }' + getScrollbarCSS(filterId);
  }
  if (filterId === 'crt') {
    return 'html { filter: contrast(1.15) saturate(0.9) !important; }' + getScrollbarCSS(filterId);
  }
  return null;
}

function createOverlayDiv(filterId: FilterId): HTMLDivElement | null {
  const div = document.createElement('div');
  div.id = OVERLAY_ID;
  div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;';

  switch (filterId) {
    case 'green-terminal': {
      div.style.backgroundColor = '#1acc00';
      div.style.mixBlendMode = 'color';
      div.style.opacity = '0.85';
      return div;
    }
    case 'blue-terminal': {
      div.style.backgroundColor = '#00ccff';
      div.style.mixBlendMode = 'color';
      div.style.opacity = '0.85';
      return div;
    }
    case 'pink-terminal': {
      div.style.backgroundColor = '#ff0055';
      div.style.mixBlendMode = 'color';
      div.style.opacity = '0.92';
      return div;
    }
    case 'yellow-terminal': {
      div.style.backgroundColor = '#ffff00';
      div.style.mixBlendMode = 'color';
      div.style.opacity = '0.92';
      return div;
    }
    default:
      return null;
  }
}

function createScanlineDiv(): HTMLDivElement {
  const div = document.createElement('div');
  div.id = SCANLINE_ID;
  div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;';
  div.style.background = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 4px)';
  return div;
}

/** Write current filter to localStorage for instant apply on next page load */
function cacheFilter(filterId: FilterId): void {
  try {
    const data: FilterCache = { pageFilter: filterId };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

/** Apply cached filter instantly (synchronous, no storage API wait) */
export function applyCachedFilter(): void {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const data: FilterCache = JSON.parse(raw);
    if (data.pageFilter === 'off') return;
    applyPageFilter(data.pageFilter);
  } catch {}
}

export function applyPageFilter(filterId: FilterId): void {
  removePageFilter();

  if (filterId === 'off') {
    cacheFilter('off');
    return;
  }

  cacheFilter(filterId);

  const css = getFilterCSS(filterId);
  if (css) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.documentElement.appendChild(style);
  }

  const overlay = createOverlayDiv(filterId);
  if (overlay) {
    document.documentElement.appendChild(overlay);
  }

  if (SCANLINE_FILTERS.includes(filterId)) {
    document.documentElement.appendChild(createScanlineDiv());
  }
}

export function removePageFilter(): void {
  document.getElementById(STYLE_ID)?.remove();
  document.getElementById(OVERLAY_ID)?.remove();
  document.getElementById(SCANLINE_ID)?.remove();
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}
