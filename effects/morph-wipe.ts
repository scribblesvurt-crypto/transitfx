import type { Effect } from './types';

export const morphWipeEffect: Effect = {
  id: 'morph-wipe',
  name: 'Morph Wipe',
  description: 'Diagonal wipe with a soft feathered edge',
  duration: 1000,

  _rafId: 0 as number,
  _running: false as boolean,

  render(container: HTMLElement, _targetUrl: string) {
    const overlay = container.closest('.transitfx-overlay') as HTMLElement;
    if (!overlay) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;';
    overlay.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    canvas.width = overlay.clientWidth || window.innerWidth;
    canvas.height = overlay.clientHeight || window.innerHeight;

    const style = document.createElement('style');
    style.textContent = `
      .fx-morph-text {
        position: relative;
        z-index: 10;
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--tfx-green-dim, #666);
        opacity: 0;
        animation: fx-morph-fade 0.3s ease-out 0.5s forwards;
      }
      @keyframes fx-morph-fade {
        to { opacity: 1; }
      }
    `;
    container.appendChild(style);

    const text = document.createElement('div');
    text.className = 'fx-morph-text';
    text.textContent = 'NAVIGATING';
    container.appendChild(text);

    (this as any)._running = true;
    const startTime = performance.now();
    const duration = this.duration;
    const w = canvas.width;
    const h = canvas.height;
    const diagonal = Math.sqrt(w * w + h * h);
    // Feather band width in pixels
    const feather = 120;

    // Get theme bg color from CSS variable
    const cs = getComputedStyle(overlay);
    const bgColor = cs.getPropertyValue('--tfx-bg').trim() || '#1a1a1a';

    const animate = (now: number) => {
      if (!(this as any)._running) return;

      const progress = Math.min((now - startTime) / duration, 1);
      // Wipe edge position moves from -feather to diagonal+feather
      const edge = -feather + progress * (diagonal + feather * 2);

      ctx.clearRect(0, 0, w, h);

      // Draw scanlines perpendicular to the diagonal (top-left → bottom-right)
      // For each pixel, compute its distance along the diagonal
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      // Parse bg color
      const r0 = parseInt(bgColor.slice(1, 3), 16) || 26;
      const g0 = parseInt(bgColor.slice(3, 5), 16) || 26;
      const b0 = parseInt(bgColor.slice(5, 7), 16) || 26;

      // Normalized diagonal direction
      const invDiag = 1 / diagonal;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Distance along diagonal (top-left to bottom-right)
          const dist = (x + y) * invDiag * diagonal * invDiag;
          const actualDist = (x + y) * (diagonal / (w + h));

          let alpha = 0;
          if (actualDist < edge - feather) {
            alpha = 255;
          } else if (actualDist < edge + feather) {
            alpha = Math.round(255 * (1 - (actualDist - (edge - feather)) / (feather * 2)));
          }

          const idx = (y * w + x) * 4;
          data[idx] = r0;
          data[idx + 1] = g0;
          data[idx + 2] = b0;
          data[idx + 3] = alpha;
        }
      }

      ctx.putImageData(imageData, 0, h > 0 ? 0 : 0);

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
