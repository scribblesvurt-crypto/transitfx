import type { Effect } from './types';

export const crtShutdownEffect: Effect = {
  id: 'crt-shutdown',
  name: 'CRT Shutdown',
  description: 'Classic CRT monitor shutdown — collapses to a horizontal line then a dot',
  duration: 1200,

  _rafId: 0 as number,
  _running: false as boolean,

  render(container: HTMLElement, _targetUrl: string) {
    const overlay = container.closest('.transitfx-overlay') as HTMLElement;
    if (!overlay) return;

    const style = document.createElement('style');
    style.textContent = `
      .fx-crt-screen {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: #111;
        z-index: 5;
      }
      .fx-crt-glow {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        background: #fff;
        z-index: 6;
        transition: width 0.3s, height 0.3s;
      }
      .fx-crt-text {
        position: relative;
        z-index: 10;
        font-size: 12px;
        letter-spacing: 3px;
        color: #888;
        opacity: 0;
      }
    `;
    container.appendChild(style);

    const screen = document.createElement('div');
    screen.className = 'fx-crt-screen';
    overlay.appendChild(screen);

    const glow = document.createElement('div');
    glow.className = 'fx-crt-glow';
    overlay.appendChild(glow);

    const text = document.createElement('div');
    text.className = 'fx-crt-text';
    text.textContent = 'NO SIGNAL';
    container.appendChild(text);

    (this as any)._running = true;
    const startTime = performance.now();
    const duration = this.duration;

    const animate = (now: number) => {
      if (!(this as any)._running) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 0.15) {
        // Phase 1: brief white flash
        const t = progress / 0.15;
        glow.style.opacity = String(0.8 * (1 - t));
        glow.style.width = '100%';
        glow.style.height = '100%';
      } else if (progress < 0.5) {
        // Phase 2: collapse vertically to a horizontal line
        const t = (progress - 0.15) / 0.35;
        const eased = t * t;
        glow.style.opacity = '1';
        glow.style.width = '100%';
        glow.style.height = Math.max(2, (1 - eased) * 100) + '%';
        glow.style.background = `rgb(${200 - t * 150}, ${200 - t * 150}, ${200 - t * 150})`;
      } else if (progress < 0.75) {
        // Phase 3: line shrinks to a dot
        const t = (progress - 0.5) / 0.25;
        const eased = t * t;
        glow.style.height = '2px';
        glow.style.width = Math.max(4, (1 - eased) * 100) + '%';
        glow.style.background = '#aaa';
        glow.style.boxShadow = `0 0 ${20 - t * 15}px rgba(255,255,255,${0.5 - t * 0.4})`;
      } else {
        // Phase 4: dot fades out, "NO SIGNAL" appears
        const t = (progress - 0.75) / 0.25;
        glow.style.width = '4px';
        glow.style.height = '2px';
        glow.style.opacity = String(Math.max(0, 1 - t * 2));
        text.style.opacity = String(Math.min(1, t * 2));
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
