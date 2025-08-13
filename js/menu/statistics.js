// Statistics view controller

class Statistics {
  constructor() {
    this.isInitialized = false;
    this.sortColumn = "finalWPM";
    this.sortDirection = "desc";

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.addEventListener("DOMContentLoaded", () => {
      this.setupStatisticsView();
      this.isInitialized = true;
    });
  }

  setupStatisticsView() {
    // Setup table sorting
    this.setupTableSorting();

    // Setup navigation
    this.setupNavigationHandlers();

    // Setup keyboard navigation
    this.setupKeyboardNavigation();
  }

  setupTableSorting() {
    const tableHeaders = document.querySelectorAll(".stats-table th");

    tableHeaders.forEach((header, index) => {
      header.style.cursor = "pointer";
      header.addEventListener("click", () => {
        this.sortTable(index);
      });

      // Add visual indicator for sortable columns
      header.title = `Click to sort by ${header.textContent}`;
    });
  }

  setupNavigationHandlers() {
    const backBtn = document.getElementById("backToMenuBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.returnToMenu();
      });
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Only handle keys when statistics screen is active
      if (gameState.currentState !== "STATISTICS") return;

      switch (e.key) {
        case "Escape":
        case "Backspace":
          e.preventDefault();
          this.returnToMenu();
          break;

        case "r":
        case "R":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.refreshStatistics();
          }
          break;
      }
    });
  }

  displayStatistics() {
    const tbody = document.getElementById("statsTableBody");
    if (!tbody) {
      console.error("Statistics table body not found");
      return;
    }

    // Clear existing content
    tbody.innerHTML = "";

    // Get statistics from game state
    const stats = Array.from(gameState.sessionStats.values());

    if (stats.length === 0) {
      this.displayEmptyState(tbody);
      return;
    }

    // Sort statistics
    const sortedStats = this.sortStatistics(stats);

    // Display each statistic
    sortedStats.forEach((stat, index) => {
      const row = this.createStatisticRow(stat, index);
      tbody.appendChild(row);
    });

    // Update table accessibility
    this.updateTableAccessibility();
  }

  displayEmptyState(tbody) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td colspan="5" class="empty-stats">
                <div class="empty-stats-content">
                    📊
                    <br>
                    No games played yet today.
                    <br>
                    <small>Play some games to see your statistics!</small>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  }

  createStatisticRow(stat, index) {
    const row = document.createElement("tr");

    // Parse configuration from hash
    const configData = this.parseConfigHash(stat.configHash);

    // Format character sets display
    const charSetsDisplay = this.formatCharacterSets(configData.characterSets);

    // Get difficulty and duration labels
    const difficultyLabel =
      CONFIG.DIFFICULTY_SETTINGS[configData.difficulty]?.label ||
      configData.difficulty;
    const durationLabel =
      CONFIG.DURATION_SETTINGS[configData.duration]?.label ||
      configData.duration;

    // Create row content
    row.innerHTML = `
            <td class="char-sets-cell">${charSetsDisplay}</td>
            <td class="difficulty-cell">${difficultyLabel}</td>
            <td class="duration-cell">${durationLabel}</td>
            <td class="wpm-cell">${stat.finalWPM}</td>
            <td class="mistakes-cell">${stat.mistakes}</td>
        `;

    // Add row attributes for accessibility
    row.setAttribute("data-config-hash", stat.configHash);
    row.setAttribute("data-wpm", stat.finalWPM);
    row.setAttribute("data-index", index);

    // Add hover effect
    row.addEventListener("mouseenter", () => {
      row.style.backgroundColor = "rgba(212, 175, 55, 0.1)";
    });

    row.addEventListener("mouseleave", () => {
      row.style.backgroundColor = "";
    });

    return row;
  }

  parseConfigHash(configHash) {
    const [characterSets, difficulty, duration] = configHash.split("-");

    return {
      characterSets: characterSets ? characterSets.split(",") : [],
      difficulty,
      duration,
    };
  }

  formatCharacterSets(charSets) {
    if (!charSets || charSets.length === 0) {
      return "None";
    }

    const labels = {
      lowercase: "a-z",
      uppercase: "A-Z",
      numbers: "0-9",
      symbols: "Symbols",
    };

    return charSets.map((set) => labels[set] || set).join(", ");
  }

  sortStatistics(stats) {
    return [...stats].sort((a, b) => {
      let aValue, bValue;

      switch (this.sortColumn) {
        case "finalWPM":
          aValue = a.finalWPM;
          bValue = b.finalWPM;
          break;
        case "mistakes":
          aValue = a.mistakes;
          bValue = b.mistakes;
          break;
        case "charactersTyped":
          aValue = a.charactersTyped;
          bValue = b.charactersTyped;
          break;
        case "configHash":
          aValue = a.configHash;
          bValue = b.configHash;
          break;
        default:
          aValue = a.finalWPM;
          bValue = b.finalWPM;
      }

      if (this.sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  sortTable(columnIndex) {
    const columns = [
      "characterSets",
      "difficulty",
      "duration",
      "finalWPM",
      "mistakes",
    ];
    const newSortColumn = columns[columnIndex];

    if (this.sortColumn === newSortColumn) {
      // Toggle sort direction
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      // New column, default to descending for WPM, ascending for others
      this.sortColumn = newSortColumn;
      this.sortDirection = newSortColumn === "finalWPM" ? "desc" : "asc";
    }

    // Update sort indicators in header
    this.updateSortIndicators(columnIndex);

    // Re-display statistics with new sort
    this.displayStatistics();
  }

  updateSortIndicators(activeColumnIndex) {
    const headers = document.querySelectorAll(".stats-table th");

    headers.forEach((header, index) => {
      // Remove existing sort indicators
      header.classList.remove("sort-asc", "sort-desc");

      // Add indicator to active column
      if (index === activeColumnIndex) {
        header.classList.add(
          this.sortDirection === "asc" ? "sort-asc" : "sort-desc"
        );
      }
    });
  }

  updateTableAccessibility() {
    const table = document.querySelector(".stats-table");
    if (table) {
      table.setAttribute("aria-label", "Session statistics table");
      table.setAttribute("role", "table");
    }

    const rows = document.querySelectorAll(".stats-table tbody tr");
    rows.forEach((row, index) => {
      row.setAttribute("role", "row");
      row.setAttribute("aria-rowindex", index + 2); // +2 because header is row 1
    });
  }

  refreshStatistics() {
    this.displayStatistics();

    // Provide feedback
    this.announceUpdate("Statistics refreshed");
  }

  returnToMenu() {
    gameState.setState("MENU");
  }

  // Export functionality (for future enhancement)
  exportStatistics() {
    const stats = Array.from(gameState.sessionStats.values());

    if (stats.length === 0) {
      this.announceUpdate("No statistics to export");
      return;
    }

    // Create CSV content
    const headers = [
      "Character Sets",
      "Difficulty",
      "Duration",
      "WPM",
      "Mistakes",
      "Characters Typed",
      "Date",
    ];
    const csvContent = [
      headers.join(","),
      ...stats.map((stat) => {
        const configData = this.parseConfigHash(stat.configHash);
        const charSets = this.formatCharacterSets(configData.characterSets);
        const difficulty =
          CONFIG.DIFFICULTY_SETTINGS[configData.difficulty]?.label ||
          configData.difficulty;
        const duration =
          CONFIG.DURATION_SETTINGS[configData.duration]?.label ||
          configData.duration;

        return [
          `"${charSets}"`,
          `"${difficulty}"`,
          `"${duration}"`,
          stat.finalWPM,
          stat.mistakes,
          stat.charactersTyped,
          stat.timestamp ? new Date(stat.timestamp).toLocaleString() : "",
        ].join(",");
      }),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `typing-game-stats-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.announceUpdate("Statistics exported successfully");
  }

  // Statistics analysis methods
  getSessionSummary() {
    const stats = Array.from(gameState.sessionStats.values());

    if (stats.length === 0) {
      return null;
    }

    const wpmValues = stats.map((s) => s.finalWPM);
    const mistakeValues = stats.map((s) => s.mistakes);

    return {
      gamesPlayed: stats.length,
      averageWPM: Math.round(
        wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length
      ),
      bestWPM: Math.max(...wpmValues),
      worstWPM: Math.min(...wpmValues),
      totalMistakes: mistakeValues.reduce((a, b) => a + b, 0),
      averageMistakes: Math.round(
        mistakeValues.reduce((a, b) => a + b, 0) / mistakeValues.length
      ),
      perfectGames: stats.filter((s) => s.mistakes === 0).length,
    };
  }

  displaySessionSummary() {
    const summary = this.getSessionSummary();

    if (!summary) {
      return;
    }

    // Create summary display (could be added to the statistics screen)
    console.log("Session Summary:", summary);
  }

  // Accessibility helper
  announceUpdate(message) {
    let announcer = document.getElementById("stats-announcer");
    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "stats-announcer";
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

// Initialize statistics when DOM is loaded
let statistics;

document.addEventListener("DOMContentLoaded", () => {
  statistics = new Statistics();

  // Override gameState's refreshStatisticsDisplay to use our method
  const originalRefresh = gameState.refreshStatisticsDisplay;
  gameState.refreshStatisticsDisplay = function () {
    if (statistics && statistics.isInitialized) {
      statistics.displayStatistics();
    } else {
      originalRefresh.call(this);
    }
  };
});
