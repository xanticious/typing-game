// Main menu controller

class MainMenu {
  constructor() {
    this.currentConfig = { ...CONFIG.DEFAULT_CONFIG };
    this.isInitialized = false;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.addEventListener("DOMContentLoaded", () => {
      this.setupMenuInteractions();
      this.loadDefaultConfiguration();
      this.isInitialized = true;
    });
  }

  setupMenuInteractions() {
    // Character set change handlers
    this.setupCharacterSetHandlers();

    // Difficulty change handlers
    this.setupDifficultyHandlers();

    // Duration change handlers
    this.setupDurationHandlers();

    // Menu navigation
    this.setupNavigationHandlers();

    // Keyboard navigation
    this.setupKeyboardNavigation();
  }

  setupCharacterSetHandlers() {
    const checkboxes = document.querySelectorAll('input[name="characterSets"]');

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleCharacterSetChange(e.target);
        this.updateBestScoreDisplay();
      });

      // Add keyboard support for checkboxes
      checkbox.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change"));
        }
      });
    });
  }

  setupDifficultyHandlers() {
    const radios = document.querySelectorAll('input[name="difficulty"]');

    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.handleDifficultyChange(e.target.value);
        this.updateBestScoreDisplay();
      });
    });
  }

  setupDurationHandlers() {
    const radios = document.querySelectorAll('input[name="duration"]');

    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.handleDurationChange(e.target.value);
        this.updateBestScoreDisplay();
      });
    });
  }

  setupNavigationHandlers() {
    // Start game button
    const startBtn = document.getElementById("startGameBtn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.startGame();
      });
    }

    // View statistics button
    const statsBtn = document.getElementById("viewStatsBtn");
    if (statsBtn) {
      statsBtn.addEventListener("click", () => {
        this.showStatistics();
      });
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Only handle navigation keys when main menu is active
      if (gameState.currentState !== "MENU") return;

      switch (e.key) {
        case "Enter":
          // Start game if Enter is pressed and start button is enabled
          const startBtn = document.getElementById("startGameBtn");
          if (startBtn && !startBtn.disabled) {
            e.preventDefault();
            this.startGame();
          }
          break;

        case "Tab":
          // Enhanced tab navigation (handled by browser by default)
          break;

        case "Escape":
          // Could be used to reset form or show help
          break;
      }
    });
  }

  handleCharacterSetChange(checkbox) {
    const setKey = checkbox.value;
    this.currentConfig.characterSets[setKey] = checkbox.checked;

    // Update game state
    gameState.updateConfig(this.currentConfig);

    // Provide visual feedback
    this.highlightChangedSetting(checkbox.parentElement);
  }

  handleDifficultyChange(difficulty) {
    this.currentConfig.difficulty = difficulty;
    gameState.updateConfig(this.currentConfig);

    // Highlight the selected difficulty
    const selectedRadio = document.querySelector(
      `input[name="difficulty"][value="${difficulty}"]`
    );
    if (selectedRadio) {
      this.highlightChangedSetting(selectedRadio.parentElement);
    }
  }

  handleDurationChange(duration) {
    this.currentConfig.duration = duration;
    gameState.updateConfig(this.currentConfig);

    // Highlight the selected duration
    const selectedRadio = document.querySelector(
      `input[name="duration"][value="${duration}"]`
    );
    if (selectedRadio) {
      this.highlightChangedSetting(selectedRadio.parentElement);
    }
  }

  highlightChangedSetting(element) {
    // Add temporary highlight effect
    element.style.transition = "background-color 0.3s ease";
    element.style.backgroundColor = "rgba(212, 175, 55, 0.2)";

    setTimeout(() => {
      element.style.backgroundColor = "";
    }, 500);
  }

  loadDefaultConfiguration() {
    // Set default values in the form
    Object.keys(this.currentConfig.characterSets).forEach((setKey) => {
      const checkbox = document.getElementById(setKey);
      if (checkbox) {
        checkbox.checked = this.currentConfig.characterSets[setKey];
      }
    });

    // Set default difficulty
    const difficultyRadio = document.querySelector(
      `input[name="difficulty"][value="${this.currentConfig.difficulty}"]`
    );
    if (difficultyRadio) {
      difficultyRadio.checked = true;
    }

    // Set default duration
    const durationRadio = document.querySelector(
      `input[name="duration"][value="${this.currentConfig.duration}"]`
    );
    if (durationRadio) {
      durationRadio.checked = true;
    }

    // Update game state with default config
    gameState.updateConfig(this.currentConfig);
    this.updateBestScoreDisplay();
  }

  updateBestScoreDisplay() {
    // This will be handled by gameState.updateBestScoreDisplay()
    // which is automatically called when the config changes
    gameState.updateBestScoreDisplay();
  }

  startGame() {
    // Validate configuration before starting
    if (menuValidator && menuValidator.validateAll().isValid) {
      // Add starting animation
      this.animateGameStart();
    } else {
      console.error("Cannot start game: invalid configuration");
    }
  }

  animateGameStart() {
    const menuContainer = document.querySelector("#mainMenu .menu-container");

    if (menuContainer) {
      // Add loading state to start button
      const startBtn = document.getElementById("startGameBtn");
      if (startBtn) {
        startBtn.classList.add("loading");
        startBtn.textContent = "Starting...";
        startBtn.disabled = true;
      }

      // Fade out menu
      menuContainer.style.transition =
        "opacity 0.5s ease-out, transform 0.5s ease-out";
      menuContainer.style.opacity = "0";
      menuContainer.style.transform = "scale(0.9)";

      setTimeout(() => {
        gameState.setState("GAME");

        // Reset menu for next time
        if (startBtn) {
          startBtn.classList.remove("loading");
          startBtn.textContent = "Start Game";
          startBtn.disabled = false;
        }
        menuContainer.style.opacity = "";
        menuContainer.style.transform = "";
      }, 500);
    } else {
      // Fallback without animation
      gameState.setState("GAME");
    }
  }

  showStatistics() {
    gameState.setState("STATISTICS");
  }

  // Configuration management methods
  getConfiguration() {
    return { ...this.currentConfig };
  }

  setConfiguration(newConfig) {
    this.currentConfig = { ...newConfig };
    this.loadDefaultConfiguration();
  }

  resetConfiguration() {
    this.setConfiguration(CONFIG.DEFAULT_CONFIG);
  }

  // Utility methods
  getSelectedCharacterSets() {
    return Object.keys(this.currentConfig.characterSets).filter(
      (key) => this.currentConfig.characterSets[key]
    );
  }

  getCharacterPool() {
    const selectedSets = this.getSelectedCharacterSets();
    let pool = "";

    selectedSets.forEach((setKey) => {
      if (CONFIG.CHARACTER_SETS[setKey]) {
        pool += CONFIG.CHARACTER_SETS[setKey];
      }
    });

    return pool;
  }

  getConfigurationSummary() {
    const selectedSets = this.getSelectedCharacterSets();
    const difficulty =
      CONFIG.DIFFICULTY_SETTINGS[this.currentConfig.difficulty];
    const duration = CONFIG.DURATION_SETTINGS[this.currentConfig.duration];

    return {
      characterSets: selectedSets,
      characterPool: this.getCharacterPool(),
      difficulty: {
        key: this.currentConfig.difficulty,
        ...difficulty,
      },
      duration: {
        key: this.currentConfig.duration,
        ...duration,
      },
    };
  }

  // Accessibility helpers
  announceConfigChange(message) {
    // Create a live region for screen readers
    let announcer = document.getElementById("config-announcer");
    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "config-announcer";
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.style.position = "absolute";
      announcer.style.left = "-10000px";
      announcer.style.width = "1px";
      announcer.style.height = "1px";
      announcer.style.overflow = "hidden";
      document.body.appendChild(announcer);
    }

    announcer.textContent = message;
  }
}

// Initialize main menu when DOM is loaded
let mainMenu;

document.addEventListener("DOMContentLoaded", () => {
  mainMenu = new MainMenu();
});
