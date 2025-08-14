// Snake Entity System - Basilisk with segments following zigzag path

class Snake {
  constructor(path, letters) {
    this.path = path;
    this.letters = letters.slice(); // Copy the letters array
    this.bodySegments = this.letters.map(
      (letter, index) => new BodySegment(letter, index)
    );
    this.head = new SnakeHead();
    this.tail = new SnakeTail();

    this.position = 0; // Progress along path (0 to 1)
    this.speed = 0; // Units per second (will be set based on difficulty)
    this.segmentSpacing = 35; // Distance between segment centers
    this.isDestroyed = false;
    this.activeSegmentIndex = 0; // Index of the segment to type next

    this.initializePositions();
  }

  initializePositions() {
    // Position all segments along the path with proper spacing
    this.updateSegmentPositions();
  }

  setSpeed(pixelsPerSecond) {
    // Convert pixels per second to path progress per second
    this.speed = pixelsPerSecond / this.path.totalLength;
  }

  update(deltaTime) {
    if (this.isDestroyed) return;

    // Move along the path
    this.position += this.speed * deltaTime;

    // Check if snake reached the wizard
    if (this.position >= 1.0) {
      this.position = 1.0;
      // Game over - snake reached wizard
      return { reachedWizard: true };
    }

    this.updateSegmentPositions();
    return { reachedWizard: false };
  }

  updateSegmentPositions() {
    // Calculate position for head
    const headPosition = this.path.getPosition(this.position);
    this.head.setPosition(headPosition.x, headPosition.y, headPosition.angle);

    // Calculate positions for body segments
    // Each segment is positioned behind the previous one
    let currentProgress = this.position;

    for (let i = 0; i < this.bodySegments.length; i++) {
      // Calculate how far back this segment should be
      const segmentDistance = (i + 1) * this.segmentSpacing;
      const segmentProgress = Math.max(
        0,
        currentProgress - segmentDistance / this.path.totalLength
      );

      const segmentPosition = this.path.getPosition(segmentProgress);
      this.bodySegments[i].setPosition(
        segmentPosition.x,
        segmentPosition.y,
        segmentPosition.angle
      );
    }

    // Position tail behind last body segment
    if (this.bodySegments.length > 0) {
      const tailDistance = (this.bodySegments.length + 1) * this.segmentSpacing;
      const tailProgress = Math.max(
        0,
        this.position - tailDistance / this.path.totalLength
      );
      const tailPosition = this.path.getPosition(tailProgress);
      this.tail.setPosition(tailPosition.x, tailPosition.y, tailPosition.angle);
    } else {
      // No body segments left, position tail behind head
      const tailDistance = this.segmentSpacing;
      const tailProgress = Math.max(
        0,
        this.position - tailDistance / this.path.totalLength
      );
      const tailPosition = this.path.getPosition(tailProgress);
      this.tail.setPosition(tailPosition.x, tailPosition.y, tailPosition.angle);
    }
  }

  removeActiveSegment() {
    if (this.bodySegments.length === 0) return false;

    // Remove the active segment (front-most)
    this.bodySegments.shift();
    this.letters.shift();

    // Update positions after removal
    this.updateSegmentPositions();

    // Check if snake is completely destroyed
    if (this.bodySegments.length === 0) {
      this.isDestroyed = true;
      return true; // Victory condition
    }

    return false;
  }

  getActiveSegment() {
    // Return the front-most body segment (the one to type)
    return this.bodySegments.length > 0 ? this.bodySegments[0] : null;
  }

  getActiveLetter() {
    // Return the letter on the active segment
    return this.letters.length > 0 ? this.letters[0] : null;
  }

  render(ctx) {
    // Render tail first (behind everything)
    this.tail.render(ctx);

    // Render body segments (back to front)
    for (let i = this.bodySegments.length - 1; i >= 0; i--) {
      const segment = this.bodySegments[i];
      const isActive = i === 0; // First segment is active
      segment.render(ctx, isActive);
    }

    // Render head last (in front of everything)
    this.head.render(ctx);
  }

  getRemainingLetters() {
    return this.bodySegments.length;
  }
}

class SnakeHead {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.radius = 20;
    this.animationFrame = 0;
  }

  setPosition(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  update(deltaTime) {
    this.animationFrame += deltaTime * 5; // Animation speed
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw basilisk head
    ctx.fillStyle = "#2F8B2F"; // Dark green
    ctx.strokeStyle = "#1F5F1F"; // Darker green border
    ctx.lineWidth = 3;

    // Head shape (elongated circle)
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius + 5, this.radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    const eyeOffset = this.radius * 0.4;
    ctx.fillStyle = "#FF0000"; // Red eyes
    ctx.beginPath();
    ctx.arc(-eyeOffset, -5, 4, 0, Math.PI * 2);
    ctx.arc(-eyeOffset, 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eye glow effect
    ctx.fillStyle = "#FFFF00"; // Yellow glow
    ctx.beginPath();
    ctx.arc(-eyeOffset, -5, 2, 0, Math.PI * 2);
    ctx.arc(-eyeOffset, 5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class BodySegment {
  constructor(letter, index) {
    this.letter = letter;
    this.index = index;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.radius = 18;
  }

  setPosition(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  render(ctx, isActive = false) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Draw segment circle
    const fillColor = isActive ? "#FFFF00" : "#4169E1"; // Yellow if active, blue otherwise
    const strokeColor = isActive ? "#FFD700" : "#000080"; // Gold if active, dark blue otherwise

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw letter (always upright)
    ctx.fillStyle = isActive ? "#000000" : "#FFFFFF"; // Black text on yellow, white on blue
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.letter, 0, 0);

    // Add glow effect for active segment
    if (isActive) {
      ctx.shadowColor = "#FFFF00";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }
}

class SnakeTail {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.segments = 3; // Number of tail segments for visual appeal
    this.segmentLength = 15;
  }

  setPosition(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw decorative tail segments
    for (let i = 0; i < this.segments; i++) {
      const segmentX = i * this.segmentLength;
      const segmentRadius = 15 - i * 3; // Decreasing size
      const alpha = 1.0 - i * 0.2; // Fading effect

      ctx.fillStyle = `rgba(46, 139, 46, ${alpha})`; // Green with transparency
      ctx.strokeStyle = `rgba(31, 95, 31, ${alpha})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(segmentX, 0, segmentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
