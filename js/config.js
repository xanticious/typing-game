// Configuration and Constants

const CONFIG = {
  // Character Sets
  CHARACTER_SETS: {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "~!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/",
  },

  // Difficulty Settings
  DIFFICULTY_SETTINGS: {
    slowest: { multiplier: 0.5, targetWPM: 10, label: "Slowest (~10 WPM)" },
    slower: { multiplier: 0.75, targetWPM: 20, label: "Slower (~20 WPM)" },
    slow: { multiplier: 1.0, targetWPM: 30, label: "Slow (~30 WPM)" },
    medium: { multiplier: 1.25, targetWPM: 40, label: "Medium (~40 WPM)" },
    fast: { multiplier: 1.5, targetWPM: 50, label: "Fast (~50 WPM)" },
    faster: { multiplier: 1.75, targetWPM: 60, label: "Faster (~60 WPM)" },
    fastest: { multiplier: 2.0, targetWPM: 70, label: "Fastest (~70 WPM)" },
  },

  // Duration Settings
  DURATION_SETTINGS: {
    shortest: { seconds: 10, label: "Shortest (10 seconds)" },
    shorter: { seconds: 20, label: "Shorter (20 seconds)" },
    short: { seconds: 30, label: "Short (30 seconds)" },
    medium: { seconds: 40, label: "Medium (40 seconds)" },
    long: { seconds: 50, label: "Long (50 seconds)" },
    longer: { seconds: 60, label: "Longer (60 seconds)" },
    extraLong: { seconds: 120, label: "Extra Long (120 seconds)" },
  },

  // Game Settings
  GAME: {
    // Canvas dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // Spiral settings
    SPIRAL_CENTER_X: 400,
    SPIRAL_CENTER_Y: 300,
    SPIRAL_START_RADIUS: 280,
    SPIRAL_END_RADIUS: 50,
    SPIRAL_TURNS: 4,

    // Snake settings
    SEGMENT_RADIUS: 25,
    SEGMENT_SPACING: 55,
    HEAD_SIZE: 30,

    // Timing
    PENALTY_DURATION: 500, // 0.5 seconds in milliseconds
    FEEDBACK_DURATION: 800, // Visual feedback display time

    // Scoring
    MISTAKE_PENALTY: 2, // WPM penalty per mistake
    CHARS_PER_WORD: 5, // Standard typing calculation

    // Colors
    COLORS: {
      BACKGROUND: "#4a2c7a",
      SNAKE_HEAD: "#50c878",
      SNAKE_BODY: "#2d1b4e",
      SNAKE_BODY_BORDER: "#d4af37",
      ACTIVE_SEGMENT: "#ffff00",
      WIZARD: "#d4af37",
      TEXT: "#ffffff",
      ERROR: "#ff0000",
      SUCCESS: "#00ff00",
    },
  },

  // Default Configuration
  DEFAULT_CONFIG: {
    characterSets: {
      lowercase: true,
      uppercase: false,
      numbers: false,
      symbols: false,
    },
    difficulty: "medium",
    duration: "medium",
  },
};

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
