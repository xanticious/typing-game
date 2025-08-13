// Game State Management System

class GameState {
  constructor() {
    this.currentState = "MENU";
    this.gameConfig = { ...CONFIG.DEFAULT_CONFIG };
    this.sessionStats = new Map(); // Key: config hash, Value: best score
    this.currentGameData = null;
    this.screens = {
      MENU: "mainMenu",
      STATISTICS: "statisticsMenu",
      GAME: "gameArena",
      RESULTS: "resultsScreen",
    };

    this.initializeEventListeners();
  }

  // State Management
  setState(newState) {
    if (this.screens[newState]) {
      this.hideAllScreens();
      this.currentState = newState;
      this.showScreen(this.screens[newState]);
      this.onStateChanged(newState);
    } else {
      console.error(`Invalid state: ${newState}`);
    }
  }

  hideAllScreens() {
    Object.values(this.screens).forEach((screenId) => {
      const screen = document.getElementById(screenId);
      if (screen) {
        screen.classList.remove("active");
      }
    });
  }

  showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add("active");
    }
  }

  onStateChanged(newState) {
    switch (newState) {
      case "MENU":
        this.updateBestScoreDisplay();
        break;
      case "STATISTICS":
        this.refreshStatisticsDisplay();
        break;
      case "GAME":
        this.initializeGame();
        break;
      case "RESULTS":
        this.displayResults();
        break;
    }
  }

  // Configuration Management
  updateConfig(configUpdate) {
    this.gameConfig = { ...this.gameConfig, ...configUpdate };
    this.updateBestScoreDisplay();
  }

  getConfigHash() {
    const { characterSets, difficulty, duration } = this.gameConfig;
    const enabledSets = Object.keys(characterSets)
      .filter((key) => characterSets[key])
      .sort()
      .join(",");
    return `${enabledSets}-${difficulty}-${duration}`;
  }

  generateCharacterPool() {
    const { characterSets } = this.gameConfig;
    let pool = "";

    Object.keys(characterSets).forEach((setKey) => {
      if (characterSets[setKey] && CONFIG.CHARACTER_SETS[setKey]) {
        pool += CONFIG.CHARACTER_SETS[setKey];
      }
    });

    return pool;
  }

  // Statistics Management
  recordScore(gameResult) {
    const configHash = this.getConfigHash();
    const currentBest = this.sessionStats.get(configHash);

    if (!currentBest || gameResult.finalWPM > currentBest.finalWPM) {
      this.sessionStats.set(configHash, {
        ...gameResult,
        configHash,
        timestamp: new Date(),
      });
    }
  }

  getBestScore(configHash = null) {
    const hash = configHash || this.getConfigHash();
    return this.sessionStats.get(hash) || null;
  }

  updateBestScoreDisplay() {
    const bestScoreElement = document.getElementById("bestScoreText");
    if (bestScoreElement) {
      const bestScore = this.getBestScore();
      if (bestScore) {
        bestScoreElement.textContent = `Best score today: ${bestScore.finalWPM} WPM`;
        bestScoreElement.style.color = "#d4af37";
      } else {
        bestScoreElement.textContent = "Best score today: No data";
        bestScoreElement.style.color = "#999";
      }
    }
  }

  refreshStatisticsDisplay() {
    const tbody = document.getElementById("statsTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (this.sessionStats.size === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-stats">
                        No games played yet today.<br>
                        Play some games to see your statistics!
                    </td>
                </tr>
            `;
      return;
    }

    const sortedStats = Array.from(this.sessionStats.values()).sort(
      (a, b) => b.finalWPM - a.finalWPM
    );

    sortedStats.forEach((stat) => {
      const row = document.createElement("tr");

      // Parse character sets from config hash
      const [charSets, difficulty, duration] = stat.configHash.split("-");
      const characterSetsDisplay = charSets.replace(/,/g, ", ") || "None";

      row.innerHTML = `
                <td>${characterSetsDisplay}</td>
                <td>${
                  CONFIG.DIFFICULTY_SETTINGS[difficulty]?.label || difficulty
                }</td>
                <td>${
                  CONFIG.DURATION_SETTINGS[duration]?.label || duration
                }</td>
                <td>${stat.finalWPM}</td>
                <td>${stat.mistakes}</td>
            `;

      tbody.appendChild(row);
    });
  }

  // Game Management
  initializeGame() {
    const characterPool = this.generateCharacterPool();
    if (characterPool.length === 0) {
      console.error("No character pool available");
      this.setState("MENU");
      return;
    }

    const durationSeconds =
      CONFIG.DURATION_SETTINGS[this.gameConfig.duration].seconds;
    const difficultyMultiplier =
      CONFIG.DIFFICULTY_SETTINGS[this.gameConfig.difficulty].multiplier;

    // Calculate snake length based on duration and difficulty
    const baseLettersPerSecond = 1.5; // Baseline letters per second
    const snakeLength = Math.max(
      5,
      Math.floor(durationSeconds * baseLettersPerSecond * difficultyMultiplier)
    );

    // Generate random letters for the snake
    const snakeLetters = [];
    for (let i = 0; i < snakeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characterPool.length);
      snakeLetters.push(characterPool[randomIndex]);
    }

    this.currentGameData = {
      snakeLetters,
      currentLetterIndex: 0,
      startTime: Date.now(),
      charactersTyped: 0,
      mistakes: 0,
      durationSeconds,
      difficultyMultiplier,
      isComplete: false,
      isPenalized: false,
    };

    // Initialize game UI
    this.updateGameUI();
  }

  updateGameUI() {
    if (!this.currentGameData) return;

    const { charactersTyped, mistakes, snakeLetters, currentLetterIndex } =
      this.currentGameData;

    // Calculate current WPM
    const elapsedMinutes =
      (Date.now() - this.currentGameData.startTime) / 60000;
    const currentWPM =
      elapsedMinutes > 0
        ? Math.round(
            charactersTyped / CONFIG.GAME.CHARS_PER_WORD / elapsedMinutes
          )
        : 0;

    // Update UI elements
    const wpmElement = document.getElementById("currentWPM");
    const mistakesElement = document.getElementById("currentMistakes");
    const lettersLeftElement = document.getElementById("lettersLeft");

    if (wpmElement) wpmElement.textContent = currentWPM;
    if (mistakesElement) mistakesElement.textContent = mistakes;
    if (lettersLeftElement)
      lettersLeftElement.textContent = snakeLetters.length - currentLetterIndex;
  }

  displayResults() {
    if (!this.currentGameData) return;

    const {
      charactersTyped,
      mistakes,
      startTime,
      durationSeconds,
      snakeLetters,
      currentLetterIndex,
    } = this.currentGameData;

    // Calculate final stats
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;
    const baseWPM =
      elapsedMinutes > 0
        ? Math.round(
            charactersTyped / CONFIG.GAME.CHARS_PER_WORD / elapsedMinutes
          )
        : 0;
    const finalWPM = Math.max(
      0,
      baseWPM - mistakes * CONFIG.GAME.MISTAKE_PENALTY
    );

    const gameResult = {
      charactersTyped,
      mistakes,
      finalWPM,
      elapsedSeconds: Math.round(elapsedSeconds),
      isVictory: currentLetterIndex >= snakeLetters.length,
    };

    // Record the score
    this.recordScore(gameResult);

    // Update results display
    const isVictory = gameResult.isVictory;

    document.getElementById("resultsTitle").textContent = isVictory
      ? "🎉 Congratulations! 🎉"
      : "💀 Ouch! The basilisk reached the wizard! 💀";
    document.getElementById("resultsSubtitle").textContent = isVictory
      ? "You protected the wizard!"
      : "Better luck next time!";

    document.getElementById("finalCharactersTyped").textContent =
      charactersTyped;
    document.getElementById("finalMistakes").textContent = mistakes;
    document.getElementById("finalWPM").textContent = finalWPM;
    document.getElementById("finalTime").textContent =
      gameResult.elapsedSeconds;
  }

  // Event Listeners
  initializeEventListeners() {
    // Menu navigation
    document.addEventListener("DOMContentLoaded", () => {
      this.setupMenuListeners();
    });
  }

  setupMenuListeners() {
    // View Statistics button
    const viewStatsBtn = document.getElementById("viewStatsBtn");
    if (viewStatsBtn) {
      viewStatsBtn.addEventListener("click", () => {
        this.setState("STATISTICS");
      });
    }

    // Back to Menu button
    const backToMenuBtn = document.getElementById("backToMenuBtn");
    if (backToMenuBtn) {
      backToMenuBtn.addEventListener("click", () => {
        this.setState("MENU");
      });
    }

    // Try Again button
    const tryAgainBtn = document.getElementById("tryAgainBtn");
    if (tryAgainBtn) {
      tryAgainBtn.addEventListener("click", () => {
        this.setState("GAME");
      });
    }

    // Results Menu button
    const resultsMenuBtn = document.getElementById("resultsMenuBtn");
    if (resultsMenuBtn) {
      resultsMenuBtn.addEventListener("click", () => {
        this.setState("MENU");
      });
    }
  }

  // Input Handling for Game
  handleGameInput(key) {
    if (
      !this.currentGameData ||
      this.currentGameData.isComplete ||
      this.currentGameData.isPenalized
    ) {
      return;
    }

    const { snakeLetters, currentLetterIndex } = this.currentGameData;
    const expectedLetter = snakeLetters[currentLetterIndex];

    if (key === expectedLetter) {
      // Correct input
      this.currentGameData.charactersTyped++;
      this.currentGameData.currentLetterIndex++;

      // Check for victory
      if (this.currentGameData.currentLetterIndex >= snakeLetters.length) {
        this.currentGameData.isComplete = true;
        setTimeout(() => {
          this.setState("RESULTS");
        }, 1000); // Brief delay to show final destruction
      }

      this.updateGameUI();
      this.showTypingFeedback("correct");
    } else {
      // Incorrect input
      this.currentGameData.mistakes++;
      this.applyPenalty();
      this.updateGameUI();
      this.showTypingFeedback("incorrect");
    }
  }

  applyPenalty() {
    this.currentGameData.isPenalized = true;

    // Show penalty overlay
    const penaltyOverlay = document.createElement("div");
    penaltyOverlay.className = "penalty-overlay active";
    document.getElementById("gameArena").appendChild(penaltyOverlay);

    setTimeout(() => {
      this.currentGameData.isPenalized = false;
      penaltyOverlay.remove();
    }, CONFIG.GAME.PENALTY_DURATION);
  }

  showTypingFeedback(type) {
    const feedbackElement = document.getElementById("typingFeedback");
    if (!feedbackElement) return;

    feedbackElement.className = `typing-feedback show ${type}`;
    feedbackElement.textContent = type === "correct" ? "✓" : "✗";

    setTimeout(() => {
      feedbackElement.classList.remove("show");
    }, CONFIG.GAME.FEEDBACK_DURATION);
  }
}

// Global game state instance
const gameState = new GameState();
