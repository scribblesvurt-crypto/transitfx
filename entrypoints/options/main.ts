import { getSettings, updateSettings } from '@/lib/settings';
import { packs } from '@/effects';

let saveTimeout: number;

function flashSaved() {
  const el = document.getElementById('save-status')!;
  el.classList.add('visible');
  clearTimeout(saveTimeout);
  saveTimeout = window.setTimeout(() => el.classList.remove('visible'), 1500);
}

async function save(partial: Parameters<typeof updateSettings>[0]) {
  await updateSettings(partial);
  flashSaved();
}

async function init() {
  const settings = await getSettings();

  // Enabled
  const enabledEl = document.getElementById('opt-enabled') as HTMLInputElement;
  enabledEl.checked = settings.enabled;
  enabledEl.addEventListener('change', () => save({ enabled: enabledEl.checked }));

  // Effect select — grouped by pack
  const effectEl = document.getElementById('opt-effect') as HTMLSelectElement;

  const randomOpt = document.createElement('option');
  randomOpt.value = 'random';
  randomOpt.textContent = 'Random (all available)';
  effectEl.appendChild(randomOpt);

  for (const pack of packs) {
    const group = document.createElement('optgroup');
    group.label = pack.name;

    const packRandomOpt = document.createElement('option');
    const packRandomId = `random:${pack.id}`;
    packRandomOpt.value = packRandomId;
    packRandomOpt.textContent = `Random (${pack.name})`;
    group.appendChild(packRandomOpt);

    for (const effect of pack.effects) {
      const opt = document.createElement('option');
      opt.value = effect.id;
      opt.textContent = effect.name;
      group.appendChild(opt);
    }

    effectEl.appendChild(group);
  }

  effectEl.value = settings.selectedEffect;
  effectEl.addEventListener('change', () => save({ selectedEffect: effectEl.value }));

  // Speed
  const speedEl = document.getElementById('opt-speed') as HTMLSelectElement;
  speedEl.value = settings.speed;
  speedEl.addEventListener('change', () => save({ speed: speedEl.value as 'fast' | 'normal' | 'slow' }));

  // Page filter
  const pageFilterEl = document.getElementById('opt-page-filter') as HTMLSelectElement;
  pageFilterEl.value = settings.pageFilter;
  pageFilterEl.addEventListener('change', () => save({ pageFilter: pageFilterEl.value as typeof settings.pageFilter }));

  // Site mode
  const siteModeEl = document.getElementById('opt-site-mode') as HTMLSelectElement;
  siteModeEl.value = settings.siteMode;
  siteModeEl.addEventListener('change', () => save({ siteMode: siteModeEl.value as 'all' | 'allowlist' | 'blocklist' }));

  // Site list
  const siteListEl = document.getElementById('opt-site-list') as HTMLTextAreaElement;
  siteListEl.value = settings.siteList.join('\n');
  siteListEl.addEventListener('change', () => {
    const list = siteListEl.value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    save({ siteList: list });
  });
}

init();
