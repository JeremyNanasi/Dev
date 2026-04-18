import './styles/styles.scss';

interface Card {
  id: number;
  image: string;
  matched: boolean;
  revealed: boolean;
}

type Theme = "code" | "games";

const PAIR_COUNT: number = 8;
const DEFAULT_THEME: Theme = "games";

function getBackImage(theme: Theme): string {
  return `/assets/${theme}-themes/back.jpg`;
}

function createCards(pairCount: number, theme: Theme): Card[] {
  const cards: Card[] = [];
  for (let i = 1; i <= pairCount; i++) {
    const image: string = `/assets/${theme}-themes/card-${i}.jpg`;
    cards.push({ id: i, image, matched: false, revealed: false });
    cards.push({ id: i, image, matched: false, revealed: false });
  }
  return cards;
}

function shuffle(cards: Card[]): Card[] {
  const result: Card[] = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function renderCards(cards: Card[], backImage: string): string {
  return cards.map((card, index) => `
    <button class="card" data-index="${index}" data-id="${card.id}" aria-label="Karte ${index + 1}">
      <div class="card__inner">
        <div class="card__face card__face--front">
          <img src="${backImage}" alt="Kartenruecken">
        </div>
        <div class="card__face card__face--back">
          <img src="${card.image}" alt="Motiv ${card.id}">
        </div>
      </div>
    </button>
  `).join("");
}

function setupModal(): void {
  const exitButton: HTMLElement | null = document.getElementById("exit-button");
  const modal: HTMLDialogElement | null = document.getElementById("exit-modal") as HTMLDialogElement | null;
  const cancelExit: HTMLElement | null = document.getElementById("cancel-exit");
  const confirmExit: HTMLElement | null = document.getElementById("confirm-exit");

  if (!exitButton || !modal || !cancelExit || !confirmExit) return;

  exitButton.addEventListener("click", () => {
    modal.showModal();
  });

  cancelExit.addEventListener("click", () => {
    modal.close();
  });

  confirmExit.addEventListener("click", () => {
    window.location.href = "home.html";
  });
}

function init(): void {
  const fieldRef: HTMLElement | null = document.getElementById("field");
  if (!fieldRef) return;

  const theme: Theme = (localStorage.getItem("theme") as Theme) || DEFAULT_THEME;
  const cards: Card[] = shuffle(createCards(PAIR_COUNT, theme));
  const backImage: string = getBackImage(theme);
  fieldRef.innerHTML = renderCards(cards, backImage);

  fieldRef.addEventListener("click", (e: MouseEvent) => {
    const cardElement = (e.target as HTMLElement).closest(".card") as HTMLButtonElement | null;
    if (cardElement) {
      cardElement.classList.toggle("is-flipped");
    }
  });

  setupModal();
}

init();
