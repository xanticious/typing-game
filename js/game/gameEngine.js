// Game Engine - Core game logic and coordination

class GameEngine {
  constructor(renderer) {
    this.renderer = renderer;
    this.zigzagPath = null;
    this.snake = null;
    this.inputHandler = null;
    this.scoreCalculator = null;

    this.isRunning = false;
    this.isPaused = false;
    this.gameConfig = null;
    this.startTime = null;
    this.gameTime = 0;
    this.maxGameTime = 0;

    this.setupInputHandler();
  }

  setupInputHandler() {
    this.inputHandler = new InputHandler();
    this.inputHandler.onCorrectInput = () => this.handleCorrectInput();
    this.inputHandler.onIncorrectInput = () => this.handleIncorrectInput();
  }

  startGame(config) {
    console.log("Starting game with config:", config);

    this.gameConfig = { ...config };
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.gameTime = 0;
    this.maxGameTime = CONFIG.DURATION_SETTINGS[config.duration].seconds;

    // Ensure canvas is properly sized for game
    this.renderer.resize();

    // Initialize game components
    this.initializeZigzagPath();
    this.initializeSnake();
    this.initializeScoreCalculator();

    // Set up snake speed based on difficulty
    this.calculateSnakeSpeed();

    // Start input listening
    this.inputHandler.startListening();

    // Update game state to show current stats
    this.updateGameUI();

    console.log("Game started successfully");
  }

  initializeZigzagPath() {
    const canvas = this.renderer.canvas;
    console.log(
      "Initializing zigzag path with canvas dimensions:",
      canvas.width,
      "x",
      canvas.height
    );
    console.log(
      "Display dimensions:",
      this.renderer.displayWidth,
      "x",
      this.renderer.displayHeight
    );
    this.zigzagPath = new ZigzagPath(
      this.renderer.displayWidth,
      this.renderer.displayHeight,
      6
    );
    console.log(
      "ZigzagPath created, total length:",
      this.zigzagPath.totalLength
    );
  }

  initializeSnake() {
    // Generate letters based on configuration
    const letters = this.generateLetterSequence();
    this.snake = new Snake(this.zigzagPath, letters);
  }

