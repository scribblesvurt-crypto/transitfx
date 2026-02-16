import type { Effect } from './types';

export const channelFlipEffect: Effect = {
  id: 'channel-flip',
  name: 'Channel Flip',
  description: 'TV channel-change static burst with channel number overlay',
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
      .fx-chflip-channel {
        position: absolute;
        top: 30px;
        right: 40px;
        z-index: 10;
        font-size: 42px;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 0 10px rgba(255,255,255,0.7), 2px 2px 0 rgba(0,0,0,0.5);
        opacity: 0;
        transition: opacity 0.15s;
        font-family: 'Courier New', monospace;
      }
      .fx-chflip-channel.visible { opacity: 1; }
      .fx-chflip-bar {
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        display: flex;
        gap: 3px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .fx-chflip-bar.visible { opacity: 0.7; }
      .fx-chflip-pip {
        width: 6px;
        height: 6px;
        background: #555;
        border-radius: 50%;
      }
      .fx-chflip-pip.active {
        background: #fff;
        box-shadow: 0 0 4px #fff;
      }
    `;
    container.appendChild(style);

    // Channel number display
    const channelEl = document.createElement('div');
    channelEl.className = 'fx-chflip-channel';
    overlay.appendChild(channelEl);

    // Channel indicator pips
    const barEl = document.createElement('div');
    barEl.className = 'fx-chflip-bar';
    const channelCount = 5;
    for (let i = 0; i < channelCount; i++) {
      const pip = document.createElement('div');
      pip.className = 'fx-chflip-pip';
      barEl.appendChild(pip);
    }
    overlay.appendChild(barEl);

    (this as any)._running = true;
    const timers: number[] = [];

    // Static noise phase
    let phase: 'static' | 'flip' | 'settle' = 'static';
    let currentChannel = Math.floor(Math.random() * 80) + 10;
    let flipCount = 0;
    const maxFlips = 4;

    const showChannel = (ch: number, pipIdx: number) => {
      channelEl.textContent = 'CH ' + String(ch).padStart(2, '0');
      channelEl.classList.add('visible');
      barEl.classList.add('visible');
      const pips = barEl.querySelectorAll('.fx-chflip-pip');
      pips.forEach((p, i) => {
        p.classList.toggle('active', i <= pipIdx);
      });
    };

    // Schedule channel flips
    const flipInterval = 250;
    for (let f = 0; f < maxFlips; f++) {
      const t = window.setTimeout(() => {
        phase = 'flip';
        currentChannel += Math.floor(Math.random() * 10) + 1;
        flipCount++;
        showChannel(currentChannel, f);
      }, 200 + f * flipInterval);
      timers.push(t);
    }

    // Final settle
    const settleTimer = window.setTimeout(() => {
      phase = 'settle';
    }, 200 + maxFlips * flipInterval + 100);
    timers.push(settleTimer);

    const draw = () => {
      if (!(this as any)._running) return;

      if (phase === 'settle') {
        // Fade to dark
        ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Full static noise
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        // Use coarser pixels for performance
        const blockSize = 3;
        for (let y = 0; y < canvas.height; y += blockSize) {
          for (let x = 0; x < canvas.width; x += blockSize) {
            const v = Math.random() * 255;
            // Occasional color fringing
            const hasColor = Math.random() < 0.05;
            const r = hasColor ? Math.random() * 255 : v;
            const g = hasColor ? Math.random() * 100 : v;
            const b = hasColor ? Math.random() * 255 : v;
            const intensity = phase === 'flip' ? 180 : 120;
            for (let dy = 0; dy < blockSize && y + dy < canvas.height; dy++) {
              for (let dx = 0; dx < blockSize && x + dx < canvas.width; dx++) {
                const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = intensity;
              }
            }
          }
        }
        ctx.putImageData(imageData, 0, 0);

        // Horizontal tearing lines
        if (phase === 'flip') {
          for (let i = 0; i < 3; i++) {
            const y = Math.random() * canvas.height;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.15})`;
            ctx.fillRect(0, y, canvas.width, 2 + Math.random() * 6);
          }
        }
      }

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
