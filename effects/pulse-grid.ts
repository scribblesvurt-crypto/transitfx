import type { Effect } from './types';

export const pulseGridEffect: Effect = {
  id: 'pulse-grid',
  name: 'Pulse Grid',
  description: 'Grid of CJK characters ripple outward from center in neon pink waves',
  duration: 1800,

  _rafId: 0 as number,
  _running: false as boolean,

  render(container: HTMLElement, targetUrl: string) {
    const overlay = container.closest('.transitfx-overlay') || container.parentElement!;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;';
    overlay.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    canvas.width = overlay.clientWidth || window.innerWidth;
    canvas.height = overlay.clientHeight || window.innerHeight;

    const style = document.createElement('style');
    style.textContent = `
      .fx-pgrid-status {
        position: relative;
        z-index: 10;
        font-size: 10px;
        letter-spacing: 2px;
        color: var(--tfx-green-dim, #991a5c);
        margin-top: 8px;
      }
    `;
    container.appendChild(style);

    const statusEl = document.createElement('div');
    statusEl.className = 'fx-pgrid-status';
    statusEl.textContent = 'パルス同期中 // SYNCING';
    container.appendChild(statusEl);

    const w = canvas.width;
    const h = canvas.height;
    const cellSize = 24;
    const cols = Math.ceil(w / cellSize);
    const rows = Math.ceil(h / cellSize);
    const cx = cols / 2;
    const cy = rows / 2;

    const cjkChars = '電脳網絡接続通信暗号解読転送変換認証起動制御光速量子アイウエオカキクケコ가나다라마바사';

    // Each cell has a state: random char, settled char, distance from center
    interface Cell {
      char: string;
      finalChar: string;
      dist: number;
      settled: boolean;
    }

    // Build URL fragment chars for final state
    let shortUrl = targetUrl;
    try { shortUrl = new URL(targetUrl).hostname; } catch {}

    const grid: Cell[][] = [];
    let urlIdx = 0;

    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        const dist = Math.sqrt((c - cx) * (c - cx) + (r - cy) * (r - cy));
        // Mix URL chars into final state
        let finalChar = cjkChars[Math.floor(Math.random() * cjkChars.length)];
        if (Math.random() < 0.08 && urlIdx < shortUrl.length) {
          finalChar = shortUrl[urlIdx++];
        }
        grid[r][c] = {
          char: cjkChars[Math.floor(Math.random() * cjkChars.length)],
          finalChar,
          dist,
          settled: false,
        };
      }
    }

    const maxDist = Math.sqrt(cx * cx + cy * cy);

    const overlayStyle = getComputedStyle(overlay);
    const colorGreen = overlayStyle.getPropertyValue('--tfx-green').trim() || '#ff2d95';
    const colorCyan = overlayStyle.getPropertyValue('--tfx-cyan').trim() || '#00d4ff';

    // Helper to parse hex to r,g,b
    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '');
      return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    }

    const [gR, gG, gB] = hexToRgb(colorGreen);

    (this as any)._running = true;
    const startTime = performance.now();
    const duration = this.duration;

    const animate = (now: number) => {
      if (!(this as any)._running) return;

      const progress = Math.min((now - startTime) / duration, 1);

      ctx.clearRect(0, 0, w, h);
      ctx.font = `${cellSize - 4}px 'MS Gothic', 'Noto Sans CJK', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Ripple wave: expands outward from center
      const waveRadius = progress * maxDist * 1.5;
      const waveWidth = 4;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c];
          const x = c * cellSize + cellSize / 2;
          const y = r * cellSize + cellSize / 2;

          // Has the wave reached this cell?
          const waveHit = cell.dist < waveRadius;
          const inWaveFront = Math.abs(cell.dist - waveRadius) < waveWidth;

          if (waveHit && !cell.settled) {
            // Settle after wave passes
            if (cell.dist < waveRadius - waveWidth * 2) {
              cell.settled = true;
              cell.char = cell.finalChar;
            } else {
              // Still scrambling
              cell.char = cjkChars[Math.floor(Math.random() * cjkChars.length)];
            }
          }

          if (inWaveFront) {
            // Bright wave front
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = colorGreen;
            ctx.shadowBlur = 12;
          } else if (cell.settled) {
            // Settled: primary glow
            ctx.fillStyle = colorGreen;
            ctx.shadowColor = colorGreen;
            ctx.shadowBlur = 4;
          } else if (waveHit) {
            // Just passed wave: secondary
            ctx.fillStyle = colorCyan;
            ctx.shadowBlur = 2;
            ctx.shadowColor = colorCyan;
          } else {
            // Not yet reached: dim
            ctx.fillStyle = `rgba(${gR}, ${gG}, ${gB}, 0.15)`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(cell.char, x, y);
          ctx.shadowBlur = 0;
        }
      }

      if (progress >= 1) {
        statusEl.textContent = '同期完了 // SYNCED';
        statusEl.style.color = 'var(--tfx-cyan, #00d4ff)';
      }

      if (progress < 1) {
        (this as any)._rafId = requestAnimationFrame(animate);
      }
    };

    (this as any)._rafId = requestAnimationFrame(animate);
  },

  destroy() {
    (this as any)._running = false;
    if ((this as any)._rafId) cancelAnimationFrame((this as any)._rafId);
  },
};
