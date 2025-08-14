// Scoring System - WPM calculation and mistake tracking

class ScoreCalculator {
  constructor() {
    this.startTime = null;
    this.charactersTyped = 0;
    this.mistakes = 0;
    this.isTracking = false;

    // For real-time WPM calculation
    this.lastUpdateTime = null;
    this.currentWPM = 0;
    this.updateInterval = 1000; // Update WPM every second
  }

  startTracking() {
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.isTracking = true;
    this.charactersTyped = 0;
    this.mistakes = 0;
    this.currentWPM = 0;

    console.log("Score tracking started");
  }

  stopTracking() {
    this.isTracking = false;
    console.log("Score tracking stopped");
  }

  recordCorrectInput() {
    if (!this.isTracking) return;

    this.charactersTyped++;
    console.log(`Characters typed: ${this.charactersTyped}`);
  }

  recordMistake() {
    if (!this.isTracking) return;

    this.mistakes++;
    console.log(`Mistakes: ${this.mistakes}`);
  }

  update() {
    if (!this.isTracking) return;

    const now = Date.now();

    // Update current WPM periodically
    if (now - this.lastUpdateTime >= this.updateInterval) {
      this.currentWPM = this.calculateCurrentWPM();
      this.lastUpdateTime = now;
    }
  }

  calculateCurrentWPM() {
    if (!this.startTime) return 0;

    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return 0;

    // Standard WPM calculation: (characters typed / 5) / minutes elapsed
    const wordsTyped = this.charactersTyped / 5;
    const rawWPM = wordsTyped / elapsedMinutes;

    return Math.round(Math.max(0, rawWPM));
  }

  calculateFinalWPM() {
    if (!this.startTime) return 0;

    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return 0;

    const wordsTyped = this.charactersTyped / 5;
    const rawWPM = wordsTyped / elapsedMinutes;

    return Math.round(Math.max(0, rawWPM));
  }

  calculateFinalScore() {
    const baseWPM = this.calculateFinalWPM();
    const mistakePenalty = this.mistakes * 2; // 2 WPM penalty per mistake
    const finalScore = Math.max(0, baseWPM - mistakePenalty);

    return Math.round(finalScore);
  }

  calculateAccuracy() {
    const totalKeystrokes = this.charactersTyped + this.mistakes;
    if (totalKeystrokes === 0) return 100;

    const accuracy = (this.charactersTyped / totalKeystrokes) * 100;
    return Math.round(accuracy * 10) / 10; // Round to 1 decimal place
  }

  getCurrentWPM() {
    return this.currentWPM;
  }

  getFinalResults() {
    const finalWPM = this.calculateFinalWPM();
    const finalScore = this.calculateFinalScore();
    const accuracy = this.calculateAccuracy();
    const elapsedTime = this.startTime
      ? (Date.now() - this.startTime) / 1000
      : 0;

    return {
      finalWPM,
      finalScore,
      accuracy,
      charactersTyped: this.charactersTyped,
      mistakes: this.mistakes,
      elapsedTime: Math.round(elapsedTime * 10) / 10, // Round to 1 decimal
      mistakePenalty: this.mistakes * 2,
    };
  }

  // Create a configuration hash for session statistics tracking
  createConfigHash(gameConfig) {
    const sets = [];
    if (gameConfig.characterSets.lowercase) sets.push("lower");
    if (gameConfig.characterSets.uppercase) sets.push("upper");
    if (gameConfig.characterSets.numbers) sets.push("num");
    if (gameConfig.characterSets.symbols) sets.push("sym");

    return `${sets.join("-")}_${gameConfig.difficulty}_${gameConfig.duration}`;
  }

  // Format results for display
  formatResults() {
    const results = this.getFinalResults();

    return {
      wpm: `${results.finalWPM} WPM`,
      score: `${results.finalScore} WPM (after penalties)`,
      accuracy: `${results.accuracy}%`,
      characters: `${results.charactersTyped} characters`,
      mistakes: `${results.mistakes} mistakes`,
      time: `${results.elapsedTime} seconds`,
      penalty:
        results.mistakes > 0
          ? `${results.mistakePenalty} WPM penalty`
          : "No penalties",
    };
  }

  // Get performance level description
  getPerformanceLevel(wpm) {
    if (wpm >= 70) return "Exceptional";
    if (wpm >= 60) return "Advanced";
    if (wpm >= 50) return "Proficient";
    if (wpm >= 40) return "Good";
    if (wpm >= 30) return "Average";
    if (wpm >= 20) return "Below Average";
    return "Beginner";
  }

  // Reset for new game
  reset() {
    this.startTime = null;
    this.lastUpdateTime = null;
    this.charactersTyped = 0;
    this.mistakes = 0;
    this.currentWPM = 0;
    this.isTracking = false;
  }
}
