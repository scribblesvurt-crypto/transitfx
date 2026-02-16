import type { Effect } from './types';

export const curtainEffect: Effect = {
  id: 'curtain',
  name: 'Curtain',
  description: 'Two panels slide in from left and right',
  duration: 1100,

  render(container: HTMLElement, _targetUrl: string) {
    const overlay = container.closest('.transitfx-overlay') as HTMLElement;
    if (!overlay) return;

    const style = document.createElement('style');
    style.textContent = `
      .fx-curtain-left,
      .fx-curtain-right {
        position: absolute;
        top: 0;
        width: 50%;
        height: 100%;
        background: var(--tfx-bg, #1a1a1a);
        z-index: 5;
      }
      .fx-curtain-left {
        left: 0;
        transform: translateX(-100%);
        animation: fx-curtain-slide-right 0.5s ease-out forwards;
        border-right: 1px solid var(--tfx-green-dim, rgba(160,160,160,0.2));
      }
      .fx-curtain-right {
        right: 0;
        transform: translateX(100%);
        animation: fx-curtain-slide-left 0.5s ease-out forwards;
        border-left: 1px solid var(--tfx-green-dim, rgba(160,160,160,0.2));
      }
      @keyframes fx-curtain-slide-right {
        to { transform: translateX(0); }
      }
      @keyframes fx-curtain-slide-left {
        to { transform: translateX(0); }
      }
      .fx-curtain-center {
        position: relative;
        z-index: 10;
        opacity: 0;
        animation: fx-curtain-reveal 0.3s ease-out 0.45s forwards;
      }
      @keyframes fx-curtain-reveal {
        to { opacity: 1; }
      }
      .fx-curtain-line {
        width: 40px;
        height: 1px;
        background: var(--tfx-green-dim, #666);
        margin: 0 auto 12px;
      }
      .fx-curtain-text {
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--tfx-green-dim, #666);
      }
    `;
    container.appendChild(style);

    const left = document.createElement('div');
    left.className = 'fx-curtain-left';
    overlay.appendChild(left);

    const right = document.createElement('div');
    right.className = 'fx-curtain-right';
    overlay.appendChild(right);

    const center = document.createElement('div');
    center.className = 'fx-curtain-center';

    const line = document.createElement('div');
    line.className = 'fx-curtain-line';
    center.appendChild(line);

    const text = document.createElement('div');
    text.className = 'fx-curtain-text';
    text.textContent = 'LOADING';
    center.appendChild(text);

    container.appendChild(center);
  },

  destroy() {},
};
