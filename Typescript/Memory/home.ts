import './styles/styles.scss';

const playButton = document.querySelector<HTMLButtonElement>('#play-button');

if (playButton) {
  playButton.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
}
