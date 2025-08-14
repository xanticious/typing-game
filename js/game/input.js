// Input Handler - Keyboard input processing with lockout mechanism

class InputHandler {
  constructor() {
    this.isListening = false;
    this.isLocked = false;
    this.lockoutDuration = 500; // 0.5 seconds
    this.lockoutTimer = 0;
    this.targetLetter = null;

    // Callbacks
    this.onCorrectInput = null;
    this.onIncorrectInput = null;

    this.boundKeyHandler = this.handleKeyPress.bind(this);
  }

  startListening() {
    if (!this.isListening) {
      this.isListening = true;
      document.addEventListener("keydown", this.boundKeyHandler);
      console.log("Input handler started listening");
    }
  }

  stopListening() {
    if (this.isListening) {
      this.isListening = false;
      document.removeEventListener("keydown", this.boundKeyHandler);
      console.log("Input handler stopped listening");
    }
  }

  pauseListening() {
    // Keep event listener but set flag to ignore input
    this.isListening = false;
  }

  resumeListening() {
    this.isListening = true;
  }

  setTargetLetter(letter) {
    this.targetLetter = letter;
  }

  handleKeyPress(event) {
    if (!this.isListening || this.isLocked || !this.targetLetter) {
      return;
    }

    // Prevent default behavior for game keys
    if (this.isGameKey(event.key)) {
      event.preventDefault();
    }

    // Get the pressed key
    const pressedKey = event.key;

    // Only process single character keys and some symbols
    if (pressedKey.length !== 1) {
      return;
    }

    console.log(`Key pressed: "${pressedKey}", Target: "${this.targetLetter}"`);

    // Check if it matches the target letter
    if (pressedKey === this.targetLetter) {
      this.handleCorrectInput();
    } else {
      this.handleIncorrectInput();
    }
  }

  isGameKey(key) {
    // Define which keys should have default behavior prevented
    // Include letters, numbers, symbols, but not special keys like F5, Ctrl, etc.
    const gameKeys = /^[a-zA-Z0-9~!@#$%^&*()_\-+=\{\[\}\]|\\:;\"'<,>\.?\/]$/;
    return gameKeys.test(key);
  }

  handleCorrectInput() {
    console.log("✓ Correct input");

    // Show positive feedback
    this.showFeedback("correct");

    // Call callback
    if (this.onCorrectInput) {
      this.onCorrectInput();
    }
  }

  handleIncorrectInput() {
    console.log("✗ Incorrect input");

    // Show negative feedback
    this.showFeedback("incorrect");

    // Lock input for penalty period
    this.lockInput();

    // Call callback
    if (this.onIncorrectInput) {
      this.onIncorrectInput();
    }
  }

  lockInput() {
    this.isLocked = true;
    this.lockoutTimer = this.lockoutDuration;

    console.log(`Input locked for ${this.lockoutDuration}ms`);

    // Auto-unlock after duration
    setTimeout(() => {
      this.isLocked = false;
      this.lockoutTimer = 0;
      console.log("Input unlocked");
    }, this.lockoutDuration);
  }

  update(deltaTime) {
    // Update lockout timer
    if (this.isLocked && this.lockoutTimer > 0) {
      this.lockoutTimer -= deltaTime * 1000; // Convert to milliseconds
      if (this.lockoutTimer <= 0) {
        this.lockoutTimer = 0;
      }
    }
  }

  showFeedback(type) {
    const feedbackElement = document.getElementById("typingFeedback");
    if (!feedbackElement) return;

    // Clear any existing feedback
    feedbackElement.innerHTML = "";
    feedbackElement.className = "typing-feedback";

    let message, className;
    if (type === "correct") {
      message = "✓ Correct!";
      className = "feedback-correct";
    } else {
      message = "✗ Incorrect!";
      className = "feedback-incorrect";
    }

    const feedbackMsg = document.createElement("div");
    feedbackMsg.textContent = message;
    feedbackMsg.className = className;
    feedbackElement.appendChild(feedbackMsg);

    // Auto-remove feedback after a short time
    setTimeout(() => {
      if (feedbackElement.contains(feedbackMsg)) {
        feedbackElement.removeChild(feedbackMsg);
      }
    }, 1000);
  }

  // Get current lockout status for UI rendering
  getLockoutStatus() {
    return {
      isLocked: this.isLocked,
      timeRemaining: this.lockoutTimer,
      progress: this.isLocked ? this.lockoutTimer / this.lockoutDuration : 0,
    };
  }
}
