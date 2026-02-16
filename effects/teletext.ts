import type { Effect } from './types';

export const teletextEffect: Effect = {
  id: 'teletext',
  name: 'Teletext',
  description: 'Ceefax/Teletext blocky character page with page number loading',
  duration: 1500,

  _timers: [] as number[],

  render(container: HTMLElement, targetUrl: string) {
    const style = document.createElement('style');
    style.textContent = `
      .fx-ttx-screen {
        text-align: left;
        max-width: 520px;
        margin: 0 auto;
        background: #000;
        padding: 16px 20px;
        border: 2px solid #333;
        font-size: 14px;
        line-height: 1.5;
      }
      .fx-ttx-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 2px solid #ffff00;
      }
      .fx-ttx-service {
        color: #fff;
        background: #ff0000;
        padding: 0 8px;
        font-weight: bold;
        letter-spacing: 1px;
      }
      .fx-ttx-page {
        color: #ffff00;
        letter-spacing: 2px;
      }
      .fx-ttx-body {
        color: #00ff41;
        min-height: 120px;
      }
      .fx-ttx-line {
        opacity: 0;
        transition: opacity 0.08s;
        white-space: pre;
      }
      .fx-ttx-line.visible { opacity: 1; }
      .fx-ttx-cyan { color: #00ffff; }
      .fx-ttx-yellow { color: #ffff00; }
      .fx-ttx-white { color: #ffffff; }
      .fx-ttx-red { color: #ff0000; }
      .fx-ttx-magenta { color: #ff00ff; }
      .fx-ttx-footer {
        margin-top: 8px;
        padding-top: 4px;
        border-top: 2px solid #00ffff;
        color: #00ffff;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
      }
      .fx-ttx-loading {
        color: #ffff00;
        animation: fx-ttx-blink 0.4s step-end infinite;
      }
      @keyframes fx-ttx-blink {
        50% { opacity: 0; }
      }
      .fx-ttx-block {
        display: inline-block;
        width: 1em;
        height: 1em;
        vertical-align: text-bottom;
      }
    `;
    container.appendChild(style);

    let hostname = 'unknown';
    try { hostname = new URL(targetUrl).hostname; } catch {}

    const pageNum = String(100 + Math.floor(Math.random() * 800));

    const screen = document.createElement('div');
    screen.className = 'fx-ttx-screen';

    // Header
    const header = document.createElement('div');
    header.className = 'fx-ttx-header';
    header.innerHTML = `<span class="fx-ttx-service">TRANSITFX</span><span class="fx-ttx-page">P${pageNum}</span>`;
    screen.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'fx-ttx-body';

    const blockChars = ['█', '▓', '▒', '░', '▄', '▀', '■', '▐', '▌'];

    const contentLines = [
      { text: '  ████ NAVIGATION SERVICE ████', cls: 'fx-ttx-yellow' },
      { text: '', cls: '' },
      { text: `  Destination: ${hostname}`, cls: 'fx-ttx-white' },
      { text: '', cls: '' },
      { text: '  Status: Connecting...', cls: 'fx-ttx-cyan' },
      { text: '', cls: '' },
      { text: `  ${blockChars.join(' ')} ${blockChars.join(' ')}`, cls: 'fx-ttx-magenta' },
      { text: '', cls: '' },
      { text: '  Route: SECURE', cls: 'fx-ttx-cyan' },
      { text: '  Protocol: HTTPS/TLS', cls: 'fx-ttx-cyan' },
      { text: '', cls: '' },
      { text: '  >>> LINK ESTABLISHED <<<', cls: 'fx-ttx-yellow' },
    ];

    const lineEls: HTMLDivElement[] = [];
    contentLines.forEach(line => {
      const el = document.createElement('div');
      el.className = 'fx-ttx-line' + (line.cls ? ' ' + line.cls : '');
      el.textContent = line.text;
      body.appendChild(el);
      lineEls.push(el);
    });
    screen.appendChild(body);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'fx-ttx-footer';
    footer.innerHTML = `<span>◄ 100  Main Index  ${pageNum} ►</span><span class="fx-ttx-loading">LOADING...</span>`;
    screen.appendChild(footer);

    container.appendChild(screen);

    // Reveal lines progressively
    const timers: number[] = [];
    const lineInterval = this.duration / (contentLines.length + 3);

    lineEls.forEach((el, idx) => {
      const t = window.setTimeout(() => {
        el.classList.add('visible');
      }, (idx + 1) * lineInterval);
      timers.push(t);
    });

    // Stop loading blink at end
    const endTimer = window.setTimeout(() => {
      const loading = footer.querySelector('.fx-ttx-loading');
      if (loading) {
        (loading as HTMLElement).style.animation = 'none';
        loading.textContent = 'READY';
      }
    }, this.duration - 200);
    timers.push(endTimer);

    (this as any)._timers = timers;
  },

  destroy() {
    ((this as any)._timers || []).forEach((t: number) => clearTimeout(t));
    (this as any)._timers = [];
  },
};
