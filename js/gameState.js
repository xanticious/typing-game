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

  // Configuration Management
  updateConfig(newConfig) {
    console.log("GameState: Updating config:", newConfig);
    this.gameConfig = { ...newConfig };
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
    console.log("GameState: Initializing game with config:", this.gameConfig);

    // Validate configuration
    const characterPool = this.generateCharacterPool();
    if (characterPool.length === 0) {
      console.error("No character pool available");
      this.setState("MENU");
      return;
    }

    // Start the game through the main application's game engine
    if (window.snakeProtectorGame && window.snakeProtectorGame.gameEngine) {
      window.snakeProtectorGame.startGame(this.gameConfig);
    } else {
      console.error("Game engine not available");
      this.setState("MENU");
    }
  }

  // Show results from game engine
  showResults(results) {
    console.log("GameState: Showing results:", results);

    // Store the results for display
    this.currentGameResults = results;

    // Record score in session statistics
    this.recordScore(results);

    // Switch to results screen
    this.setState("RESULTS");
  }

  // Display final results on results screen
  displayResults() {
    if (!this.currentGameResults) {
      console.error("No results to display");
      return;
    }

    const results = this.currentGameResults;

    // Update result title and subtitle based on game outcome
    const titleElement = document.getElementById("resultsTitle");
    const subtitleElement = document.getElementById("resultsSubtitle");

    if (titleElement && subtitleElement) {
      if (results.reason === "victory") {
        titleElement.textContent = "🎉 Congratulations! 🎉";
        subtitleElement.textContent = "You protected the wizard!";
      } else if (results.reason === "defeat") {
        titleElement.textContent =
          "💀 Ouch! The basilisk reached the wizard! 💀";
        subtitleElement.textContent = "Better luck next time!";
      } else {
        titleElement.textContent = "⏰ Time's Up! ⏰";
        subtitleElement.textContent = "The game has ended.";
      }
    }

    // Update result statistics
    const charactersElement = document.getElementById("finalCharactersTyped");
    const mistakesElement = document.getElementById("finalMistakes");
    const wpmElement = document.getElementById("finalWPM");
    const timeElement = document.getElementById("finalTime");

    if (charactersElement)
      charactersElement.textContent = results.charactersTyped || 0;
    if (mistakesElement) mistakesElement.textContent = results.mistakes || 0;
    if (wpmElement)
      wpmElement.textContent = results.finalScore || results.finalWPM || 0;
    if (timeElement) timeElement.textContent = results.elapsedTime || 0;
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