  generateLetterSequence() {
    const { characterSets, duration } = this.gameConfig;
    let characterPool = [];

    // Build character pool based on selected sets
    if (characterSets.lowercase) {
      characterPool.push(..."abcdefghijklmnopqrstuvwxyz".split(""));
    }
    if (characterSets.uppercase) {
      characterPool.push(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
    }
    if (characterSets.numbers) {
      characterPool.push(..."0123456789".split(""));
    }
    if (characterSets.symbols) {
      characterPool.push(..."~!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/".split(""));
    }

    if (characterPool.length === 0) {
      console.error("No character sets selected!");
      characterPool = ["a", "b", "c"]; // Fallback
    }

    console.log("Character pool:", characterPool);

    // Calculate number of letters based on duration and difficulty
    const durationSeconds = CONFIG.DURATION_SETTINGS[duration].seconds;
    const targetWPM =
      CONFIG.DIFFICULTY_SETTINGS[this.gameConfig.difficulty].targetWPM;
    const estimatedCharacters = Math.max(
      10,
      Math.floor((targetWPM * durationSeconds) / 12)
    ); // 12 chars ≈ 1 word

    console.log("Estimated characters needed:", estimatedCharacters);

    // Generate random sequence
    const letters = [];
    for (let i = 0; i < estimatedCharacters; i++) {
      const randomChar =
        characterPool[Math.floor(Math.random() * characterPool.length)];
      letters.push(randomChar);
    }

    console.log("Generated letters:", letters);
    return letters;
  }

  calculateSnakeSpeed() {
    const difficulty = CONFIG.DIFFICULTY_SETTINGS[this.gameConfig.difficulty];
    const pathLength = this.zigzagPath.totalLength;
    const timeToComplete = this.maxGameTime;

    // Calculate speed so snake takes the full duration to reach wizard
    const baseSpeed = pathLength / timeToComplete;
    const speedWithDifficulty = baseSpeed * difficulty.multiplier;

    this.snake.setSpeed(speedWithDifficulty);

    console.log(`Snake speed set to: ${speedWithDifficulty} pixels/second`);
  }

  initializeScoreCalculator() {
    this.scoreCalculator = new ScoreCalculator();
    this.scoreCalculator.startTracking();
  }

  update(deltaTime) {
    if (!this.isRunning || this.isPaused) return;

    this.gameTime += deltaTime;

    // Check for time limit (if applicable)
    if (this.gameTime >= this.maxGameTime) {
      this.endGame("timeUp");
      return;
    }

    // Update snake
    const snakeResult = this.snake.update(deltaTime);

    if (snakeResult.reachedWizard) {
      this.endGame("defeat");
      return;
    }

    // Check for victory condition
    if (this.snake.isDestroyed) {
      this.endGame("victory");
      return;
    }

    // Update input handler
    this.inputHandler.update(deltaTime);

    // Update score calculator
    this.scoreCalculator.update();

    // Update UI
    this.updateGameUI();
  }

  render() {
    if (!this.isRunning) return;

    console.log(
      "GameEngine.render() called, zigzagPath:",
      this.zigzagPath ? "exists" : "null",
      "snake:",
      this.snake ? "exists" : "null"
    );

    // Clear canvas
    this.renderer.clear();

    // Render zigzag path (for debugging - can be disabled later)
    if (this.zigzagPath) {
      this.zigzagPath.renderPath(this.renderer.ctx);
    }

    // Render snake
    if (this.snake) {
      this.snake.render(this.renderer.ctx);
    }

    // Render wizard at bottom center
    this.renderWizard();

    // Render UI overlays
    this.renderUIOverlays();
  }

  renderWizard() {
    const wizardPos = this.zigzagPath.wizardPosition;
    const ctx = this.renderer.ctx;

    ctx.save();
    ctx.translate(wizardPos.x, wizardPos.y);

    // Draw wizard
    ctx.fillStyle = "#8A2BE2"; // Blue violet robe
    ctx.strokeStyle = "#4B0082"; // Indigo outline
    ctx.lineWidth = 2;

    // Wizard body (triangle robe)
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(-15, 10);
    ctx.lineTo(15, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wizard head
    ctx.fillStyle = "#FDBCB4"; // Skin color
    ctx.beginPath();
    ctx.arc(0, -35, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wizard hat
    ctx.fillStyle = "#4B0082";
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(-8, -35);
    ctx.lineTo(8, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wand
    ctx.strokeStyle = "#8B4513"; // Brown
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, -10);
    ctx.lineTo(25, -25);
    ctx.stroke();

    // Wand star
    ctx.fillStyle = "#FFD700"; // Gold
    ctx.beginPath();
    ctx.arc(25, -25, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderUIOverlays() {
    const ctx = this.renderer.ctx;

    // Render input lockout overlay if active
    if (this.inputHandler.isLocked) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      ctx.fillRect(
        0,
        0,
        this.renderer.canvas.width,
        this.renderer.canvas.height
      );
    }
  }

  handleCorrectInput() {
    console.log("Correct input received");

    const wasDestroyed = this.snake.removeActiveSegment();
    this.scoreCalculator.recordCorrectInput();

    if (wasDestroyed) {
      this.endGame("victory");
    }

    this.updateGameUI();
  }

  handleIncorrectInput() {
    console.log("Incorrect input received");

    this.scoreCalculator.recordMistake();
    this.updateGameUI();
  }

  updateGameUI() {
    // Update WPM display
    const currentWPM = this.scoreCalculator.getCurrentWPM();
    const wpmElement = document.getElementById("currentWPM");
    if (wpmElement) {
      wpmElement.textContent = currentWPM;
    }

    // Update mistakes display
    const mistakesElement = document.getElementById("currentMistakes");
    if (mistakesElement) {
      mistakesElement.textContent = this.scoreCalculator.mistakes;
    }

    // Update letters left display
    const lettersLeftElement = document.getElementById("lettersLeft");
    if (lettersLeftElement) {
      lettersLeftElement.textContent = this.snake.getRemainingLetters();
    }

    // Update active letter for input handler
    if (this.snake) {
      const activeLetter = this.snake.getActiveLetter();
      this.inputHandler.setTargetLetter(activeLetter);
    }
  }

  endGame(reason) {
    console.log("Game ended:", reason);

    this.isRunning = false;
    this.inputHandler.stopListening();

    // Calculate final results
    const results = this.scoreCalculator.getFinalResults();
    results.reason = reason;
    results.timeElapsed = this.gameTime;
    results.charactersTyped = this.scoreCalculator.charactersTyped;

    // Show results screen
    gameState.showResults(results);
  }

  pauseGame() {
    this.isPaused = true;
    this.inputHandler.pauseListening();
  }

  resumeGame() {
    this.isPaused = false;
    this.inputHandler.resumeListening();
  }

  stopGame() {
    this.isRunning = false;
    this.isPaused = false;
    this.inputHandler.stopListening();
  }

  getCurrentActiveLetter() {
    return this.snake ? this.snake.getActiveLetter() : null;
  }
}
