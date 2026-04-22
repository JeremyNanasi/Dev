import './styles/styles.scss';

type Theme = "code" | "games";
type Player = "blue" | "orange";
type BoardSize = 16 | 24 | 36;

interface Card {
  id: number;
  image: string;
  matched: boolean;
  revealed: boolean;
}

const DEFAULT_THEME: Theme = "code";
const DEFAULT_BOARD: BoardSize = 16;
const DEFAULT_PLAYER: Player = "blue";

const GAMES_FACES: string[] = [3, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 17, 18, 19]
  .map((n) => `/assets/games-themes/Asset ${n}@2x 1.svg`);

const FACE_COUNTS: Record<Theme, number> = {
  code: 15,
  games: GAMES_FACES.length,
};

const GRID_COLS: Record<BoardSize, number> = {
  16: 4,
  24: 6,
  36: 6,
};

function readTheme(): Theme {
  const v = localStorage.getItem("theme");
  return v === "games" ? "games" : DEFAULT_THEME;
}

function readBoard(): BoardSize {
  const raw = parseInt(localStorage.getItem("board") || "", 10);
  if (raw === 24) return 24;
  if (raw === 36) return 36;
  return DEFAULT_BOARD;
}

function readPlayer(): Player {
  const v = localStorage.getItem("player");
  return v === "orange" ? "orange" : DEFAULT_PLAYER;
}

function getBackImage(theme: Theme): string {
  if (theme === "code") return "/assets/code-themes/card-1.jpg";
  return "";
}

function getFaceImage(theme: Theme, pairIndex: number): string {
  if (theme === "games") {
    return GAMES_FACES[(pairIndex - 1) % GAMES_FACES.length];
  }
  const n = ((pairIndex - 1) % FACE_COUNTS.code) + 2;
  return `/assets/code-themes/card-${n}.jpg`;
}

function createCards(pairCount: number, theme: Theme): Card[] {
  const available = theme === "games" ? GAMES_FACES.length : FACE_COUNTS.code;
  const normalFaces = Math.min(pairCount, available);
  const quadrupleFaces = Math.min(pairCount - normalFaces, available);

  const cards: Card[] = [];

  for (let i = 1; i <= normalFaces; i++) {
    const image = getFaceImage(theme, i);
    cards.push({ id: i, image, matched: false, revealed: false });
    cards.push({ id: i, image, matched: false, revealed: false });
  }

  for (let i = 1; i <= quadrupleFaces; i++) {
    const image = getFaceImage(theme, i);
    cards.push({ id: i, image, matched: false, revealed: false });
    cards.push({ id: i, image, matched: false, revealed: false });
  }

  return cards;
}

function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function renderCards(cards: Card[], backImage: string): string {
  const backFace = backImage
    ? `<div class="card__face card__face--front"><img src="${backImage}" alt=""></div>`
    : `<div class="card__face card__face--front"></div>`;

  return cards.map((card, index) => `
    <button class="card" data-index="${index}" data-id="${card.id}" aria-label="Card ${index + 1}">
      <div class="card__inner">
        ${backFace}
        <div class="card__face card__face--back">
          <img src="${card.image}" alt="Motif ${card.id}">
        </div>
      </div>
    </button>
  `).join("");
}

interface GameState {
  cards: Card[];
  current: Player;
  scores: Record<Player, number>;
  flipped: HTMLButtonElement[];
  locked: boolean;
  matchedPairs: number;
  totalPairs: number;
}

const state: GameState = {
  cards: [],
  current: DEFAULT_PLAYER,
  scores: { blue: 0, orange: 0 },
  flipped: [],
  locked: false,
  matchedPairs: 0,
  totalPairs: 0,
};

function $<T extends HTMLElement>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

function updateScores(): void {
  const sb = $<HTMLElement>("#score-blue");
  const so = $<HTMLElement>("#score-orange");
  if (sb) sb.textContent = String(state.scores.blue);
  if (so) so.textContent = String(state.scores.orange);
}

function updateCurrentPlayer(): void {
  const ind = $<HTMLElement>("#current-player");
  if (!ind) return;
  ind.classList.remove("player__indicator--blue", "player__indicator--orange");
  ind.classList.add(`player__indicator--${state.current}`);
}

function switchPlayer(): void {
  state.current = state.current === "blue" ? "orange" : "blue";
  updateCurrentPlayer();
}

function handleCardClick(btn: HTMLButtonElement): void {
  if (state.locked) return;
  if (btn.classList.contains("is-flipped")) return;
  if (btn.classList.contains("is-matched")) return;

  btn.classList.add("is-flipped");
  state.flipped.push(btn);

  if (state.flipped.length < 2) return;

  state.locked = true;
  const [a, b] = state.flipped;
  const idA = a.dataset.id;
  const idB = b.dataset.id;

  if (idA === idB) {
    a.classList.add("is-matched");
    b.classList.add("is-matched");
    state.scores[state.current] += 1;
    state.matchedPairs += 1;
    updateScores();
    state.flipped = [];
    state.locked = false;

    if (state.matchedPairs === state.totalPairs) {
      finishGame();
    }
  } else {
    window.setTimeout(() => {
      a.classList.remove("is-flipped");
      b.classList.remove("is-flipped");
      state.flipped = [];
      switchPlayer();
      state.locked = false;
    }, 900);
  }
}

function finishGame(): void {
  const { blue, orange } = state.scores;
  let winner: Player | "tie";
  if (blue > orange) winner = "blue";
  else if (orange > blue) winner = "orange";
  else winner = "tie";

  localStorage.setItem("winner", winner);
  localStorage.setItem("score-blue", String(blue));
  localStorage.setItem("score-orange", String(orange));

  const fsb = $<HTMLElement>("#final-score-blue");
  const fso = $<HTMLElement>("#final-score-orange");
  if (fsb) fsb.textContent = String(blue);
  if (fso) fso.textContent = String(orange);

  const overlay = $<HTMLElement>("#game-over-overlay");
  if (overlay) overlay.classList.add("is-visible");

  window.setTimeout(() => {
    window.location.href = "winner.html";
  }, 5000);
}

function setupModal(): void {
  const exitButton = $<HTMLButtonElement>("#exit-button");
  const modal = $<HTMLDialogElement>("#exit-modal");
  const cancelExit = $<HTMLButtonElement>("#cancel-exit");
  const confirmExit = $<HTMLButtonElement>("#confirm-exit");

  if (!exitButton || !modal || !cancelExit || !confirmExit) return;

  exitButton.addEventListener("click", () => modal.showModal());
  cancelExit.addEventListener("click", () => modal.close());
  confirmExit.addEventListener("click", () => {
    window.location.href = "home.html";
  });
}

function init(): void {
  const field = $<HTMLElement>("#field");
  if (!field) return;

  const theme = readTheme();
  const board = readBoard();
  const player = readPlayer();

  document.body.dataset.theme = theme;

  state.current = player;
  state.totalPairs = board / 2;
  state.cards = shuffle(createCards(state.totalPairs, theme));

  field.dataset.board = String(board);
  field.style.setProperty("--grid-cols", String(GRID_COLS[board]));
  field.innerHTML = renderCards(state.cards, getBackImage(theme));

  updateCurrentPlayer();
  updateScores();

  field.addEventListener("click", (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest(".card") as HTMLButtonElement | null;
    if (btn) handleCardClick(btn);
  });

  setupModal();
}

init();
