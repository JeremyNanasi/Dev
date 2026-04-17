import './styles/styles.scss';

/** Eine einzelne Memory-Karte. */
interface Card {
  id: number;
  image: string;
  matched: boolean;
  revealed: boolean;
}

/** Verfuegbare Themes. */
type Theme = "code" | "games";

const PAIR_COUNT: number = 8;
const DEFAULT_THEME: Theme = "games";

/** Erzeugt pairCount * 2 Karten (jedes Motiv zweimal). */
function createCards(pairCount: number, theme: Theme): Card[] {
  const cards: Card[] = [];
  for (let i = 1; i <= pairCount; i++) {
    const image: string = `/assets/${theme}-themes/card-${i}.jpg`;
    cards.push({ id: i, image, matched: false, revealed: false });
    cards.push({ id: i, image, matched: false, revealed: false });
  }
  return cards;
}

/** Mischt ein Card-Array per Fisher-Yates Shuffle. */
function shuffle(cards: Card[]): Card[] {
  const result: Card[] = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Baut den HTML-String fuer alle Karten. */
function renderCards(cards: Card[]): string {
  return cards.map((card, index) => `
    <button class="card" data-index="${index}" data-id="${card.id}" aria-label="Karte ${index + 1}">
      <div class="card__inner">
        <div class="card__face card__face--front">
          <img src="${card.image}" alt="Motiv ${card.id}">
        </div>
        <div class="card__face card__face--back"></div>
      </div>
    </button>
  `).join("");
}

/** Bindet Exit-Button und Modal-Events. */
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

/** Startet das Spiel: Karten erzeugen, mischen, rendern, Events binden. */
function init(): void {
  const fieldRef: HTMLElement | null = document.getElementById("field");
  if (!fieldRef) return;

  const theme: Theme = (localStorage.getItem("theme") as Theme) || DEFAULT_THEME;
  const cards: Card[] = shuffle(createCards(PAIR_COUNT, theme));
  fieldRef.innerHTML = renderCards(cards);

  fieldRef.addEventListener("click", (e: MouseEvent) => {
    const cardElement = (e.target as HTMLElement).closest(".card") as HTMLButtonElement | null;
    if (cardElement) {
      cardElement.classList.toggle("is-flipped");
    }
  });

  setupModal();
}

init();
