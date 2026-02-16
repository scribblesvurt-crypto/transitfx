import type { Effect } from './types';

export const decryptEffect: Effect = {
  id: 'decrypt',
  name: 'Decrypt',
  description: 'Scrambled characters gradually reveal the target URL',
  duration: 1800,

  _timers: [] as number[],

  render(container: HTMLElement, targetUrl: string) {
    const style = document.createElement('style');
    style.textContent = `
      .fx-decrypt-label {
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--tfx-amber, #ffb000);
        text-shadow: 0 0 5px rgba(255,176,0,0.5);
        margin-bottom: 20px;
      }
      .fx-decrypt-scramble {
        font-size: 13px;
        color: var(--tfx-green, #00ff41);
        text-shadow: 0 0 5px rgba(0,255,65,0.5);
        word-break: break-all;
        line-height: 1.8;
        min-height: 60px;
        margin-bottom: 24px;
      }
      .fx-decrypt-track {
        height: 2px;
        background: #1a1a1a;
        border: 1px solid rgba(0,255,65,0.15);
        margin-bottom: 12px;
        overflow: hidden;
      }
      .fx-decrypt-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, var(--tfx-green, #00ff41), var(--tfx-cyan, #00e5ff));
        box-shadow: 0 0 8px var(--tfx-green, #00ff41);
        transition: width 0.05s linear;
      }
      .fx-decrypt-status {
        font-size: 10px;
        color: var(--tfx-green-dim, #00aa2a);
        letter-spacing: 2px;
      }
      .fx-decrypt-revealed {
        color: var(--tfx-cyan, #00e5ff);
      }
    `;
    container.appendChild(style);

    const label = document.createElement('div');
    label.className = 'fx-decrypt-label';
    label.textContent = '> DECRYPTING INTEL FEED';
    container.appendChild(label);

    const scrambleEl = document.createElement('div');
    scrambleEl.className = 'fx-decrypt-scramble';
    container.appendChild(scrambleEl);

    const track = document.createElement('div');
    track.className = 'fx-decrypt-track';
    const bar = document.createElement('div');
    bar.className = 'fx-decrypt-bar';
    track.appendChild(bar);
    container.appendChild(track);

    const statusEl = document.createElement('div');
    statusEl.className = 'fx-decrypt-status';
    statusEl.textContent = 'ROUTING THROUGH SECURE PROXY...';
    container.appendChild(statusEl);

    const chars = '0123456789ABCDEF!@#$%^&*()_+-=[]{}|;:<>?/~';
    const urlChars = targetUrl.split('');
    const displayLen = Math.min(urlChars.length, 60);
    const resolved = new Array(displayLen).fill(false);
    const startTime = Date.now();
    const duration = this.duration;

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      bar.style.width = (progress * 100) + '%';

      const revealCount = Math.floor(progress * displayLen);
      for (let i = 0; i < revealCount; i++) resolved[i] = true;

      let display = '';
      for (let j = 0; j < displayLen; j++) {
        if (resolved[j]) {
          const ch = urlChars[j] === ' ' ? '&nbsp;' : urlChars[j].replace(/</g, '&lt;').replace(/>/g, '&gt;');
          display += `<span class="fx-decrypt-revealed">${ch}</span>`;
        } else {
          display += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      scrambleEl.innerHTML = display;

      if (progress >= 1) {
        window.clearInterval(timer);
        statusEl.textContent = 'CONNECTION ESTABLISHED';
        statusEl.style.color = 'var(--tfx-cyan, #00e5ff)';
        statusEl.style.textShadow = '0 0 10px rgba(0,229,255,0.6)';
      }
    }, 40);

    (this as any)._timers = [timer];
  },

  destroy() {
    ((this as any)._timers || []).forEach((t: number) => window.clearInterval(t));
    (this as any)._timers = [];
  },
};
