import './styles/styles.scss';

const winner = localStorage.getItem('winner') as 'blue' | 'orange' | 'tie' | null;
const scoreBlue = parseInt(localStorage.getItem('score-blue') || '0', 10);
const scoreOrange = parseInt(localStorage.getItem('score-orange') || '0', 10);
const theme = localStorage.getItem('theme') || 'code';

document.body.dataset.theme = theme;

const finalBlue = document.querySelector<HTMLElement>('#final-blue');
const finalOrange = document.querySelector<HTMLElement>('#final-orange');
if (finalBlue) finalBlue.textContent = String(scoreBlue);
if (finalOrange) finalOrange.textContent = String(scoreOrange);

if (theme !== 'games') {
  const pawn = document.querySelector<HTMLImageElement>('#winner-pawn');
  const playerLabel = document.querySelector<HTMLElement>('#winner-player');

  if (winner === 'blue') {
    if (pawn) pawn.src = '/assets/icons/chess_pawn-winner-blue.png';
    if (playerLabel) playerLabel.textContent = 'Blue';
  } else if (winner === 'orange') {
    if (pawn) pawn.src = '/assets/icons/chess_pawn-win.png';
    if (playerLabel) playerLabel.textContent = 'Orange';
  } else {
    if (pawn) pawn.classList.add('winner__pawn--tie');
    if (playerLabel) playerLabel.textContent = "It's a Tie!";
  }
} else {
  const gamingPlayer = document.querySelector<HTMLElement>('#winner-gaming-player');
  if (gamingPlayer) {
    gamingPlayer.classList.remove(
      'winner__gaming-player--blue',
      'winner__gaming-player--orange',
      'winner__gaming-player--tie'
    );
    if (winner === 'blue') {
      gamingPlayer.textContent = 'Blue Player';
      gamingPlayer.classList.add('winner__gaming-player--blue');
    } else if (winner === 'orange') {
      gamingPlayer.textContent = 'Orange Player';
      gamingPlayer.classList.add('winner__gaming-player--orange');
    } else {
      gamingPlayer.textContent = "It's a Tie!";
      gamingPlayer.classList.add('winner__gaming-player--tie');
    }
  }
}

const backBtn = document.querySelector<HTMLButtonElement>('#back-to-settings');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
}
