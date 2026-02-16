import type { Effect } from './types';

export const blindsEffect: Effect = {
  id: 'blinds',
  name: 'Blinds',
  description: 'Horizontal slats close like venetian blinds',
  duration: 1100,

  render(container: HTMLElement, _targetUrl: string) {
    const overlay = container.closest('.transitfx-overlay') as HTMLElement;
    if (!overlay) return;

    const slatCount = 12;
    const style = document.createElement('style');
    style.textContent = `
      .fx-blinds-slat {
        position: absolute;
        left: 0;
        width: 100%;
        background: var(--tfx-bg, #1a1a1a);
        transform: scaleY(0);
        transform-origin: top;
        z-index: 5;
        border-bottom: 1px solid var(--tfx-green-dim, rgba(160,160,160,0.1));
      }
      .fx-blinds-text {
        position: relative;
        z-index: 10;
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--tfx-green-dim, #666);
        opacity: 0;
        animation: fx-blinds-fade 0.3s ease-out 0.7s forwards;
      }
      @keyframes fx-blinds-fade {
        to { opacity: 1; }
      }
    `;
    container.appendChild(style);

    const slatHeight = 100 / slatCount;

    for (let i = 0; i < slatCount; i++) {
      const slat = document.createElement('div');
      slat.className = 'fx-blinds-slat';
      slat.style.top = (i * slatHeight) + '%';
      slat.style.height = slatHeight + '%';
      slat.style.transition = `transform 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${i * 40}ms`;
      overlay.appendChild(slat);

      // Trigger after a frame so the transition fires
      requestAnimationFrame(() => {
        slat.style.transform = 'scaleY(1)';
      });
    }

    const text = document.createElement('div');
    text.className = 'fx-blinds-text';
    text.textContent = 'LOADING';
    container.appendChild(text);
  },

  destroy() {},
};
