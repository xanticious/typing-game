// Helper utility functions

const Helpers = {
  // DOM manipulation helpers
  getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with id '${id}' not found`);
    }
    return element;
  },

  createElement(tag, className = "", textContent = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  },

  // Event handling helpers
  addEventListeners(elements, event, handler) {
    if (!Array.isArray(elements)) {
      elements = [elements];
    }

    elements.forEach((element) => {
      if (element && typeof element.addEventListener === "function") {
        element.addEventListener(event, handler);
      }
    });
  },

  // Form helpers
  getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values (like checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    return data;
  },

  getCheckedValues(name) {
    const checkboxes = document.querySelectorAll(
      `input[name="${name}"]:checked`
    );
    return Array.from(checkboxes).map((cb) => cb.value);
  },

  getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
  },

  // Animation helpers
  fadeIn(element, duration = 300) {
    element.style.opacity = "0";
    element.style.display = "block";

    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = progress.toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  },

  fadeOut(element, duration = 300) {
    const startOpacity = parseFloat(element.style.opacity) || 1;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = (startOpacity * (1 - progress)).toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = "none";
      }
    }

    requestAnimationFrame(animate);
  },

  // String helpers
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  // Math helpers
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  // Random helpers
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Local storage helpers (for future use)
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn("Could not save to localStorage:", error);
      return false;
    }
  },

  loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn("Could not load from localStorage:", error);
      return defaultValue;
    }
  },

  // Keyboard helpers
  isAlphanumeric(key) {
    return /^[a-zA-Z0-9]$/.test(key);
  },

  isSymbol(key) {
    return /^[~!@#$%^&*()_\-+={\[}\]|\\:;"'<,>.?/]$/.test(key);
  },

  isValidGameKey(key) {
    return this.isAlphanumeric(key) || this.isSymbol(key);
  },

  // Performance helpers
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Canvas helpers
  setupHighDPICanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;

    // Set actual size in memory (scaled to account for extra pixel density)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    // Scale the canvas back down using CSS
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    // Scale the drawing context to account for the extra pixel density
    ctx.scale(ratio, ratio);

    return ctx;
  },

  // Error handling
  handleError(error, context = "") {
    console.error(`Error${context ? ` in ${context}` : ""}:`, error);

    // Could add user-friendly error display here
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = "An error occurred. Please try again.";

    // Show error temporarily
    document.body.appendChild(errorElement);
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  },

  // Validation helpers
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isEmpty(value) {
    return (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
  },
};

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Helpers;
}
