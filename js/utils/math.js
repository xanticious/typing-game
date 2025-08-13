// Mathematical utility functions

const MathUtils = {
  // Basic math constants
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI / 2,
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,

  // Angle conversions
  degreesToRadians(degrees) {
    return degrees * this.DEG_TO_RAD;
  },

  radiansToDegrees(radians) {
    return radians * this.RAD_TO_DEG;
  },

  // Vector math
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  // Interpolation functions
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  },

  // Easing functions
  easeInQuad(t) {
    return t * t;
  },

  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  },

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },

  easeInCubic(t) {
    return t * t * t;
  },

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // Spiral calculations
  spiralPosition(
    centerX,
    centerY,
    startRadius,
    endRadius,
    totalAngle,
    progress
  ) {
    const angle = progress * totalAngle;
    const radius = this.lerp(startRadius, endRadius, progress);

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle: angle,
      radius: radius,
    };
  },

  // Calculate spiral length for uniform spacing
  calculateSpiralLength(startRadius, endRadius, totalAngle, segments = 1000) {
    let totalLength = 0;
    let prevX = startRadius;
    let prevY = 0;

    for (let i = 1; i <= segments; i++) {
      const progress = i / segments;
      const angle = progress * totalAngle;
      const radius = this.lerp(startRadius, endRadius, progress);

      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      totalLength += this.distance(prevX, prevY, x, y);
      prevX = x;
      prevY = y;
    }

    return totalLength;
  },

  // Game-specific calculations
  calculateSnakeSpeed(durationSeconds, spiralLength, difficultyMultiplier) {
    // Base speed to complete spiral in given duration
    const baseSpeed = spiralLength / durationSeconds;
    return baseSpeed * difficultyMultiplier;
  },

  calculateSnakeLength(
    durationSeconds,
    charactersPerSecond,
    difficultyMultiplier
  ) {
    const baseLength = durationSeconds * charactersPerSecond;
    return Math.max(5, Math.floor(baseLength * difficultyMultiplier));
  },

  // Segment positioning along spiral
  calculateSegmentPositions(snakeLength, segmentSpacing, spiralPath) {
    const positions = [];
    const totalSpiralLength = spiralPath.length;

    for (let i = 0; i < snakeLength; i++) {
      const distanceFromHead = i * segmentSpacing;
      const progress = Math.max(
        0,
        Math.min(1, distanceFromHead / totalSpiralLength)
      );
      positions.push(progress);
    }

    return positions;
  },

  // WPM calculations
  calculateWPM(charactersTyped, elapsedMinutes) {
    if (elapsedMinutes <= 0) return 0;
    return Math.round(
      charactersTyped / CONFIG.GAME.CHARS_PER_WORD / elapsedMinutes
    );
  },

  calculateAccuracy(correctCharacters, totalAttempts) {
    if (totalAttempts === 0) return 100;
    return Math.round((correctCharacters / totalAttempts) * 100);
  },

  // Collision detection
  pointInCircle(pointX, pointY, circleX, circleY, radius) {
    const distanceSquared = (pointX - circleX) ** 2 + (pointY - circleY) ** 2;
    return distanceSquared <= radius ** 2;
  },

  circleIntersection(x1, y1, r1, x2, y2, r2) {
    const distance = this.distance(x1, y1, x2, y2);
    return distance <= r1 + r2;
  },

  // Random number generation with better distribution
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Gaussian/normal distribution random
  randomGaussian(mean = 0, standardDeviation = 1) {
    // Box-Muller transform
    if (this._hasSpare) {
      this._hasSpare = false;
      return this._spare * standardDeviation + mean;
    }

    this._hasSpare = true;
    const u = Math.random();
    const v = Math.random();
    const mag = standardDeviation * Math.sqrt(-2 * Math.log(u));
    this._spare = mag * Math.cos(2 * Math.PI * v);
    return mag * Math.sin(2 * Math.PI * v) + mean;
  },

  // Clamping and wrapping
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  wrap(value, min, max) {
    const range = max - min;
    if (range <= 0) return min;
    return ((((value - min) % range) + range) % range) + min;
  },

  // Normalize angle to 0-2π range
  normalizeAngle(angle) {
    return this.wrap(angle, 0, this.TWO_PI);
  },

  // Get shortest angular distance between two angles
  angleDifference(angle1, angle2) {
    const diff = this.normalizeAngle(angle2 - angle1);
    return diff > Math.PI ? diff - this.TWO_PI : diff;
  },

  // Smooth angle interpolation
  lerpAngle(start, end, factor) {
    const diff = this.angleDifference(start, end);
    return this.normalizeAngle(start + diff * factor);
  },

  // Animation timing functions
  pingPong(t) {
    t = t % 2;
    return t > 1 ? 2 - t : t;
  },

  // Game balance calculations
  calculateDifficultyScale(baseValue, difficulty) {
    const multiplier = CONFIG.DIFFICULTY_SETTINGS[difficulty]?.multiplier || 1;
    return baseValue * multiplier;
  },

  // Performance optimization helpers
  fastFloor(value) {
    return value | 0;
  },

  fastCeil(value) {
    return (value | 0) === value ? value : (value | 0) + 1;
  },

  fastAbs(value) {
    return value < 0 ? -value : value;
  },
};

// Initialize spare variable for Gaussian random
MathUtils._hasSpare = false;
MathUtils._spare = 0;

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = MathUtils;
}
