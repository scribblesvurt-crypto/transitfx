import type { Effect } from './types';

export const slideEffect: Effect = {
  id: 'slide',
  name: 'Slide',
  description: 'Panel slides up with a progress bar',
  duration: 1000,

  _timer: 0 as number,

  render(container: HTMLElement, _targetUrl: string) {
    const overlay = container.closest('.transitfx-overlay') as HTMLElement;

    const style = document.createElement('style');
    style.textContent = `
      .fx-slide-overlay-anim {
        animation: fx-slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      @keyframes fx-slide-up {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      .fx-slide-progress-track {
        width: 120px;
        height: 2px;
        background: rgba(160,160,160,0.15);
        margin: 0 auto 14px;
        overflow: hidden;
        border-radius: 1px;
        opacity: 0;
        animation: fx-slide-fade 0.3s ease-out 0.35s forwards;
      }
      .fx-slide-progress-bar {
        height: 100%;
        width: 0%;
        background: var(--tfx-green, #a0a0a0);
        transition: width 0.05s linear;
      }
      @keyframes fx-slide-fade {
        to { opacity: 1; }
      }
      .fx-slide-text {
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--tfx-green-dim, #666);
        opacity: 0;
        animation: fx-slide-fade 0.3s ease-out 0.4s forwards;
      }
    `;
    container.appendChild(style);

    if (overlay) {
      overlay.style.transform = 'translateY(100%)';
      overlay.classList.add('fx-slide-overlay-anim');
    }

    const track = document.createElement('div');
    track.className = 'fx-slide-progress-track';
    const bar = document.createElement('div');
    bar.className = 'fx-slide-progress-bar';
    track.appendChild(bar);
    container.appendChild(track);

    const text = document.createElement('div');
    text.className = 'fx-slide-text';
    text.textContent = 'LOADING';
    container.appendChild(text);

    // Animate progress bar
    const startTime = Date.now();
    const duration = this.duration;
    const timer = window.setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      bar.style.width = (progress * 100) + '%';
      if (progress >= 1) window.clearInterval(timer);
    }, 40);

    (this as any)._timer = timer;
  },

  destroy() {
    if ((this as any)._timer) window.clearInterval((this as any)._timer);
  },
};
