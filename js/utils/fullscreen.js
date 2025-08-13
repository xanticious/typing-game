// Fullscreen management utility

class FullscreenManager {
  constructor() {
    this.fullscreenButtons = [];
    this.isFullscreen = false;
    this.initialize();
  }

  initialize() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Find all fullscreen buttons
    this.fullscreenButtons = [
      document.getElementById("fullscreenToggle"), // Game arena
      document.getElementById("fullscreenToggleMenu"), // Main menu
      document.getElementById("fullscreenToggleStats"), // Statistics
      document.getElementById("fullscreenToggleResults"), // Results
    ].filter((btn) => btn !== null);

    if (this.fullscreenButtons.length === 0) {
      console.warn("No fullscreen buttons found");
      return;
    }

    // Add event listeners to all buttons
    this.fullscreenButtons.forEach((button) => {
      button.addEventListener("click", () => this.toggleFullscreen());
    });

    // Listen for fullscreen changes (ESC key, F11, etc.)
    document.addEventListener("fullscreenchange", () =>
      this.handleFullscreenChange()
    );
    document.addEventListener("webkitfullscreenchange", () =>
      this.handleFullscreenChange()
    );
    document.addEventListener("mozfullscreenchange", () =>
      this.handleFullscreenChange()
    );
    document.addEventListener("MSFullscreenChange", () =>
      this.handleFullscreenChange()
    );

    // Handle keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeydown(e));

    // Update initial state
    this.updateButtonState();
  }

  async toggleFullscreen() {
    try {
      if (this.isFullscreenActive()) {
        await this.exitFullscreen();
      } else {
        await this.enterFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen toggle failed:", error);
      // Show a brief error message to the user
      this.showMessage("Fullscreen not supported in this browser", "error");
    }
  }

  async enterFullscreen() {
    const element = document.documentElement;

    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen();
    } else {
      throw new Error("Fullscreen API not supported");
    }
  }

  async exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      await document.msExitFullscreen();
    }
  }

  isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  handleFullscreenChange() {
    this.isFullscreen = this.isFullscreenActive();
    this.updateButtonState();

    // Update canvas size if in game
    if (window.game && window.game.renderer) {
      setTimeout(() => {
        window.game.renderer.resize();
      }, 100);
    }
  }

  updateButtonState() {
    if (this.fullscreenButtons.length === 0) return;

    // Update all fullscreen buttons
    this.fullscreenButtons.forEach((button) => {
      const icon = button.querySelector(".fullscreen-icon");

      if (this.isFullscreenActive()) {
        button.classList.add("fullscreen-active");
        button.title = "Exit Fullscreen (ESC or F11)";
        if (icon) {
          icon.textContent = "⛶"; // Exit fullscreen icon (rotated)
        }
      } else {
        button.classList.remove("fullscreen-active");
        button.title = "Enter Fullscreen (F11)";
        if (icon) {
          icon.textContent = "⛶"; // Enter fullscreen icon
        }
      }
    });
  }

  handleKeydown(e) {
    // Handle F11 key for fullscreen toggle
    if (e.key === "F11") {
      e.preventDefault();
      this.toggleFullscreen();
    }

    // Handle ESC key when in fullscreen
    if (e.key === "Escape" && this.isFullscreenActive()) {
      // Let the browser handle ESC naturally
      // The fullscreenchange event will update our state
    }
  }

  showMessage(text, type = "info") {
    // Create a temporary message overlay
    const messageEl = document.createElement("div");
    messageEl.className = `fullscreen-message ${type}`;
    messageEl.textContent = text;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: ${type === "error" ? "#ff0000" : "#d4af37"};
      padding: 10px 15px;
      border-radius: 5px;
      border: 1px solid ${type === "error" ? "#ff0000" : "#d4af37"};
      z-index: 1000;
      font-size: 14px;
      backdrop-filter: blur(10px);
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
      messageEl.style.opacity = "0";
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }

  // Check if fullscreen is supported
  isSupported() {
    return !!(
      document.documentElement.requestFullscreen ||
      document.documentElement.webkitRequestFullscreen ||
      document.documentElement.mozRequestFullScreen ||
      document.documentElement.msRequestFullscreen
    );
  }
}

// Create global instance
window.fullscreenManager = new FullscreenManager();
