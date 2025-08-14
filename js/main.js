// Main application entry point

class SnakeProtectorGame {
  constructor() {
    this.isInitialized = false;
    this.renderer = null;
    this.gameEngine = null;
    this.animationId = null;
    this.lastTimestamp = 0;

    this.initializeApplication();
  }

  initializeApplication() {
    document.addEventListener("DOMContentLoaded", () => {
      this.setupApplication();
      this.setupKeyboardInput();
      this.setupWindowEvents();
      this.startRenderLoop();
      this.isInitialized = true;

      console.log("🐍 Snake Protector Typing Master initialized! 🧙‍♂️");
    });
  }

  setupApplication() {
    try {
      // Initialize renderer for game canvas
      this.renderer = new Renderer("gameCanvas");

      // Initialize game engine
      this.gameEngine = new GameEngine(this.renderer);

      // Setup initial game state
      gameState.setState("MENU");

      // Initialize combobox functionality
      if (typeof ComboboxManager !== "undefined") {
        window.comboboxManager = new ComboboxManager();
        window.comboboxManager.initializeComboboxes();
      }

      // Add magical particles to background
      this.createMagicalParticles();
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showErrorMessage(
        "Failed to initialize the game. Please refresh and try again."
      );
    }
  }

  setupKeyboardInput() {
    document.addEventListener("keydown", (e) => {
      this.handleKeyInput(e);
    });

    document.addEventListener("keypress", (e) => {
      // Prevent default for game keys during gameplay
      if (gameState.currentState === "GAME" && Helpers.isValidGameKey(e.key)) {
        e.preventDefault();
      }
    });
  }

  setupWindowEvents() {
    // Handle window resize
    window.addEventListener(
      "resize",
      Helpers.debounce(() => {
        if (this.renderer) {
          this.renderer.resize();
        }
      }, 250)
    );

    // Handle visibility change (pause game when tab is hidden)
    document.addEventListener("visibilitychange", () => {
      if (gameState.currentState === "GAME") {
        if (document.hidden) {
          this.pauseGame();
        } else {
          this.resumeGame();
        }
      }
    });

    // Handle focus loss
    window.addEventListener("blur", () => {
      if (gameState.currentState === "GAME") {
        this.pauseGame();
      }
    });
  }

  handleKeyInput(e) {
    switch (gameState.currentState) {
      case "MENU":
        this.handleMenuKeys(e);
        break;
      case "GAME":
        this.handleGameKeys(e);
        break;
      case "STATISTICS":
        this.handleStatisticsKeys(e);
        break;
      case "RESULTS":
        this.handleResultsKeys(e);
        break;
    }
  }

  handleMenuKeys(e) {
    switch (e.key) {
      case "Enter":
        const startBtn = document.getElementById("startGameBtn");
        if (startBtn && !startBtn.disabled) {
          e.preventDefault();
          startBtn.click();
        }
        break;
      case "s":
      case "S":
        const statsBtn = document.getElementById("viewStatsBtn");
        if (statsBtn) {
          e.preventDefault();
          statsBtn.click();
        }
        break;
    }
  }

  handleGameKeys(e) {
    // Game input is handled by the GameEngine's InputHandler
    // Only handle special keys here
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        this.pauseGame();
        break;
      case "F11":
        // Allow fullscreen toggle
        break;
      case "p":
      case "P":
        if (e.ctrlKey || e.metaKey) break; // Allow Ctrl+P for printing
        e.preventDefault();
        this.togglePause();
        break;
    }
    // Note: Typing input is handled by GameEngine's InputHandler
  }

  handleStatisticsKeys(e) {
    switch (e.key) {
      case "Escape":
      case "Backspace":
        e.preventDefault();
        gameState.setState("MENU");
        break;
    }
  }

  handleResultsKeys(e) {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        const tryAgainBtn = document.getElementById("tryAgainBtn");
        if (tryAgainBtn) {
          tryAgainBtn.click();
        }
        break;
      case "Escape":
        e.preventDefault();
        gameState.setState("MENU");
        break;
    }
  }

  startRenderLoop() {
    const render = (timestamp) => {
      this.updateAndRender(timestamp);
      this.animationId = requestAnimationFrame(render);
    };

    this.animationId = requestAnimationFrame(render);
  }

  updateAndRender(timestamp) {
    // Calculate delta time
    const deltaTime = this.lastTimestamp
      ? (timestamp - this.lastTimestamp) / 1000
      : 0;
    this.lastTimestamp = timestamp;

    // Update and render based on current state
    switch (gameState.currentState) {
      case "GAME":
        if (this.gameEngine) {
          this.gameEngine.update(deltaTime);
          this.gameEngine.render();
        } else {
          console.log("No game engine available in GAME state");
        }
        break;
      case "MENU":
      case "STATISTICS":
      case "RESULTS":
        // Render background effects for menus
        this.renderMenuBackground();
        break;
    }
  }

  renderMenuBackground() {
    if (!this.renderer) return;

    // Clear canvas and draw subtle background effects
    this.renderer.clear();

    // Add some magical particle effects or gradient background
    this.renderer.drawMagicalBackground();
  }

  // Game Control Methods
  startGame(gameConfig) {
    console.log("Starting game from main application");
    if (this.gameEngine) {
      this.gameEngine.startGame(gameConfig);
    }
  }

  pauseGame() {
    if (this.gameEngine && gameState.currentState === "GAME") {
      this.gameEngine.pauseGame();
      console.log("Game paused");
    }
  }

  resumeGame() {
    if (this.gameEngine && gameState.currentState === "GAME") {
      this.gameEngine.resumeGame();
      console.log("Game resumed");
    }
  }

  togglePause() {
    if (this.gameEngine && gameState.currentState === "GAME") {
      if (this.gameEngine.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    }
  }

  stopGame() {
    if (this.gameEngine) {
      this.gameEngine.stopGame();
    }
  }

  // Particle Effects
  createMagicalParticles() {
    // Create floating magical particles in the background
    const particlesContainer = document.createElement("div");
    particlesContainer.className = "magical-particles";
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 8 + "s";
      particle.style.animationDuration = 6 + Math.random() * 4 + "s";
      particlesContainer.appendChild(particle);
    }
  }

  showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
        `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Cleanup method
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Remove event listeners and clean up
    document.removeEventListener("keydown", this.handleKeyInput);
    window.removeEventListener("resize", this.handleResize);
  }
}

// Initialize the game
const snakeProtectorGame = new SnakeProtectorGame();

// Export for debugging and access by other modules
if (typeof window !== "undefined") {
  window.snakeProtectorGame = snakeProtectorGame;
  window.gameState = gameState;
  window.CONFIG = CONFIG;
}
