// Main application entry point

class SnakeProtectorGame {
  constructor() {
    this.isInitialized = false;
    this.renderer = null;
    this.animationId = null;

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
    // Handle game controls
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        this.pauseGame();
        break;
      case "F11":
        // Allow fullscreen toggle
        break;
      default:
        // Handle typing input
        if (Helpers.isValidGameKey(e.key)) {
          e.preventDefault();
          gameState.handleGameInput(e.key);
        }
        break;
    }
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
    if (!this.renderer || gameState.currentState !== "GAME") {
      return;
    }

    // Clear canvas
    this.renderer.clear();

    // Draw spiral path
    this.renderer.drawSpiral(
      this.renderer.centerX,
      this.renderer.centerY,
      CONFIG.GAME.SPIRAL_START_RADIUS,
      CONFIG.GAME.SPIRAL_END_RADIUS,
      CONFIG.GAME.SPIRAL_TURNS * Math.PI * 2
    );

    // Draw wizard in center
    this.renderer.drawWizard(
      this.renderer.centerX,
      this.renderer.centerY,
      timestamp
    );

    // Draw snake if game is active
    if (gameState.currentGameData) {
      this.renderSnake(timestamp);
    }
  }

  renderSnake(timestamp) {
    const gameData = gameState.currentGameData;
    if (!gameData || !gameData.snakeLetters) return;

    const { snakeLetters, currentLetterIndex } = gameData;
    const segments = this.calculateSnakePositions(timestamp);

    // Draw snake tail
    if (segments.length > 1) {
      this.renderer.drawSnakeTail(segments);
    }

    // Draw snake segments
    segments.forEach((segment, index) => {
      if (index < snakeLetters.length) {
        const letter = snakeLetters[index];
        const isActive = index === currentLetterIndex;

        this.renderer.drawSnakeSegment(
          segment.x,
          segment.y,
          letter,
          isActive,
          CONFIG.GAME.SEGMENT_RADIUS
        );
      }
    });

    // Draw snake head
    if (segments.length > 0) {
      const headSegment = segments[0];
      this.renderer.drawSnakeHead(
        headSegment.x,
        headSegment.y,
        headSegment.angle,
        CONFIG.GAME.HEAD_SIZE
      );
    }
  }

  calculateSnakePositions(timestamp) {
    const gameData = gameState.currentGameData;
    if (!gameData) return [];

    // Calculate snake progress along spiral
    const elapsedSeconds =
      (timestamp - (gameData.renderStartTime || timestamp)) / 1000;
    const totalDuration = gameData.durationSeconds;
    const progress = Math.min(elapsedSeconds / totalDuration, 1);

    // Calculate positions for each segment
    const positions = [];
    const segmentCount = gameData.snakeLetters.length;

    for (let i = 0; i < segmentCount; i++) {
      const segmentProgress = Math.max(0, progress - i * 0.02); // Spacing between segments

      const spiralPos = MathUtils.spiralPosition(
        this.renderer.centerX,
        this.renderer.centerY,
        CONFIG.GAME.SPIRAL_START_RADIUS,
        CONFIG.GAME.SPIRAL_END_RADIUS,
        CONFIG.GAME.SPIRAL_TURNS * Math.PI * 2,
        segmentProgress
      );

      positions.push(spiralPos);
    }

    // Initialize render start time
    if (!gameData.renderStartTime) {
      gameData.renderStartTime = timestamp;
    }

    return positions;
  }

  pauseGame() {
    if (gameState.currentState === "GAME" && gameState.currentGameData) {
      gameState.currentGameData.isPaused = true;

      // Show pause overlay
      const pauseOverlay = document.createElement("div");
      pauseOverlay.id = "pauseOverlay";
      pauseOverlay.className = "game-paused active";
      pauseOverlay.innerHTML = `
                <div class="pause-content">
                    <h2>⏸️ Game Paused</h2>
                    <p>Press any key to continue</p>
                </div>
            `;

      document.getElementById("gameArena").appendChild(pauseOverlay);

      // Resume on any key press
      const resumeHandler = (e) => {
        e.preventDefault();
        this.resumeGame();
        document.removeEventListener("keydown", resumeHandler);
      };

      document.addEventListener("keydown", resumeHandler);
    }
  }

  resumeGame() {
    if (gameState.currentState === "GAME" && gameState.currentGameData) {
      gameState.currentGameData.isPaused = false;

      // Remove pause overlay
      const pauseOverlay = document.getElementById("pauseOverlay");
      if (pauseOverlay) {
        pauseOverlay.remove();
      }
    }
  }

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
const game = new SnakeProtectorGame();

// Export for debugging
if (typeof window !== "undefined") {
  window.game = game;
  window.gameState = gameState;
  window.CONFIG = CONFIG;
}
