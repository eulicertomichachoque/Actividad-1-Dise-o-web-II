// ============ MÓDULO: ESTADO DEL JUEGO ============
const GameState = (() => {
  let icons = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🍑", "🍍"];
  let cards = [];
  let firstCard = null;
  let secondCard = null;
  let lock = false;
  let moves = 0;
  let score = 0;
  let time = 0;
  let timer = null;
  let totalPairs = icons.length;

  return {
    getIcons: () => icons,
    setIcons: (newIcons) => {
      if (Array.isArray(newIcons) && newIcons.length > 0) {
        icons = [...newIcons];
        totalPairs = icons.length;
      }
    },
    getCards: () => cards,
    setCards: (newCards) => { cards = [...newCards]; },
    getFirstCard: () => firstCard,
    setFirstCard: (card) => { firstCard = card; },
    getSecondCard: () => secondCard,
    setSecondCard: (card) => { secondCard = card; },
    isLocked: () => lock,
    setLock: (value) => { lock = value; },
    getMoves: () => moves,
    incrementMoves: () => { moves++; },
    resetMoves: () => { moves = 0; },
    getScore: () => score,
    addScore: (points) => { score += points; },
    resetScore: () => { score = 0; },
    getTime: () => time,
    incrementTime: () => { time++; },
    resetTime: () => { time = 0; },
    getTimer: () => timer,
    setTimer: (newTimer) => { timer = newTimer; },
    getTotalPairs: () => totalPairs,
    resetSelection: () => {
      firstCard = null;
      secondCard = null;
      lock = false;
    }
  };
})();

// ============ MÓDULO: ELEMENTOS DOM ============
const DOM = (() => {
  const elements = {
    board: document.getElementById("gameBoard"),
    timer: document.getElementById("timer"),
    moves: document.getElementById("moves"),
    score: document.getElementById("score"),
    resetBtn: document.getElementById("resetBtn")
  };

  // Crear elemento para mensajes
  const messageEl = document.createElement("div");
  messageEl.id = "gameMessage";
  messageEl.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 1000;
    text-align: center;
    display: none;
    max-width: 90vw;
    width: 400px;
  `;
  document.body.appendChild(messageEl);

  return {
    getElement: (key) => elements[key],
    updateText: (elementId, text) => {
      if (elements[elementId]) {
        elements[elementId].textContent = text;
      }
    },
    showMessage: (title, content) => {
      messageEl.innerHTML = `
        <h2 style="margin-top:0;color:#2196f3">${title}</h2>
        <div style="margin:1.5rem 0">${content}</div>
        <button id="closeMessage" style="padding:10px 25px;background:#2196f3;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold">
          Cerrar
        </button>
      `;
      messageEl.style.display = 'block';
      
      document.getElementById("closeMessage").addEventListener("click", () => {
        messageEl.style.display = 'none';
      });
    }
  };
})();

// ============ UTILIDADES ============
const Utils = {
  shuffleArray: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  formatTime: (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  },

  createCardElement: (icon, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-icon", icon);
    card.setAttribute("data-index", index);
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Carta ${index + 1}, sin revelar`);
    
    // Evento para teclado (accesibilidad)
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
    
    return card;
  }
};

