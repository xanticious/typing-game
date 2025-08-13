// Combobox functionality for main menu

class ComboboxManager {
  constructor() {
    this.multiSelectCombobox = null;
    this.isInitialized = false;
  }

  initializeComboboxes() {
    if (this.isInitialized) {
      console.warn("ComboboxManager already initialized, skipping...");
      return;
    }

    this.setupMultiSelectCombobox();
    this.setupRegularComboboxes();
    this.setupEventListeners();
    this.isInitialized = true;
    console.log("ComboboxManager initialized successfully");
  }

  setupMultiSelectCombobox() {
    this.multiSelectCombobox = document.getElementById("characterSetsCombobox");
    if (!this.multiSelectCombobox) return;

    const display = this.multiSelectCombobox.querySelector(".combobox-display");
    const dropdown =
      this.multiSelectCombobox.querySelector(".combobox-dropdown");
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

    // Handle display click
    display.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Handle keyboard navigation
    display.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          this.toggleDropdown();
          break;
        case "Escape":
          this.closeDropdown();
          break;
      }
    });

    // Handle checkbox changes
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateDisplayText();
        this.validateAndNotify();
      });
    });

    // Handle option clicks (for label clicking)
    const options = dropdown.querySelectorAll(".combobox-option");
    options.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change"));
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.multiSelectCombobox.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Initialize display text
    this.updateDisplayText();
  }

  setupRegularComboboxes() {
    const difficultyCombobox = document.getElementById("difficultyCombobox");
    const durationCombobox = document.getElementById("durationCombobox");

    [difficultyCombobox, durationCombobox].forEach((combobox) => {
      if (!combobox) return;

      this.setupSingleSelectCombobox(combobox);
    });
  }

  setupSingleSelectCombobox(combobox) {
    console.log("Setting up single select combobox:", combobox.id);

    const display = combobox.querySelector(".combobox-display");
    const dropdown = combobox.querySelector(".combobox-dropdown");
    const options = dropdown.querySelectorAll(".combobox-option");

    // Handle display click
    display.addEventListener("click", (e) => {
      console.log("Display clicked for:", combobox.id);
      e.stopPropagation();
      this.toggleSingleSelectDropdown(combobox);
    });

    // Handle keyboard navigation
    display.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          this.toggleSingleSelectDropdown(combobox);
          break;
        case "Escape":
          this.closeSingleSelectDropdown(combobox);
          break;
        case "ArrowDown":
          e.preventDefault();
          this.navigateOptions(combobox, 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          this.navigateOptions(combobox, -1);
          break;
      }
    });

    // Handle option clicks
    options.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectOption(combobox, option);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!combobox.contains(e.target)) {
        this.closeSingleSelectDropdown(combobox);
      }
    });
  }

  toggleSingleSelectDropdown(combobox) {
    if (combobox.classList.contains("open")) {
      this.closeSingleSelectDropdown(combobox);
    } else {
      this.openSingleSelectDropdown(combobox);
    }
  }

  openSingleSelectDropdown(combobox) {
    // Close any other open dropdowns
    document
      .querySelectorAll(".single-select-combobox.open")
      .forEach((other) => {
        if (other !== combobox) {
          this.closeSingleSelectDropdown(other);
        }
      });

    combobox.classList.add("open");
  }

  closeSingleSelectDropdown(combobox) {
    combobox.classList.remove("open");
  }

  selectOption(combobox, option) {
    // Remove selected class from all options
    const options = combobox.querySelectorAll(".combobox-option");
    options.forEach((opt) => opt.classList.remove("selected"));

    // Add selected class to clicked option
    option.classList.add("selected");

    // Update display text
    const displayText = combobox.querySelector(".display-text");
    if (displayText) {
      displayText.textContent = option.textContent;
    }

    // Close dropdown
    this.closeSingleSelectDropdown(combobox);

    // Notify validation system
    this.validateAndNotify();
  }

  navigateOptions(combobox, direction) {
    const options = Array.from(combobox.querySelectorAll(".combobox-option"));
    const currentSelected = combobox.querySelector(".combobox-option.selected");
    const currentIndex = options.indexOf(currentSelected);

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;

    this.selectOption(combobox, options[nextIndex]);
  }

  setupEventListeners() {
    // Handle escape key globally
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeDropdown();
        // Close all single-select dropdowns
        document
          .querySelectorAll(".single-select-combobox.open")
          .forEach((combobox) => {
            this.closeSingleSelectDropdown(combobox);
          });
      }
    });
  }

  toggleDropdown() {
    if (this.multiSelectCombobox.classList.contains("open")) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.multiSelectCombobox.classList.add("open");

    // Focus first checkbox for keyboard navigation
    const firstCheckbox = this.multiSelectCombobox.querySelector(
      'input[type="checkbox"]'
    );
    if (firstCheckbox) {
      setTimeout(() => firstCheckbox.focus(), 100);
    }
  }

  closeDropdown() {
    this.multiSelectCombobox.classList.remove("open");

    // Return focus to display
    const display = this.multiSelectCombobox.querySelector(".combobox-display");
    if (display) {
      display.focus();
    }
  }

  updateDisplayText() {
    const checkboxes = this.multiSelectCombobox.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    const selectedText =
      this.multiSelectCombobox.querySelector(".selected-text");

    if (checkboxes.length === 0) {
      selectedText.textContent = "Select character sets...";
      selectedText.style.color = "#999";
    } else {
      const labels = Array.from(checkboxes).map((cb) => {
        const label = cb.parentElement.querySelector("label");
        return label.textContent;
      });

      if (labels.length === 1) {
        selectedText.textContent = labels[0];
      } else if (labels.length <= 4) {
        selectedText.textContent = labels.join(", ");
      } else {
        selectedText.textContent = `${labels.length} character sets selected`;
      }
      selectedText.style.color = "#ffffff";
    }
  }

  validateAndNotify() {
    // Trigger validation update
    if (typeof menuValidator !== "undefined" && menuValidator) {
      setTimeout(() => {
        menuValidator.validateCharacterSets();
        menuValidator.updateStartButton();
      }, 50);
    }

    // Update game state
    if (typeof gameState !== "undefined" && gameState) {
      const config = this.getCurrentConfiguration();
      if (config) {
        gameState.updateConfig(config);
      }
    }
  }

  getCurrentConfiguration() {
    // Get character sets
    const characterSets = {};
    const checkboxes = this.multiSelectCombobox.querySelectorAll(
      'input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
      characterSets[checkbox.id] = checkbox.checked;
    });

    // Get difficulty using helper method
    const difficulty =
      this.getSingleSelectValue("difficultyCombobox") || "medium";

    // Get duration using helper method
    const duration = this.getSingleSelectValue("durationCombobox") || "medium";

    return {
      characterSets,
      difficulty,
      duration,
    };
  }

  getSingleSelectValue(comboboxId) {
    const combobox = document.getElementById(comboboxId);
    if (!combobox) return null;

    // If it's a single-select combobox, get value from selected option
    if (combobox.classList.contains("single-select-combobox")) {
      const selectedOption = combobox.querySelector(
        ".combobox-option.selected"
      );
      return selectedOption ? selectedOption.getAttribute("data-value") : null;
    }

    // Fallback for legacy select elements
    return combobox.value || null;
  }

  setConfiguration(config) {
    // Set character sets
    if (config.characterSets) {
      Object.keys(config.characterSets).forEach((setKey) => {
        const checkbox = document.getElementById(setKey);
        if (checkbox) {
          checkbox.checked = config.characterSets[setKey];
        }
      });
      this.updateDisplayText();
    }

    // Set difficulty using helper method
    if (config.difficulty) {
      this.setSingleSelectValue("difficultyCombobox", config.difficulty);
    }

    // Set duration using helper method
    if (config.duration) {
      this.setSingleSelectValue("durationCombobox", config.duration);
    }

    this.validateAndNotify();
  }

  setSingleSelectValue(comboboxId, value) {
    const combobox = document.getElementById(comboboxId);
    if (!combobox) return;

    // If it's a single-select combobox
    if (combobox.classList.contains("single-select-combobox")) {
      // Remove selected class from all options
      const options = combobox.querySelectorAll(".combobox-option");
      options.forEach((opt) => opt.classList.remove("selected"));

      // Find and select the correct option
      const targetOption = combobox.querySelector(`[data-value="${value}"]`);
      if (targetOption) {
        targetOption.classList.add("selected");

        // Update display text
        const displayText = combobox.querySelector(".display-text");
        if (displayText) {
          displayText.textContent = targetOption.textContent;
        }
      }
    } else {
      // Fallback for legacy select elements
      combobox.value = value;
    }
  }

  getSelectedCharacterSets() {
    const checkboxes = this.multiSelectCombobox.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    return Array.from(checkboxes).map((cb) => cb.id);
  }

  // Accessibility helpers
  announceChange(message) {
    let announcer = document.getElementById("combobox-announcer");
    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "combobox-announcer";
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

// Global combobox manager instance
// Initialized by main.js
let comboboxManager;
