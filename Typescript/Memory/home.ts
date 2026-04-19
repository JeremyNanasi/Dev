import './styles/styles.scss';

function init(): void {
  const playButton = document.getElementById('play-button') as HTMLButtonElement | null;
  if (!playButton) return;

  playButton.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
}

init();
