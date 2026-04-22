import './styles/styles.scss';

const form = document.querySelector<HTMLFormElement>('#settings-form');
const startButton = document.querySelector<HTMLButtonElement>('#start-button');
const previewImage = document.querySelector<HTMLImageElement>('#preview-image');

function getRadioValue(name: string): string {
  const el = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

function updatePreview(): void {
  if (!previewImage) return;
  const theme = getRadioValue('theme');
  const src = previewImage.dataset[theme] || previewImage.dataset['code'] || '';
  if (previewImage.src !== src) {
    previewImage.src = src;
  }
}

function restoreSettings(): void {
  const theme = localStorage.getItem('theme') || 'code';
  const player = localStorage.getItem('player') || 'blue';
  const board = localStorage.getItem('board') || '16';

  const themeInput = document.querySelector<HTMLInputElement>(`input[name="theme"][value="${theme}"]`);
  const playerInput = document.querySelector<HTMLInputElement>(`input[name="player"][value="${player}"]`);
  const boardInput = document.querySelector<HTMLInputElement>(`input[name="board"][value="${board}"]`);

  if (themeInput && !themeInput.disabled) themeInput.checked = true;
  if (playerInput) playerInput.checked = true;
  if (boardInput) boardInput.checked = true;

  updatePreview();
}

if (form) {
  form.addEventListener('change', () => updatePreview());
}

if (startButton) {
  startButton.addEventListener('click', () => {
    const theme = getRadioValue('theme');
    const player = getRadioValue('player');
    const board = getRadioValue('board');

    if (theme) localStorage.setItem('theme', theme);
    if (player) localStorage.setItem('player', player);
    if (board) localStorage.setItem('board', board);

    window.location.href = 'index.html';
  });
}

restoreSettings();
