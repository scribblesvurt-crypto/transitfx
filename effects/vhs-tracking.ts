import type { Effect } from './types';

export const vhsTrackingEffect: Effect = {
  id: 'vhs-tracking',
  name: 'VHS Tracking',
  description: 'Warped VHS tracking lines with static noise',
  duration: 1400,

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
      .fx-vhs-text {
        position: relative;
        z-index: 10;
        font-size: 14px;
        letter-spacing: 3px;
        color: #ddd;
        text-shadow: 2px 0 var(--tfx-red, #ff0040), -2px 0 var(--tfx-cyan, #00e5ff);
        opacity: 0;
        animation: fx-vhs-flicker 0.15s ease-in-out 0.3s forwards;
      }
      @keyframes fx-vhs-flicker {
        0% { opacity: 0; }
        50% { opacity: 0.7; }
        70% { opacity: 0.3; }
        100% { opacity: 0.9; }
      }
      .fx-vhs-rec {
        position: absolute;
        top: 20px;
        left: 24px;
        z-index: 10;
        font-size: 13px;
        color: var(--tfx-red, #ff0040);
        letter-spacing: 2px;
        animation: transitfx-pulse 0.6s ease-in-out infinite alternate;
      }
      .fx-vhs-timestamp {
        position: absolute;
        bottom: 20px;
        right: 24px;
        z-index: 10;
        font-size: 12px;
        color: #ddd;
        letter-spacing: 1px;
        opacity: 0.7;
      }
    `;
    container.appendChild(style);

    const text = document.createElement('div');
    text.className = 'fx-vhs-text';
    text.textContent = 'PLAY >';
    container.appendChild(text);

    const rec = document.createElement('div');
    rec.className = 'fx-vhs-rec';
    rec.textContent = 'REC';
    overlay.appendChild(rec);

    const timestamp = document.createElement('div');
    timestamp.className = 'fx-vhs-timestamp';
    const now = new Date();
    timestamp.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    overlay.appendChild(timestamp);

    const overlayStyle = getComputedStyle(overlay);
    const colorCyan = overlayStyle.getPropertyValue('--tfx-cyan').trim() || '#00e5ff';
    const colorRed = overlayStyle.getPropertyValue('--tfx-red').trim() || '#ff0040';

    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '');
      return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    }

    const [cR, cG, cB] = hexToRgb(colorCyan);
    const [rR, rG, rB] = hexToRgb(colorRed);

    (this as any)._running = true;
    let frame = 0;

    const draw = () => {
      if (!(this as any)._running) return;

      // Static noise
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 40;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 30 + Math.random() * 25;
      }

      ctx.putImageData(imageData, 0, 0);

      // Tracking bands — horizontal distortion lines
      const bandCount = 2 + Math.floor(Math.random() * 3);
      for (let b = 0; b < bandCount; b++) {
        const y = (frame * 3 + b * 180) % canvas.height;
        const h = 4 + Math.random() * 20;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.06})`;
        ctx.fillRect(0, y, canvas.width, h);

        // Horizontal offset for the band
        const offset = (Math.random() - 0.5) * 20;
        ctx.drawImage(canvas, 0, y, canvas.width, h, offset, y, canvas.width, h);
      }

      // Color separation line
      if (frame % 4 === 0) {
        const lineY = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(${cR}, ${cG}, ${cB}, 0.04)`;
        ctx.fillRect(0, lineY, canvas.width, 2);
        ctx.fillStyle = `rgba(${rR}, ${rG}, ${rB}, 0.04)`;
        ctx.fillRect(0, lineY + 2, canvas.width, 2);
      }

      frame++;
      (this as any)._rafId = requestAnimationFrame(draw);
    };

    (this as any)._rafId = requestAnimationFrame(draw);
  },

  destroy() {
    (this as any)._running = false;
    if ((this as any)._rafId) cancelAnimationFrame((this as any)._rafId);
    ((this as any)._timers || []).forEach((t: number) => clearTimeout(t));
  },
};
