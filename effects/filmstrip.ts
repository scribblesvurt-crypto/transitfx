import type { Effect } from './types';

export const filmstripEffect: Effect = {
  id: 'filmstrip',
  name: 'Filmstrip',
  description: 'Old film countdown leader with sprocket holes and scratches',
  duration: 1600,

  _rafId: 0 as number,
  _running: false as boolean,
  _timers: [] as number[],

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
      .fx-film-count {
        position: relative;
        z-index: 10;
        font-size: 120px;
        font-weight: bold;
        color: #ddd;
        text-shadow: 0 0 30px rgba(255,255,255,0.4);
        opacity: 0;
        transition: opacity 0.1s;
        line-height: 1;
      }
      .fx-film-count.visible { opacity: 1; }
      .fx-film-count.flash { color: #fff; text-shadow: 0 0 60px rgba(255,255,255,0.8); }
    `;
    container.appendChild(style);

    const countEl = document.createElement('div');
    countEl.className = 'fx-film-count';
    container.appendChild(countEl);

    const w = canvas.width;
    const h = canvas.height;

    (this as any)._running = true;
    const timers: number[] = [];

    // Draw sprocket holes on sides
    const drawSprockets = () => {
      const holeW = 16;
      const holeH = 22;
      const spacing = 40;
      ctx.fillStyle = '#111';

      // Left strip
      ctx.fillStyle = 'rgba(30, 25, 15, 0.9)';
      ctx.fillRect(0, 0, 50, h);
      // Right strip
      ctx.fillRect(w - 50, 0, 50, h);

      ctx.fillStyle = '#000';
      for (let y = 10; y < h; y += spacing) {
        // Left holes
        ctx.fillRect(16, y, holeW, holeH);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(16, y, holeW, holeH);
        // Right holes
        ctx.fillRect(w - 32, y, holeW, holeH);
        ctx.strokeRect(w - 32, y, holeW, holeH);
      }
    };

    // Draw film grain / scratches
    const drawGrain = (intensity: number) => {
      const imageData = ctx.getImageData(50, 0, w - 100, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 16) {
        const noise = (Math.random() - 0.5) * intensity;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 50, 0);

      // Vertical scratch lines
      for (let s = 0; s < 3; s++) {
        if (Math.random() < 0.4) {
          const x = 60 + Math.random() * (w - 120);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.06})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + (Math.random() - 0.5) * 5, h);
          ctx.stroke();
        }
      }
    };

    // Draw crosshair / countdown circle
    const drawCountdownFrame = (number: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.2;

      // Sepia-tinted background
      ctx.fillStyle = '#1a1510';
      ctx.fillRect(50, 0, w - 100, h);

      // Cross lines
      ctx.strokeStyle = 'rgba(200, 180, 140, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.moveTo(50, cy);
      ctx.lineTo(w - 50, cy);
      ctx.stroke();

      // Circle
      ctx.strokeStyle = 'rgba(200, 180, 140, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Sweep arc (rotating clock hand)
      ctx.strokeStyle = 'rgba(220, 200, 160, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const angle = -Math.PI / 2 + (Date.now() % 1000) / 1000 * Math.PI * 2;
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();

      drawSprockets();
      drawGrain(50);

      countEl.textContent = String(number);
      countEl.classList.add('visible');
    };

    // Countdown: 3, 2, 1
    let currentNum = 3;
    const countdownInterval = 400;

    const showNumber = (num: number) => {
      currentNum = num;
      countEl.classList.remove('flash');
      countEl.classList.add('visible');
    };

    // Schedule countdown
    for (let n = 3; n >= 1; n--) {
      const t = window.setTimeout(() => showNumber(n), (3 - n) * countdownInterval);
      timers.push(t);
    }

    // Flash at end
    const flashTimer = window.setTimeout(() => {
      countEl.classList.add('flash');
      countEl.textContent = '';
      ctx.fillStyle = 'rgba(255, 250, 240, 0.8)';
      ctx.fillRect(0, 0, w, h);
    }, 3 * countdownInterval);
    timers.push(flashTimer);

    const draw = () => {
      if (!(this as any)._running) return;
      drawCountdownFrame(currentNum);
      (this as any)._rafId = requestAnimationFrame(draw);
    };

    (this as any)._rafId = requestAnimationFrame(draw);
    (this as any)._timers = timers;
  },

  destroy() {
    (this as any)._running = false;
    if ((this as any)._rafId) cancelAnimationFrame((this as any)._rafId);
    ((this as any)._timers || []).forEach((t: number) => clearTimeout(t));
  },
};
