import type { Effect } from './types';

export const spiritGateEffect: Effect = {
  id: 'spirit-gate',
  name: 'Spirit Gate',
  description: 'Kanji columns slide in like a torii gate, cherry-blossom particles fill the gap',
  duration: 2000,

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
      .fx-gate-text {
        position: relative;
        z-index: 10;
        font-size: 12px;
        letter-spacing: 3px;
        color: var(--tfx-cyan, #00d4ff);
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
        opacity: 0;
        transition: opacity 0.4s;
      }
      .fx-gate-text.visible { opacity: 1; }
    `;
    container.appendChild(style);

    const textEl = document.createElement('div');
    textEl.className = 'fx-gate-text';
    textEl.textContent = '通過 // PASSAGE';
    container.appendChild(textEl);

    const w = canvas.width;
    const h = canvas.height;

    // Kanji for the gate columns
    const gateKanji = '鳥居門神社光道霊魂永遠夢幻桜花風月星雲'.split('');
    const fontSize = 28;
    const columnChars = Math.ceil(h / fontSize);

    // Left and right column characters
    const leftCol: string[] = [];
    const rightCol: string[] = [];
    for (let i = 0; i < columnChars; i++) {
      leftCol.push(gateKanji[Math.floor(Math.random() * gateKanji.length)]);
      rightCol.push(gateKanji[Math.floor(Math.random() * gateKanji.length)]);
    }

    // Cherry blossom particles
    interface Petal {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      alpha: number;
      rotation: number;
      rotSpeed: number;
    }

    const overlayStyle = getComputedStyle(overlay);
    const colorGreen = overlayStyle.getPropertyValue('--tfx-green').trim() || '#ff2d95';
    const colorGreenDim = overlayStyle.getPropertyValue('--tfx-green-dim').trim() || '#ff71ce';
    const colorAmber = overlayStyle.getPropertyValue('--tfx-amber').trim() || '#b967ff';
    const colorRed = overlayStyle.getPropertyValue('--tfx-red').trim() || '#ff6b9d';
    const colorCyan = overlayStyle.getPropertyValue('--tfx-cyan').trim() || '#00d4ff';

    const petals: Petal[] = [];
    const petalColors = [colorGreen, colorGreenDim, colorRed, '#ffb3d9', '#ffffff'];

    const spawnPetals = (count: number) => {
      for (let i = 0; i < count; i++) {
        petals.push({
          x: w * 0.3 + Math.random() * w * 0.4,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 2 - 0.5,
          size: 2 + Math.random() * 4,
          alpha: 0.6 + Math.random() * 0.4,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    // Gate column positions (slide in from edges)
    const columnWidth = 60;
    const gateGap = 200;

    (this as any)._running = true;
    const startTime = performance.now();
    const duration = this.duration;

    const animate = (now: number) => {
      if (!(this as any)._running) return;

      const progress = Math.min((now - startTime) / duration, 1);

      // Clear with dark bg
      ctx.fillStyle = 'rgba(10, 0, 18, 0.12)';
      ctx.fillRect(0, 0, w, h);

      // Phase 1 (0-0.35): Gate columns slide in
      // Phase 2 (0.25-0.7): Cherry blossom burst
      // Phase 3 (0.6-1.0): Gate fades, text revealed

      // Gate column positions
      const leftTarget = (w - gateGap) / 2 - columnWidth;
      const rightTarget = (w + gateGap) / 2;

      let leftX: number;
      let rightX: number;
      let gateAlpha: number;

      if (progress < 0.35) {
        // Slide in
        const t = progress / 0.35;
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        leftX = -columnWidth + eased * (leftTarget + columnWidth);
        rightX = w - eased * (w - rightTarget);
        gateAlpha = 1;
      } else if (progress < 0.7) {
        leftX = leftTarget;
        rightX = rightTarget;
        gateAlpha = 1;
      } else {
        // Fade out
        const t = (progress - 0.7) / 0.3;
        leftX = leftTarget;
        rightX = rightTarget;
        gateAlpha = 1 - t;
      }

      // Draw gate columns
      ctx.font = `${fontSize}px 'MS Gothic', 'Noto Sans CJK', serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = gateAlpha;

      // Left column
      ctx.fillStyle = colorGreen;
      ctx.shadowColor = colorGreen;
      ctx.shadowBlur = 8;
      for (let i = 0; i < leftCol.length; i++) {
        ctx.fillText(leftCol[i], leftX + columnWidth / 2, i * fontSize + fontSize);
      }

      // Right column
      ctx.fillStyle = colorCyan;
      ctx.shadowColor = colorCyan;
      for (let i = 0; i < rightCol.length; i++) {
        ctx.fillText(rightCol[i], rightX + columnWidth / 2, i * fontSize + fontSize);
      }

      // Horizontal beam (torii crossbar)
      if (progress > 0.3) {
        const beamAlpha = gateAlpha * Math.min(1, (progress - 0.3) / 0.1);
        ctx.globalAlpha = beamAlpha;
        ctx.fillStyle = colorAmber;
        ctx.shadowColor = colorAmber;
        ctx.shadowBlur = 12;
        const beamY = h * 0.15;
        ctx.fillRect(leftX, beamY, rightX + columnWidth - leftX, 4);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Cherry blossom particles
      if (progress > 0.25 && progress < 0.8) {
        const spawnRate = progress < 0.5 ? 8 : 3;
        if (Math.random() < 0.5) spawnPetals(spawnRate);
      }

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.alpha -= 0.005;

        if (p.alpha <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          petals.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = petalColors[Math.floor(Math.random() * petalColors.length)];
        ctx.shadowColor = colorGreen;
        ctx.shadowBlur = 4;

        // Petal shape: small ellipse
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.globalAlpha = 1;

      // Reveal text
      if (progress > 0.6) {
        textEl.classList.add('visible');
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
