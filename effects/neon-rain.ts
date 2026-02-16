import type { Effect } from './types';

export const neonRainEffect: Effect = {
  id: 'neon-rain',
  name: 'Neon Rain',
  description: 'CJK + Hangul + Thai characters rain in hot pink and cyan neon columns',
  duration: 1800,

  _rafId: 0 as number,
  _running: false as boolean,

  render(container: HTMLElement, _targetUrl: string) {
    const style = document.createElement('style');
    style.textContent = `
      .fx-nrain-canvas {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 5;
      }
      .fx-nrain-label {
        z-index: 10;
        position: relative;
        font-size: 14px;
        letter-spacing: 3px;
        color: var(--tfx-cyan, #00d4ff);
        text-shadow: 0 0 12px rgba(0, 212, 255, 0.6);
        animation: transitfx-pulse 0.8s ease-in-out infinite alternate;
      }
    `;
    container.appendChild(style);

    const overlay = container.closest('.transitfx-overlay') || container.parentElement!;

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-nrain-canvas';
    overlay.appendChild(canvas);

    const label = document.createElement('div');
    label.className = 'fx-nrain-label';
    label.textContent = 'ネオン接続 // NEON LINK';
    container.appendChild(label);

    const ctx = canvas.getContext('2d')!;
    canvas.width = overlay.clientWidth || window.innerWidth;
    canvas.height = overlay.clientHeight || window.innerHeight;

    const overlayStyle = getComputedStyle(overlay);
    const colorGreen = overlayStyle.getPropertyValue('--tfx-green').trim() || '#ff2d95';
    const colorCyan = overlayStyle.getPropertyValue('--tfx-cyan').trim() || '#00d4ff';

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    // Each column gets a color: primary or secondary
    const columnColors: string[] = [];
    for (let c = 0; c < columns; c++) {
      drops[c] = Math.floor(Math.random() * -30);
      columnColors[c] = Math.random() < 0.5 ? colorGreen : colorCyan;
    }

    const chars = 'アイウエオカキクケコサシスセソタチツテト' +
      '電脳網絡接続通信暗号解読' +
      '가나다라마바사아자차카타파하' +
      'กขคงจฉชซฌญฎฏ' +
      '01234567ABCDEF';

    (this as any)._running = true;

    // Use darker bg for trail effect
    const bgCS = getComputedStyle(overlay);
    const bgColor = bgCS.getPropertyValue('--tfx-bg').trim() || '#0a0012';

    const draw = () => {
      if (!(this as any)._running) return;

      // Semi-transparent bg for trail fade
      ctx.fillStyle = bgColor + '14'; // ~8% opacity hex
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize - 1}px 'MS Gothic', 'Noto Sans CJK', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const color = columnColors[i];

        // Bright head character
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillText(char, x, y);

        // Trail character (slightly behind)
        if (drops[i] > 1) {
          const trailChar = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = color;
          ctx.shadowBlur = 6;
          ctx.fillText(trailChar, x, y - fontSize);
        }

        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.97) {
          drops[i] = 0;
          // Occasionally swap color
          if (Math.random() < 0.3) {
            columnColors[i] = columnColors[i] === colorGreen ? colorCyan : colorGreen;
          }
        }
        drops[i]++;
      }

      (this as any)._rafId = requestAnimationFrame(draw);
    };

    (this as any)._rafId = requestAnimationFrame(draw);
  },

  destroy() {
    (this as any)._running = false;
    if ((this as any)._rafId) cancelAnimationFrame((this as any)._rafId);
  },
};
