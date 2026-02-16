import { getSettings, updateSettings } from '@/lib/settings';
import { packs } from '@/effects';

async function init() {
  const settings = await getSettings();

  // Toggle
  const toggleEl = document.getElementById('toggle-enabled') as HTMLInputElement;
  toggleEl.checked = settings.enabled;
  toggleEl.addEventListener('change', () => updateSettings({ enabled: toggleEl.checked }));

  // Random button
  const randomBtn = document.getElementById('random-btn')!;
  if (settings.selectedEffect === 'random') randomBtn.classList.add('active');
  randomBtn.addEventListener('click', () => selectEffect('random'));

  // Build pack sections
  const packsContainer = document.getElementById('packs-container')!;
  const allButtons: HTMLElement[] = [randomBtn];

  for (const pack of packs) {
    const packEl = document.createElement('div');
    packEl.className = 'pack';

    // Header
    const header = document.createElement('div');
    header.className = 'pack-header';

    const name = document.createElement('span');
    name.className = 'pack-name';
    name.textContent = pack.name;
    header.appendChild(name);

    packEl.appendChild(header);

    // Description
    const desc = document.createElement('div');
    desc.className = 'pack-desc';
    desc.textContent = pack.description;
    packEl.appendChild(desc);

    // Effect grid
    const grid = document.createElement('div');
    grid.className = 'effect-grid';

    // Per-pack random button
    const packRandomId = `random:${pack.id}`;
    const packRandomBtn = document.createElement('button');
    packRandomBtn.className = 'effect-btn pack-random-btn';
    if (settings.selectedEffect === packRandomId) packRandomBtn.classList.add('active');
    packRandomBtn.textContent = 'RANDOM';
    packRandomBtn.dataset.effect = packRandomId;
    packRandomBtn.addEventListener('click', () => selectEffect(packRandomId));
    grid.appendChild(packRandomBtn);
    allButtons.push(packRandomBtn);

    for (const effect of pack.effects) {
      const btn = document.createElement('button');
      btn.className = 'effect-btn';
      if (settings.selectedEffect === effect.id) btn.classList.add('active');
      btn.textContent = effect.name.toUpperCase();
      btn.dataset.effect = effect.id;
      btn.addEventListener('click', () => selectEffect(effect.id));
      grid.appendChild(btn);
      allButtons.push(btn);
    }

    packEl.appendChild(grid);
    packsContainer.appendChild(packEl);
  }

  function selectEffect(effectId: string) {
    updateSettings({ selectedEffect: effectId });
    for (const btn of allButtons) {
      btn.classList.toggle('active', btn.dataset.effect === effectId);
    }
  }

  // Speed controls
  const speedControls = document.getElementById('speed-controls')!;
  speedControls.querySelectorAll('.speed-btn').forEach((btn) => {
    const speedBtn = btn as HTMLElement;
    speedBtn.classList.toggle('active', speedBtn.dataset.speed === settings.speed);

    speedBtn.addEventListener('click', () => {
      const speed = speedBtn.dataset.speed as 'fast' | 'normal' | 'slow';
      updateSettings({ speed });
      speedControls.querySelectorAll('.speed-btn').forEach((b) => {
        (b as HTMLElement).classList.toggle('active', (b as HTMLElement).dataset.speed === speed);
      });
    });
  });

  // Page filter controls
  const filterControls = document.getElementById('filter-controls')!;
  filterControls.querySelectorAll('.speed-btn').forEach((btn) => {
    const filterBtn = btn as HTMLElement;
    const filterId = filterBtn.dataset.filter!;
    filterBtn.classList.toggle('active', filterId === settings.pageFilter);

    filterBtn.addEventListener('click', () => {
      updateSettings({ pageFilter: filterId as typeof settings.pageFilter });
      filterControls.querySelectorAll('.speed-btn').forEach((b) => {
        (b as HTMLElement).classList.toggle('active', (b as HTMLElement).dataset.filter === filterId);
      });
    });
  });

  // Options link
  document.getElementById('options-link')!.addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.openOptionsPage();
  });
}

init();
