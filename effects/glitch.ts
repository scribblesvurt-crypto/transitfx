import type { Effect } from './types';

export const glitchEffect: Effect = {
  id: 'glitch',
  name: 'Glitch',
  description: 'Glitchy text distortion with scan bars',
  duration: 1800,

  _timers: [] as number[],

  render(container: HTMLElement, _targetUrl: string) {
    const style = document.createElement('style');
    style.textContent = `
      .fx-glitch-text {
        font-size: 28px;
        letter-spacing: 6px;
        color: var(--tfx-green, #00ff41);
        text-shadow: 0 0 10px rgba(0,255,65,0.6);
        position: relative;
        margin-bottom: 20px;
        animation: transitfx-glitch-skew 0.5s infinite linear alternate-reverse;
        display: inline-block;
      }
      .fx-glitch-text::before,
      .fx-glitch-text::after {
        content: attr(data-text);
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
      }
      .fx-glitch-text::before {
        animation: transitfx-glitch-1 0.3s infinite linear alternate-reverse;
        clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        color: var(--tfx-red, #ff0040);
        text-shadow: -2px 0 var(--tfx-cyan, #00e5ff);
      }
      .fx-glitch-text::after {
        animation: transitfx-glitch-2 0.3s infinite linear alternate-reverse;
        clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
        color: var(--tfx-cyan, #00e5ff);
        text-shadow: 2px 0 var(--tfx-red, #ff0040);
      }
      .fx-glitch-sub {
        font-size: 11px;
        color: var(--tfx-amber, #ffb000);
        letter-spacing: 3px;
        text-shadow: 0 0 5px rgba(255,176,0,0.4);
      }
      .fx-glitch-bar {
        position: absolute;
        left: 0;
        width: 100%;
        height: 3px;
        opacity: 0;
        z-index: 50;
        box-shadow: 0 0 10px var(--tfx-green, #00ff41);
      }
    `;
    container.appendChild(style);

    const glitchText = document.createElement('div');
    glitchText.className = 'fx-glitch-text';
    glitchText.setAttribute('data-text', 'SIGNAL LOCK');
    glitchText.textContent = 'SIGNAL LOCK';
    container.appendChild(glitchText);

    const subText = document.createElement('div');
    subText.className = 'fx-glitch-sub';
    subText.textContent = 'ACQUIRING TARGET FEED...';
    container.appendChild(subText);

    const overlay = container.closest('.transitfx-overlay') || container.parentElement!;

    const barTimer = window.setInterval(() => {
      const bar = document.createElement('div');
      bar.className = 'fx-glitch-bar';
      bar.style.top = Math.floor(Math.random() * 100) + '%';
      bar.style.height = (2 + Math.random() * 6) + 'px';
      bar.style.opacity = String(0.7 + Math.random() * 0.3);
      bar.style.background = Math.random() > 0.5 ? 'var(--tfx-green, #00ff41)' : 'var(--tfx-red, #ff0040)';
      overlay.appendChild(bar);
      setTimeout(() => bar.remove(), 100 + Math.random() * 150);
    }, 80);

    const finishTimer = window.setTimeout(() => {
      window.clearInterval(barTimer);
      glitchText.textContent = 'LOCKED';
      glitchText.setAttribute('data-text', 'LOCKED');
      subText.textContent = 'ROUTING COMPLETE';
      subText.style.color = 'var(--tfx-cyan, #00e5ff)';
    }, this.duration - 400);

    (this as any)._timers = [barTimer, finishTimer];
  },

  destroy() {
    const timers = (this as any)._timers || [];
    timers.forEach((t: number) => {
      window.clearInterval(t);
      window.clearTimeout(t);
    });
    (this as any)._timers = [];
  },
};
