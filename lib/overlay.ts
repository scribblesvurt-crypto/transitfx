import type { ColorPalette } from '@/effects/types';

export function createOverlayStyles(colors: ColorPalette): string {
  return `
    :host {
      all: initial;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }

    .transitfx-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: ${colors.bg};
      color: ${colors.green};
      font-family: 'Courier New', 'Consolas', monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      overflow: hidden;
    }

    .transitfx-container {
      text-align: center;
      z-index: 10;
      max-width: 700px;
      width: 90%;
      position: relative;
    }

    /* Skip button */
    .transitfx-skip {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: transparent;
      border: 1px solid ${colors.greenDim};
      color: ${colors.greenDim};
      font-family: 'Courier New', monospace;
      font-size: 11px;
      letter-spacing: 2px;
      padding: 6px 14px;
      cursor: pointer;
      pointer-events: auto;
      z-index: 1001;
      transition: color 0.2s, border-color 0.2s;
    }

    .transitfx-skip:hover {
      color: ${colors.cyan};
      border-color: ${colors.cyan};
    }

    /* Fade out — holds on theme bg so the old page never peeks through */
    .transitfx-flash-out {
      transition: opacity 0.25s ease-out;
      opacity: 1 !important;
      background: ${colors.bg} !important;
    }

    /* Shared keyframes */
    @keyframes transitfx-pulse {
      from { opacity: 0.6; }
      to { opacity: 1; }
    }

    @keyframes transitfx-radar-sweep {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes transitfx-glitch-skew {
      0% { transform: skew(0deg); }
      20% { transform: skew(-1deg); }
      40% { transform: skew(0.5deg); }
      60% { transform: skew(-0.3deg); }
      80% { transform: skew(0.8deg); }
      100% { transform: skew(0deg); }
    }

    @keyframes transitfx-glitch-1 {
      0% { transform: translate(0); }
      20% { transform: translate(-3px, 2px); }
      40% { transform: translate(3px, -1px); }
      60% { transform: translate(-1px, 1px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }

    @keyframes transitfx-glitch-2 {
      0% { transform: translate(0); }
      20% { transform: translate(2px, -1px); }
      40% { transform: translate(-2px, 2px); }
      60% { transform: translate(1px, -1px); }
      80% { transform: translate(-3px, 1px); }
      100% { transform: translate(0); }
    }

    @keyframes transitfx-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes transitfx-slide-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `;
}

export function getCRTOverlayStyles(): string {
  return `
    .transitfx-overlay::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.15) 0px,
        rgba(0, 0, 0, 0.15) 2px,
        transparent 2px,
        transparent 4px
      );
      pointer-events: none;
      z-index: 1000;
    }
  `;
}
