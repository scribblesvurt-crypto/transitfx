import type { Effect } from './types';

export const kanjiDecodeEffect: Effect = {
  id: 'kanji-decode',
  name: 'Kanji Decode',
  description: 'URL translates through scripts: Latin → Katakana → Kanji → decoded',
  duration: 2000,

  _timers: [] as number[],

  render(container: HTMLElement, targetUrl: string) {
    const style = document.createElement('style');
    style.textContent = `
      .fx-kanji-label {
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--tfx-amber, #b967ff);
        text-shadow: 0 0 8px rgba(185, 103, 255, 0.5);
        margin-bottom: 20px;
      }
      .fx-kanji-scramble {
        font-size: 16px;
        color: var(--tfx-green, #ff2d95);
        text-shadow: 0 0 8px rgba(255, 45, 149, 0.5);
        word-break: break-all;
        line-height: 2;
        min-height: 60px;
        margin-bottom: 24px;
        letter-spacing: 2px;
      }
      .fx-kanji-track {
        height: 2px;
        background: rgba(255, 45, 149, 0.15);
        border: 1px solid rgba(255, 45, 149, 0.2);
        margin-bottom: 12px;
        overflow: hidden;
      }
      .fx-kanji-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, var(--tfx-green, #ff2d95), var(--tfx-cyan, #00d4ff));
        box-shadow: 0 0 8px var(--tfx-green, #ff2d95);
        transition: width 0.05s linear;
      }
      .fx-kanji-status {
        font-size: 10px;
        color: var(--tfx-green-dim, #991a5c);
        letter-spacing: 2px;
      }
      .fx-kanji-resolved {
        color: var(--tfx-cyan, #00d4ff);
        text-shadow: 0 0 6px rgba(0, 212, 255, 0.6);
      }
    `;
    container.appendChild(style);

    const label = document.createElement('div');
    label.className = 'fx-kanji-label';
    label.textContent = '> 解読中...DECODING';
    container.appendChild(label);

    const scrambleEl = document.createElement('div');
    scrambleEl.className = 'fx-kanji-scramble';
    container.appendChild(scrambleEl);

    const track = document.createElement('div');
    track.className = 'fx-kanji-track';
    const bar = document.createElement('div');
    bar.className = 'fx-kanji-bar';
    track.appendChild(bar);
    container.appendChild(track);

    const statusEl = document.createElement('div');
    statusEl.className = 'fx-kanji-status';
    statusEl.textContent = 'スクリプト変換中...';
    container.appendChild(statusEl);

    // Character sets for each phase
    const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const kanji = '電脳網絡接続通信暗号解読転送変換認証起動制御光速量子';
    const hangul = '가나다라마바사아자차카타파하';
    const thai = 'กขคงจฉชซฌญฎฏฐ';

    const phases = [
      { chars: katakana, statusText: 'カタカナ変換...' },
      { chars: kanji + hangul, statusText: '漢字解読中...' },
      { chars: kanji + thai + hangul, statusText: '最終復号化...' },
    ];

    const urlChars = targetUrl.split('');
    const displayLen = Math.min(urlChars.length, 50);
    const resolved = new Array(displayLen).fill(false);
    const startTime = Date.now();
    const duration = this.duration;

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      bar.style.width = (progress * 100) + '%';

      // Determine current phase
      const phaseIdx = Math.min(Math.floor(progress * phases.length), phases.length - 1);
      const phase = phases[phaseIdx];
      statusEl.textContent = phase.statusText;

      const revealCount = Math.floor(progress * displayLen);
      for (let i = 0; i < revealCount; i++) resolved[i] = true;

      let display = '';
      for (let j = 0; j < displayLen; j++) {
        if (resolved[j]) {
          const ch = urlChars[j] === ' ' ? '&nbsp;' : urlChars[j].replace(/</g, '&lt;').replace(/>/g, '&gt;');
          display += `<span class="fx-kanji-resolved">${ch}</span>`;
        } else {
          display += phase.chars[Math.floor(Math.random() * phase.chars.length)];
        }
      }
      scrambleEl.innerHTML = display;

      if (progress >= 1) {
        window.clearInterval(timer);
        statusEl.textContent = '接続完了 // CONNECTION ESTABLISHED';
        statusEl.style.color = 'var(--tfx-cyan, #00d4ff)';
        statusEl.style.textShadow = '0 0 10px rgba(0, 212, 255, 0.6)';
      }
    }, 40);

    (this as any)._timers = [timer];
  },

  destroy() {
    ((this as any)._timers || []).forEach((t: number) => window.clearInterval(t));
    (this as any)._timers = [];
  },
};