// ============ LÓGICA DEL JUEGO ============
const GameLogic = (() => {
  let matchSound = null;
  let flipSound = null;

  // Intentar cargar sonidos (si existen)
  try {
    matchSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3");
    flipSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3");
  } catch (e) {
    console.log("Sonidos no cargados, continuando sin ellos");
  }

  const playSound = (sound) => {
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log("Error reproduciendo sonido:", e));
    }
  };

  const startTimer = () => {
    clearInterval(GameState.getTimer());
    
    const timer = setInterval(() => {
      GameState.incrementTime();
      DOM.updateText("timer", Utils.formatTime(GameState.getTime()));
    }, 1000);
    
    GameState.setTimer(timer);
  };

  const revealCard = (card) => {
    if (!card || GameState.isLocked() || card.classList.contains("revealed")) {
      return false;
    }

    card.classList.add("revealed");
    card.textContent = card.dataset.icon;
    card.setAttribute("aria-label", `Carta revelada: ${card.dataset.icon}`);
    playSound(flipSound);
    return true;
  };

  const hideCard = (card) => {
    if (card) {
      card.classList.remove("revealed");
      card.textContent = "";
      card.setAttribute("aria-label", `Carta ${parseInt(card.dataset.index) + 1}, sin revelar`);
    }
  };

  const checkMatch = () => {
    const firstCard = GameState.getFirstCard();
    const secondCard = GameState.getSecondCard();
    
    if (!firstCard || !secondCard) return;

    GameState.setLock(true);
    GameState.incrementMoves();
    DOM.updateText("moves", GameState.getMoves());

    const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      
      GameState.addScore(10);
      DOM.updateText("score", GameState.getScore());
      
      playSound(matchSound);
      
      setTimeout(() => {
        GameState.resetSelection();
        checkWin();
      }, 300);
    } else {
      setTimeout(() => {
        hideCard(firstCard);
        hideCard(secondCard);
        GameState.resetSelection();
      }, 900);
    }
  };

  const checkWin = () => {
    const matchedCards = document.querySelectorAll(".matched").length;
    const totalPairs = GameState.getTotalPairs() * 2; // ×2 porque cada par tiene 2 cartas
    
    if (matchedCards === totalPairs) {
      clearInterval(GameState.getTimer());
      
      const time = Utils.formatTime(GameState.getTime());
      const moves = GameState.getMoves();
      const score = GameState.getScore();
      
      const message = `
        <p><strong>Movimientos:</strong> ${moves}</p>
        <p><strong>Tiempo:</strong> ${time}</p>
        <p><strong>Puntuación:</strong> ${score}</p>
        <p style="margin-top:1rem;color:#4caf50">¡Excelente trabajo! 🎉</p>
      `;
      
      setTimeout(() => {
        DOM.showMessage("¡Juego Completado!", message);
      }, 500);
    }
  };

  return {
    startTimer,
    revealCard,
    hideCard,
    checkMatch,
    checkWin
  };
})();

// ============ MANEJADORES DE EVENTOS ============
const EventHandlers = (() => {
  const handleCardClick = (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    if (!GameLogic.revealCard(card)) return;

    if (!GameState.getFirstCard()) {
      GameState.setFirstCard(card);
    } else {
      GameState.setSecondCard(card);
      GameLogic.checkMatch();
    }
  };

  const handleReset = () => {
    // Limpiar estado
    GameState.resetMoves();
    GameState.resetScore();
    GameState.resetTime();
    GameState.resetSelection();
    
    // Limpiar timer
    clearInterval(GameState.getTimer());
    
    // Actualizar UI
    DOM.updateText("moves", GameState.getMoves());
    DOM.updateText("score", GameState.getScore());
    DOM.updateText("timer", Utils.formatTime(GameState.getTime()));
    
    // Reiniciar tablero
    startGame();
  };

  return {
    handleCardClick,
    handleReset
  };
})();

// ============ INICIALIZACIÓN ============
function startGame() {
  const board = DOM.getElement("board");
  if (!board) return;

  // Limpiar tablero
  board.innerHTML = "";
  
  // Crear cartas duplicadas y mezcladas
  const icons = GameState.getIcons();
  let cards = [...icons, ...icons];
  cards = Utils.shuffleArray(cards);
  GameState.setCards(cards);

  // Renderizar cartas
  cards.forEach((icon, index) => {
    const card = Utils.createCardElement(icon, index);
    board.appendChild(card);
  });

  // Actualizar anuncio de cartas para lectores de pantalla
  const liveRegion = document.getElementById("gameAnnouncement") || (() => {
    const region = document.createElement("div");
    region.id = "gameAnnouncement";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    region.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;";
    document.body.appendChild(region);
    return region;
  })();
  
  liveRegion.textContent = `Juego iniciado. ${cards.length} cartas mezcladas. Encuentra los ${icons.length} pares.`;

  // Iniciar timer
  GameLogic.startTimer();
}

// ============ INICIALIZAR EVENTOS ============
function initializeGame() {
  const board = DOM.getElement("board");
  const resetBtn = DOM.getElement("resetBtn");

  if (!board || !resetBtn) {
    console.error("Elementos del DOM no encontrados");
    return;
  }

  // Usar delegación de eventos para mejor rendimiento
  board.addEventListener("click", EventHandlers.handleCardClick);
  resetBtn.addEventListener("click", EventHandlers.handleReset);

  // Iniciar primer juego
  startGame();
}

// ============ INICIO ============
// Esperar a que el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGame);
} else {
  initializeGame();
}

// ============ EXPORTACIÓN (para módulos) ============
// Si se usa como módulo, exportar funciones necesarias
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GameState,
    Utils,
    startGame
  };
}
