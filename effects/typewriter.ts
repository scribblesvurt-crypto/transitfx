import type { Effect } from './types';

export const typewriterEffect: Effect = {
  id: 'typewriter',
  name: 'Typewriter',
  description: 'Characters typed out one by one with a blinking cursor',
  duration: 1500,

  _timers: [] as number[],

  render(container: HTMLElement, targetUrl: string) {
    const style = document.createElement('style');
    style.textContent = `
      .fx-type-screen {
        text-align: left;
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid rgba(0,255,65,0.1);
        background: rgba(0,0,0,0.3);
        min-height: 120px;
      }
      .fx-type-line {
        font-size: 13px;
        color: var(--tfx-green, #00ff41);
        line-height: 1.8;
        min-height: 1.8em;
      }
      .fx-type-prompt {
        color: var(--tfx-amber, #ffb000);
      }
      .fx-type-url {
        color: var(--tfx-cyan, #00e5ff);
        word-break: break-all;
      }
      .fx-type-cursor {
        display: inline-block;
        width: 8px;
        height: 14px;
        background: var(--tfx-green, #00ff41);
        animation: fx-type-blink 0.5s step-end infinite;
        vertical-align: text-bottom;
        margin-left: 2px;
      }
      @keyframes fx-type-blink {
        50% { opacity: 0; }
      }
      .fx-type-ok {
        color: var(--tfx-green, #00ff41);
      }
    `;
    container.appendChild(style);

    const screen = document.createElement('div');
    screen.className = 'fx-type-screen';
    container.appendChild(screen);

    let shortUrl = targetUrl;
    try { shortUrl = new URL(targetUrl).hostname + new URL(targetUrl).pathname; } catch {}
    if (shortUrl.length > 40) shortUrl = shortUrl.substring(0, 40) + '...';

    const lines = [
      { prefix: 'C:\\> ', text: `cd ${shortUrl}`, prefixClass: 'fx-type-prompt', textClass: 'fx-type-url' },
      { prefix: '', text: 'Connecting...', prefixClass: '', textClass: '' },
      { prefix: '', text: 'Route established.', prefixClass: '', textClass: '' },
      { prefix: '', text: '[OK]', prefixClass: '', textClass: 'fx-type-ok' },
    ];

    const timers: number[] = [];
    let lineDelay = 0;
    const charSpeed = 30;

    lines.forEach((lineData, lineIdx) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'fx-type-line';
      screen.appendChild(lineEl);

      const fullText = lineData.prefix + lineData.text;
      let charIdx = 0;

      const t = window.setTimeout(() => {
        const cursor = document.createElement('span');
        cursor.className = 'fx-type-cursor';

        const typeTimer = window.setInterval(() => {
          if (charIdx < fullText.length) {
            // Remove cursor, add char, re-add cursor
            cursor.remove();

            const ch = fullText[charIdx];
            if (charIdx < lineData.prefix.length) {
              let prefixSpan = lineEl.querySelector('.fx-type-prefix') as HTMLSpanElement;
              if (!prefixSpan) {
                prefixSpan = document.createElement('span');
                prefixSpan.className = 'fx-type-prefix ' + lineData.prefixClass;
                lineEl.appendChild(prefixSpan);
              }
              prefixSpan.textContent += ch;
            } else {
              let textSpan = lineEl.querySelector('.fx-type-content') as HTMLSpanElement;
              if (!textSpan) {
                textSpan = document.createElement('span');
                textSpan.className = 'fx-type-content ' + lineData.textClass;
                lineEl.appendChild(textSpan);
              }
              textSpan.textContent += ch;
            }

            lineEl.appendChild(cursor);
            charIdx++;
          } else {
            cursor.remove();
            window.clearInterval(typeTimer);
            // Add cursor to next line if there is one
            if (lineIdx < lines.length - 1) {
              // cursor moves to next line
            } else {
              lineEl.appendChild(cursor);
            }
          }
        }, charSpeed);
        timers.push(typeTimer);
      }, lineDelay);
      timers.push(t);

      lineDelay += fullText.length * charSpeed + 200;
    });

    (this as any)._timers = timers;
  },

  destroy() {
    ((this as any)._timers || []).forEach((t: number) => {
      window.clearInterval(t);
      window.clearTimeout(t);
    });
    (this as any)._timers = [];
  },
};
