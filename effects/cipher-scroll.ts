import type { Effect } from './types';

export const cipherScrollEffect: Effect = {
  id: 'cipher-scroll',
  name: 'Cipher Scroll',
  description: 'Horizontal scroll of mixed-script cipher text that locks in as it decodes the URL',
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
      .fx-cipher-decoded {
        position: relative;
        z-index: 10;
        font-size: 13px;
        color: var(--tfx-cyan, #00d4ff);
        text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
        word-break: break-all;
        letter-spacing: 1px;
        margin-bottom: 16px;
        min-height: 1.5em;
      }
      .fx-cipher-status {
        position: relative;
        z-index: 10;
        font-size: 10px;
        letter-spacing: 2px;
        color: var(--tfx-green-dim, #991a5c);
      }
    `;
    container.appendChild(style);

    const decodedEl = document.createElement('div');
    decodedEl.className = 'fx-cipher-decoded';
    container.appendChild(decodedEl);

    const statusEl = document.createElement('div');
    statusEl.className = 'fx-cipher-status';
    statusEl.textContent = '暗号解読 // DECIPHERING';
    container.appendChild(statusEl);

    const w = canvas.width;
    const h = canvas.height;
    const fontSize = 18;

    // Mixed-script characters
    const scripts = '漢字解読暗号電脳ハングルカタカナกขคงΔΩΣΞΛΠ01ABCDEF';

    // Create scrolling rows
    const rowCount = Math.floor(h / (fontSize * 2));
    const rows: { offset: number; speed: number; y: number; text: string[] }[] = [];

    for (let r = 0; r < rowCount; r++) {
      const charCount = Math.ceil(w / fontSize) + 10;
      const text: string[] = [];
      for (let c = 0; c < charCount; c++) {
        text.push(scripts[Math.floor(Math.random() * scripts.length)]);
      }
      rows.push({
        offset: 0,
        speed: 0.5 + Math.random() * 2,
        y: r * (fontSize * 2) + fontSize,
        text,
      });
    }

    const overlayStyle = getComputedStyle(overlay);
    const colorGreen = overlayStyle.getPropertyValue('--tfx-green').trim() || '#ff2d95';
    const colorAmber = overlayStyle.getPropertyValue('--tfx-amber').trim() || '#b967ff';
    const colorCyan = overlayStyle.getPropertyValue('--tfx-cyan').trim() || '#00d4ff';

    // Helper to parse hex to r,g,b
    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '');
      return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    }

    const [gR, gG, gB] = hexToRgb(colorGreen);
    const [cR, cG, cB] = hexToRgb(colorCyan);

    // Vertical neon accent lines
    const accentLines = [
      { x: w * 0.25, color: colorGreen },
      { x: w * 0.5, color: colorAmber },
      { x: w * 0.75, color: colorCyan },
    ];

    (this as any)._running = true;
    const startTime = performance.now();
    const duration = this.duration;

    let shortUrl = targetUrl;
    try { shortUrl = new URL(targetUrl).hostname + new URL(targetUrl).pathname; } catch {}
    if (shortUrl.length > 40) shortUrl = shortUrl.substring(0, 40) + '...';

    const animate = (now: number) => {
      if (!(this as any)._running) return;

      const progress = Math.min((now - startTime) / duration, 1);

      // Dark background
      ctx.fillStyle = 'rgba(10, 0, 18, 0.15)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px 'MS Gothic', 'Noto Sans CJK', monospace`;

      // Draw scrolling rows
      for (const row of rows) {
        row.offset += row.speed;
        if (row.offset > fontSize) {
          row.offset -= fontSize;
          row.text.push(scripts[Math.floor(Math.random() * scripts.length)]);
          row.text.shift();
        }

        const alpha = 0.3 + Math.random() * 0.2;
        // Alternate colors between primary and secondary
        const isEven = rows.indexOf(row) % 2 === 0;
        ctx.fillStyle = isEven
          ? `rgba(${gR}, ${gG}, ${gB}, ${alpha})`
          : `rgba(${cR}, ${cG}, ${cB}, ${alpha})`;

        for (let c = 0; c < row.text.length; c++) {
          const x = c * fontSize - row.offset;
          if (x > -fontSize && x < w + fontSize) {
            ctx.fillText(row.text[c], x, row.y);
          }
        }
      }

      // Vertical accent lines (pulse with progress)
      for (const line of accentLines) {
        const pulse = 0.1 + Math.sin(now / 200 + accentLines.indexOf(line)) * 0.1;
        ctx.strokeStyle = line.color;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(line.x, 0);
        ctx.lineTo(line.x, h);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Update decoded URL display
      const revealLen = Math.floor(progress * shortUrl.length);
      decodedEl.textContent = shortUrl.substring(0, revealLen) + (progress < 1 ? '█' : '');

      if (progress >= 1) {
        statusEl.textContent = '復号完了 // DECIPHERED';
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
