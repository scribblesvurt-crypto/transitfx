import type { Effect } from './types';

export const matrixRainEffect: Effect = {
  id: 'matrix-rain',
  name: 'Matrix Rain',
  description: 'Falling characters cascade down the screen',
  duration: 1800,

  _rafId: 0 as number,
  _running: false as boolean,

  render(container: HTMLElement, _targetUrl: string) {
    const style = document.createElement('style');
    style.textContent = `
      .fx-matrix-canvas {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 5;
      }
      .fx-matrix-label {
        z-index: 10;
        position: relative;
        font-size: 14px;
        letter-spacing: 3px;
        color: var(--tfx-cyan, #00e5ff);
        text-shadow: 0 0 10px rgba(0,229,255,0.6);
        animation: transitfx-pulse 0.8s ease-in-out infinite alternate;
      }
    `;
    container.appendChild(style);

    // Canvas needs to be in the overlay, not the centered container
    const overlay = container.closest('.transitfx-overlay') || container.parentElement!;

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-matrix-canvas';
    overlay.appendChild(canvas);

    const label = document.createElement('div');
    label.className = 'fx-matrix-label';
    label.textContent = 'INTERCEPTING SIGNAL';
    container.appendChild(label);

    const ctx = canvas.getContext('2d')!;
    canvas.width = overlay.clientWidth || window.innerWidth;
    canvas.height = overlay.clientHeight || window.innerHeight;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    for (let c = 0; c < columns; c++) {
      drops[c] = Math.floor(Math.random() * -20);
    }

    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    (this as any)._running = true;

    const draw = () => {
      if (!(this as any)._running) return;

      ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize - 1}px Courier New, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const greenColor = getComputedStyle(overlay).getPropertyValue('--tfx-green').trim() || '#00ff41';
        ctx.fillStyle = greenColor;
        ctx.shadowColor = greenColor;
        ctx.shadowBlur = 8;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      (this as any)._rafId = requestAnimationFrame(draw);
    };

    (this as any)._rafId = requestAnimationFrame(draw);
  },

  destroy() {
    (this as any)._running = false;
    if ((this as any)._rafId) {
      cancelAnimationFrame((this as any)._rafId);
    }
  },
};
