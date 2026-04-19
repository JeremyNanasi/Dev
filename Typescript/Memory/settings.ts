import './styles/styles.scss';

type Theme = 'code' | 'games' | 'da-projects' | 'foods';
type Player = 'blue' | 'orange';
type BoardSize = '16' | '24' | '36';

interface SettingsState {
  theme: Theme;
  player: Player | null;
  board: BoardSize | null;
}

const state: SettingsState = {
  theme: (localStorage.getItem('theme') as Theme) || 'code',
  player: (localStorage.getItem('player') as Player) || null,
  board: (localStorage.getItem('board') as BoardSize) || null,
};

function $<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function $$<T extends HTMLElement>(selector: string): T[] {
  return Array.from(document.querySelectorAll<T>(selector));
}

function restoreSelection(): void {
  const applied: Array<[string, string | null]> = [
    ['theme', state.theme],
    ['player', state.player],
    ['board', state.board],
  ];

  applied.forEach(([name, value]) => {
    if (!value) return;
    const input = $<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  });
}

function updatePreviewImage(theme: Theme): void {
  const img = $<HTMLImageElement>('#preview-image');
  if (!img) return;
  const attr = `data-${theme}`;
  const src = img.getAttribute(attr);
  if (src) img.src = src;
}

function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (target.type !== 'radio') return;

  const name = target.name as keyof SettingsState;
  const value = target.value;

  (state as Record<string, unknown>)[name] = value;
  localStorage.setItem(name, value);

  if (name === 'theme') updatePreviewImage(value as Theme);
}

function isReady(): boolean {
  return Boolean(state.theme && state.player && state.board);
}

function updateStartState(): void {
  const start = $<HTMLButtonElement>('#start-button');
  if (!start) return;
  start.disabled = !isReady();
  start.style.opacity = isReady() ? '1' : '0.55';
  start.style.cursor = isReady() ? 'pointer' : 'not-allowed';
}

function handleStart(): void {
  if (!isReady()) return;
  window.location.href = 'index.html';
}

function init(): void {
  const form = $<HTMLFormElement>('#settings-form');
  if (form) {
    form.addEventListener('change', (e) => {
      handleChange(e);
      updateStartState();
    });
  }

  $<HTMLButtonElement>('#start-button')?.addEventListener('click', handleStart);

  restoreSelection();
  updatePreviewImage(state.theme);
  updateStartState();
}

init();
