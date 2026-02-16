import type { Effect } from './types';

export const dosBootEffect: Effect = {
  id: 'dos-boot',
  name: 'DOS Boot',
  description: 'Simulated BIOS/DOS boot sequence with POST checks',
  duration: 1800,

  _timers: [] as number[],

  render(container: HTMLElement, targetUrl: string) {
    const style = document.createElement('style');
    style.textContent = `
      .fx-dos-screen {
        text-align: left;
        max-width: 550px;
        margin: 0 auto;
        font-size: 13px;
        line-height: 1.6;
      }
      .fx-dos-line {
        opacity: 0;
        transition: opacity 0.05s;
        white-space: pre;
      }
      .fx-dos-line.visible {
        opacity: 1;
      }
      .fx-dos-ok {
        color: var(--tfx-green, #00ff41);
      }
      .fx-dos-warn {
        color: var(--tfx-amber, #ffb000);
      }
      .fx-dos-header {
        color: var(--tfx-cyan, #00e5ff);
        margin-bottom: 8px;
      }
      .fx-dos-dim {
        color: #555;
      }
      .fx-dos-cursor {
        display: inline-block;
        width: 8px;
        height: 13px;
        background: var(--tfx-green, #00ff41);
        animation: fx-dos-blink 0.5s step-end infinite;
        vertical-align: text-bottom;
      }
      @keyframes fx-dos-blink {
        50% { opacity: 0; }
      }
    `;
    container.appendChild(style);

    const screen = document.createElement('div');
    screen.className = 'fx-dos-screen';
    container.appendChild(screen);

    let hostname = 'unknown';
    try { hostname = new URL(targetUrl).hostname; } catch {}

    const bootLines = [
      { text: 'TransitFX BIOS v1.0', cls: 'fx-dos-header' },
      { text: 'Copyright (C) 2026 TransitFX Systems', cls: 'fx-dos-dim' },
      { text: '', cls: '' },
      { text: 'Memory Test: 640K OK', cls: 'fx-dos-ok' },
      { text: 'Detecting network adapter...    [OK]', cls: '' },
      { text: 'Loading routing tables...       [OK]', cls: '' },
      { text: `Resolving ${hostname}...`, cls: 'fx-dos-warn' },
      { text: 'DNS lookup complete.            [OK]', cls: 'fx-dos-ok' },
      { text: 'Establishing TCP connection...  [OK]', cls: '' },
      { text: 'TLS handshake...                [OK]', cls: 'fx-dos-ok' },
      { text: '', cls: '' },
      { text: 'Ready.', cls: 'fx-dos-ok' },
    ];

    const timers: number[] = [];
    const duration = this.duration;
    const lineInterval = duration / (bootLines.length + 2);

    bootLines.forEach((lineData, idx) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'fx-dos-line' + (lineData.cls ? ' ' + lineData.cls : '');
      lineEl.textContent = lineData.text;
      screen.appendChild(lineEl);

      const t = window.setTimeout(() => {
        lineEl.classList.add('visible');
      }, (idx + 1) * lineInterval);
      timers.push(t);
    });

    // Blinking cursor at the end
    const cursorLine = document.createElement('div');
    cursorLine.className = 'fx-dos-line';
    const cursor = document.createElement('span');
    cursor.className = 'fx-dos-cursor';
    const prompt = document.createTextNode('C:\\> ');
    cursorLine.appendChild(prompt);
    cursorLine.appendChild(cursor);
    screen.appendChild(cursorLine);

    const cursorTimer = window.setTimeout(() => {
      cursorLine.classList.add('visible');
    }, (bootLines.length + 1) * lineInterval);
    timers.push(cursorTimer);

    (this as any)._timers = timers;
  },

  destroy() {
    ((this as any)._timers || []).forEach((t: number) => window.clearTimeout(t));
    (this as any)._timers = [];
  },
};
