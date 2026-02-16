import { getSettings, settingsStorage } from '@/lib/settings';
import { getEffect, getRandomEffect, getRandomFromPack, getPackForEffect, FILTER_PALETTES } from '@/effects';
import { createOverlayStyles, getCRTOverlayStyles } from '@/lib/overlay';
import { SPEED_MULTIPLIERS, type Effect, type ColorPalette } from '@/effects/types';
import { applyPageFilter, removePageFilter } from '@/lib/page-filter';
import { cyberpunkPack } from '@/effects';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    let currentEffect: Effect | null = null;
    let overlayRoot: HTMLElement | null = null;
    let navigateCallback: (() => void) | null = null;

    /** Check if extension context is still valid (false after extension reload) */
    function isContextValid(): boolean {
      try {
        return !!browser.runtime?.id;
      } catch {
        return false;
      }
    }

    // Verify filter against real settings (early content script already applied cache)
    (async () => {
      if (!isContextValid()) return;
      try {
        const s = await getSettings();
        if (s.pageFilter !== 'off') {
          applyPageFilter(s.pageFilter);
        } else {
          removePageFilter();
        }
      } catch {}
    })();

    // Watch for settings changes and update filter live
    settingsStorage.watch((newSettings) => {
      if (!isContextValid() || !newSettings) return;
      if (newSettings.pageFilter !== 'off') {
        applyPageFilter(newSettings.pageFilter);
      } else {
        removePageFilter();
      }
    });

    // Listen for skip command from background
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'skip-effect') {
        finishNow();
      }
    });


    function finishNow() {
      // Stop the effect but keep the overlay visible as a curtain
      // so the old page never peeks through before the new one loads.
      if (currentEffect) {
        currentEffect.destroy();
        currentEffect = null;
      }
      if (navigateCallback) {
        const cb = navigateCallback;
        navigateCallback = null;
        cb();
      }
      // overlayRoot is intentionally NOT removed —
      // it stays on screen until the browser tears down the page.
    }

    function cleanup() {
      if (currentEffect) {
        currentEffect.destroy();
        currentEffect = null;
      }
      if (overlayRoot) {
        overlayRoot.remove();
        overlayRoot = null;
      }
    }

    /** Hint the browser to start fetching the target page early */
    function prefetchUrl(url: string) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);

      // Also try preconnect for cross-origin
      try {
        const target = new URL(url);
        if (target.origin !== window.location.origin) {
          const preconnect = document.createElement('link');
          preconnect.rel = 'preconnect';
          preconnect.href = target.origin;
          document.head.appendChild(preconnect);
        }
      } catch {}
    }

    function shouldApplyOnSite(settings: Awaited<ReturnType<typeof getSettings>>): boolean {
      const hostname = window.location.hostname;
      if (settings.siteMode === 'all') return true;
      if (settings.siteMode === 'allowlist') {
        return settings.siteList.some(s => hostname.includes(s));
      }
      if (settings.siteMode === 'blocklist') {
        return !settings.siteList.some(s => hostname.includes(s));
      }
      return true;
    }

    function isNavigatingLink(el: HTMLElement): string | null {
      const anchor = el.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return null;

      const href = anchor.href;
      if (!href) return null;
      if (href.startsWith('javascript:')) return null;
      if (href.startsWith('#')) return null;
      if (anchor.getAttribute('href')?.startsWith('#')) return null;

      // Skip if it's a download link
      if (anchor.hasAttribute('download')) return null;

      // Skip same-page anchors
      try {
        const target = new URL(href, window.location.href);
        if (
          target.origin === window.location.origin &&
          target.pathname === window.location.pathname &&
          target.search === window.location.search &&
          target.hash !== ''
        ) {
          return null;
        }
      } catch {
        return null;
      }

      return href;
    }

    function prefersReducedMotion(): boolean {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /** Resolve the color palette for a given effect and filter setting */
    function resolveColors(effectId: string, pageFilter: string): ColorPalette {
      // Terminal filters override pack colors with monochrome palette
      const filterPalette = FILTER_PALETTES[pageFilter];
      if (filterPalette) return filterPalette;

      // For 'off' and 'crt', use the pack's native colors
      const pack = getPackForEffect(effectId);
      return pack?.colors ?? cyberpunkPack.colors;
    }

    async function playTransition(targetUrl: string, onNavigate: () => void) {
      if (!isContextValid()) { onNavigate(); return; }

      let settings;
      try {
        settings = await getSettings();
      } catch {
        onNavigate();
        return;
      }

      if (!settings.enabled || !shouldApplyOnSite(settings) || prefersReducedMotion()) {
        onNavigate();
        return;
      }

      // Start prefetching the target page immediately
      prefetchUrl(targetUrl);

      // Pick effect
      let effect: Effect;
      if (settings.selectedEffect === 'random') {
        effect = getRandomEffect();
      } else if (settings.selectedEffect.startsWith('random:')) {
        const packId = settings.selectedEffect.slice('random:'.length);
        effect = getRandomFromPack(packId) ?? getRandomEffect();
      } else {
        effect = getEffect(settings.selectedEffect) ?? getRandomEffect();
      }

      // Resolve colors: filter palette overrides pack colors for terminal filters
      const colors = resolveColors(effect.id, settings.pageFilter);

      // Calculate duration
      const multiplier = SPEED_MULTIPLIERS[settings.speed] ?? 1;
      const duration = settings.customDuration
        ? settings.customDuration
        : Math.round(effect.duration * multiplier);

      const originalDuration = effect.duration;
      effect.duration = duration;

      // Store navigate callback so skip/finish can trigger it
      navigateCallback = onNavigate;

      // Create overlay
      const host = document.createElement('div');
      host.id = 'transitfx-overlay-host';
      host.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;';
      document.documentElement.appendChild(host);
      overlayRoot = host;

      const shadow = host.attachShadow({ mode: 'closed' });

      const styleEl = document.createElement('style');
      let styles = createOverlayStyles(colors);
      // If CRT filter, add scanline overlay on the transition itself
      if (settings.pageFilter === 'crt') {
        styles += getCRTOverlayStyles();
      }
      styleEl.textContent = styles;
      shadow.appendChild(styleEl);

      const overlay = document.createElement('div');
      overlay.className = 'transitfx-overlay';
      overlay.style.setProperty('--tfx-green', colors.green);
      overlay.style.setProperty('--tfx-green-dim', colors.greenDim);
      overlay.style.setProperty('--tfx-amber', colors.amber);
      overlay.style.setProperty('--tfx-red', colors.red);
      overlay.style.setProperty('--tfx-cyan', colors.cyan);
      overlay.style.setProperty('--tfx-bg', colors.bg);

      const containerEl = document.createElement('div');
      containerEl.className = 'transitfx-container';
      overlay.appendChild(containerEl);

      const skipBtn = document.createElement('button');
      skipBtn.className = 'transitfx-skip';
      skipBtn.textContent = 'SKIP [ESC]';
      skipBtn.addEventListener('click', () => finishNow());
      overlay.appendChild(skipBtn);

      shadow.appendChild(overlay);
      host.style.pointerEvents = 'auto';

      // Render effect
      currentEffect = effect;
      effect.render(containerEl, targetUrl);

      // ESC to skip
      const escHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', escHandler);
          finishNow();
        }
      };
      document.addEventListener('keydown', escHandler);

      // When effect duration ends: start flash-out AND navigate simultaneously
      window.setTimeout(() => {
        effect.duration = originalDuration;
        document.removeEventListener('keydown', escHandler);
        overlay.classList.add('transitfx-flash-out');

        // Navigate immediately — don't wait for the flash animation to finish.
        // The browser will tear down the page anyway, and the flash provides
        // a visual "exit" even if the page starts unloading mid-animation.
        if (navigateCallback) {
          const cb = navigateCallback;
          navigateCallback = null;
          cb();
        }
        // cleanup will happen naturally when the page unloads
      }, duration);
    }

    // Event delegation for link clicks.
    // Uses capture phase to intercept before SPA routers, then re-dispatches
    // a synthetic click to let them handle it. If the SPA router calls
    // pushState/replaceState, we know it's an SPA nav and we bail out.
    document.addEventListener('click', (e) => {
      // Skip our own re-dispatched synthetic events
      if ((e as any)._transitfxSynthetic) return;

      const target = e.target as HTMLElement;
      const href = isNavigatingLink(target);
      if (!href) return;

      const anchor = target.closest('a') as HTMLAnchorElement;
      const isNewTab = anchor.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey;
      if (isNewTab) return;

      // Stop the real click from navigating
      e.preventDefault();
      e.stopImmediatePropagation();

      // Temporarily intercept pushState/replaceState to detect SPA navigation
      let spaNavigated = false;
      const origPushState = history.pushState;
      const origReplaceState = history.replaceState;

      history.pushState = function(...args: any[]) {
        spaNavigated = true;
        return origPushState.apply(history, args);
      };
      history.replaceState = function(...args: any[]) {
        spaNavigated = true;
        return origReplaceState.apply(history, args);
      };

      // Re-dispatch a synthetic click so SPA routers can handle it.
      // dispatchEvent is synchronous — all handlers fire before it returns.
      // Untrusted (synthetic) events don't trigger browser default navigation.
      const synthetic = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      });
      (synthetic as any)._transitfxSynthetic = true;
      anchor.dispatchEvent(synthetic);

      // Restore original methods
      history.pushState = origPushState;
      history.replaceState = origReplaceState;

      if (spaNavigated) {
        // SPA router handled it — don't interfere
        return;
      }

      // Regular full-page navigation — play transition
      playTransition(href, () => {
        window.location.href = href;
      });
    }, true);
  },
});
