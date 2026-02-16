import type { Effect } from './types';

export const dissolveEffect: Effect = {
  id: 'dissolve',
  name: 'Dissolve',
  description: 'Particles scatter and dissolve across the screen',
  duration: 1200,

  _rafId: 0 as number,
  _running: false as boolean,

  render(container: HTMLElement, _targetUrl: string) {
    const overlay = container.closest('.transitfx-overlay') || container.parentElement!;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;';
    overlay.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    canvas.width = overlay.clientWidth || window.innerWidth;
    canvas.height = overlay.clientHeight || window.innerHeight;

    const style = document.createElement('style');
    style.textContent = `
      .fx-dissolve-text {
        position: relative;
        z-index: 10;
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--tfx-green-dim, #666);
        opacity: 0;
        animation: fx-dissolve-fade 0.5s ease-out 0.3s forwards;
      }
      @keyframes fx-dissolve-fade {
        to { opacity: 1; }
      }
    `;
    container.appendChild(style);

    const text = document.createElement('div');
    text.className = 'fx-dissolve-text';
    text.textContent = 'NAVIGATING';
    container.appendChild(text);

    // Particle system
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;
    }

    const overlayStyle = getComputedStyle(overlay);
    const colorGreen = overlayStyle.getPropertyValue('--tfx-green').trim() || '#a0a0a0';
    const colorGreenDim = overlayStyle.getPropertyValue('--tfx-green-dim').trim() || '#666666';

    const particles: Particle[] = [];
    const colorValues = [colorGreen, colorGreenDim, colorGreenDim, colorGreen];

    // Spawn particles in waves
    const spawnWave = () => {
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: 1 + Math.random() * 3,
          alpha: 0.6 + Math.random() * 0.4,
          decay: 0.005 + Math.random() * 0.01,
          color: colorValues[Math.floor(Math.random() * colorValues.length)],
        });
      }
    };

    (this as any)._running = true;
    let frame = 0;

    const draw = () => {
      if (!(this as any)._running) return;

      ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (frame % 8 === 0 && particles.length < 300) spawnWave();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.globalAlpha = 1;
      frame++;
      (this as any)._rafId = requestAnimationFrame(draw);
    };

    (this as any)._rafId = requestAnimationFrame(draw);
  },

  destroy() {
    (this as any)._running = false;
    if ((this as any)._rafId) cancelAnimationFrame((this as any)._rafId);
  },
};
