// Form validation for main menu configuration

class MenuValidator {
  constructor() {
    this.rules = {
      characterSets: {
        required: true,
        minSelected: 1,
        message: "Please select at least one character set to continue.",
      },
    };

    this.validationMessage = document.getElementById("validationMessage");
    this.startButton = document.getElementById("startGameBtn");

    this.initializeValidation();
  }

  initializeValidation() {
    // Add event listeners for real-time validation
    this.setupCharacterSetValidation();
    this.setupFormSubmission();
  }

  setupCharacterSetValidation() {
    // For combobox structure, we need to listen to checkbox changes within the dropdown
    const characterSetCheckboxes = document.querySelectorAll(
      '#characterSetsCombobox input[type="checkbox"]'
    );

    characterSetCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.validateCharacterSets();
        this.updateStartButton();
      });
    });

    // Initial validation
    this.validateCharacterSets();
    this.updateStartButton();
  }

  setupFormSubmission() {
    if (this.startButton) {
      this.startButton.addEventListener("click", (e) => {
        e.preventDefault();

        if (this.validateAll()) {
          this.handleValidSubmission();
        } else {
          this.showValidationErrors();
        }
      });
    }
  }

  validateCharacterSets() {
    // Get checked checkboxes from the combobox dropdown
    const selectedCheckboxes = document.querySelectorAll(
      '#characterSetsCombobox input[type="checkbox"]:checked'
    );
    const selectedSets = Array.from(selectedCheckboxes).map((cb) => cb.id);
    const isValid = selectedSets.length >= this.rules.characterSets.minSelected;

    this.updateValidationDisplay(isValid);

    return {
      isValid,
      selectedSets,
      error: isValid ? null : this.rules.characterSets.message,
    };
  }

  // Helper method to get value from single-select combobox
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

  validateDifficulty() {
    const selectedDifficulty = this.getSingleSelectValue("difficultyCombobox");
    const isValid =
      selectedDifficulty !== null &&
      CONFIG.DIFFICULTY_SETTINGS[selectedDifficulty];

    return {
      isValid,
      value: selectedDifficulty,
      error: isValid ? null : "Please select a difficulty level.",
    };
  }

  validateDuration() {
    const selectedDuration = this.getSingleSelectValue("durationCombobox");
    const isValid =
      selectedDuration !== null && CONFIG.DURATION_SETTINGS[selectedDuration];

    return {
      isValid,
      value: selectedDuration,
      error: isValid ? null : "Please select a time duration.",
    };
  }

  validateAll() {
    const characterSetsValidation = this.validateCharacterSets();
    const difficultyValidation = this.validateDifficulty();
    const durationValidation = this.validateDuration();

    const isAllValid =
      characterSetsValidation.isValid &&
      difficultyValidation.isValid &&
      durationValidation.isValid;

    return {
      isValid: isAllValid,
      characterSets: characterSetsValidation,
      difficulty: difficultyValidation,
      duration: durationValidation,
    };
  }

  updateValidationDisplay(isValid) {
    if (!this.validationMessage) return;

    if (isValid) {
      this.validationMessage.classList.remove("show");
    } else {
      this.validationMessage.classList.add("show");
      this.validationMessage.textContent = this.rules.characterSets.message;
    }
  }

  updateStartButton() {
    if (!this.startButton) return;

    const validation = this.validateAll();

    if (validation.isValid) {
      this.startButton.disabled = false;
      this.startButton.classList.remove("disabled");
    } else {
      this.startButton.disabled = true;
      this.startButton.classList.add("disabled");
    }
  }

  showValidationErrors() {
    const validation = this.validateAll();
    const errors = [];

    if (!validation.characterSets.isValid) {
      errors.push(validation.characterSets.error);
    }
    if (!validation.difficulty.isValid) {
      errors.push(validation.difficulty.error);
    }
    if (!validation.duration.isValid) {
      errors.push(validation.duration.error);
    }

    if (errors.length > 0 && this.validationMessage) {
      this.validationMessage.textContent = errors[0]; // Show first error
      this.validationMessage.classList.add("show");
    }
  }

  handleValidSubmission() {
    const validation = this.validateAll();

    if (!validation.isValid) {
      console.error("Form validation failed");
      return;
    }

    // Build configuration object
    const config = {
      characterSets: {},
      difficulty: validation.difficulty.value,
      duration: validation.duration.value,
    };

    // Set character sets
    Object.keys(CONFIG.CHARACTER_SETS).forEach((setKey) => {
      config.characterSets[setKey] =
        validation.characterSets.selectedSets.includes(setKey);
    });

    // Update game state and start game
    gameState.updateConfig(config);
    gameState.setState("GAME");
  }

  // Utility methods for external use
  getCurrentConfig() {
    const validation = this.validateAll();

    if (!validation.isValid) {
      return null;
    }

    const config = {
      characterSets: {},
      difficulty: validation.difficulty.value,
      duration: validation.duration.value,
    };

    Object.keys(CONFIG.CHARACTER_SETS).forEach((setKey) => {
      config.characterSets[setKey] =
        validation.characterSets.selectedSets.includes(setKey);
    });

    return config;
  }

  // Helper method to set value in single-select combobox
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

  setConfig(config) {
    // Set character sets
    Object.keys(config.characterSets || {}).forEach((setKey) => {
      const checkbox = document.getElementById(setKey);
      if (checkbox) {
        checkbox.checked = config.characterSets[setKey];
      }
    });

    // Update combobox display if character sets changed
    if (typeof comboboxManager !== "undefined" && comboboxManager) {
      comboboxManager.updateDisplayText();
    }

    // Set difficulty
    if (config.difficulty) {
      this.setSingleSelectValue("difficultyCombobox", config.difficulty);
    }

    // Set duration
    if (config.duration) {
      this.setSingleSelectValue("durationCombobox", config.duration);
    }

    // Revalidate after setting values
    this.validateCharacterSets();
    this.updateStartButton();
  }

  reset() {
    // Reset to default configuration
    this.setConfig(CONFIG.DEFAULT_CONFIG);
  }

  // Character set utilities
  getSelectedCharacterPool() {
    const validation = this.validateCharacterSets();

    if (!validation.isValid) {
      return "";
    }

    let pool = "";
    validation.selectedSets.forEach((setKey) => {
      if (CONFIG.CHARACTER_SETS[setKey]) {
        pool += CONFIG.CHARACTER_SETS[setKey];
      }
    });

    return pool;
  }

  getConfigurationSummary() {
    const validation = this.validateAll();

    if (!validation.isValid) {
      return null;
    }

    return {
      characterSets: validation.characterSets.selectedSets,
      difficulty: {
        key: validation.difficulty.value,
        label: CONFIG.DIFFICULTY_SETTINGS[validation.difficulty.value]?.label,
      },
      duration: {
        key: validation.duration.value,
        label: CONFIG.DURATION_SETTINGS[validation.duration.value]?.label,
        seconds: CONFIG.DURATION_SETTINGS[validation.duration.value]?.seconds,
      },
      characterPool: this.getSelectedCharacterPool(),
    };
  }
}

// Initialize validator when DOM is loaded
let menuValidator;

document.addEventListener("DOMContentLoaded", () => {
  menuValidator = new MenuValidator();
});
