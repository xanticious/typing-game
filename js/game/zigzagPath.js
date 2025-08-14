// Zigzag Path System - Zuma-style switchback pathways

class ZigzagPath {
  constructor(canvasWidth, canvasHeight, levels = 6) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.levels = levels;
    this.wizardPosition = { x: canvasWidth / 2, y: canvasHeight * 0.9 };
    this.pathSegments = [];
    this.totalLength = 0;
    this.cornerRadius = 20; // Smooth corner transitions

    this.generatePath();
  }

  generatePath() {
    // Create switchback segments forming triangular constraint
    // Start at top, zigzag down to wizard at bottom center
    const startY = 50;
    const endY = this.wizardPosition.y - 100; // Leave space above wizard
    const availableHeight = endY - startY;
    const segmentHeight = availableHeight / this.levels;

    for (let level = 0; level < this.levels; level++) {
      const y = startY + level * segmentHeight;
      const nextY = level < this.levels - 1 ? y + segmentHeight : endY;

      // Calculate triangle width at this level (wider at top, narrower at bottom)
      const topWidth = this.width * 0.8; // 80% of canvas width at top
      const bottomWidth = 100; // Narrow at bottom near wizard
      const widthProgress = level / (this.levels - 1);
      const triangleWidth = topWidth - (topWidth - bottomWidth) * widthProgress;

      const isRightToLeft = level % 2 === 1;
      const segment = this.createPathSegment(
        y,
        nextY,
        triangleWidth,
        isRightToLeft,
        level
      );
      this.pathSegments.push(segment);
    }

    // Add final segment to wizard
    this.addFinalSegmentToWizard();
    this.calculateTotalLength();
  }

  createPathSegment(startY, endY, width, isRightToLeft, level) {
    const centerX = this.width / 2;
    const halfWidth = width / 2;

    let startX, endX;

    if (level === 0) {
      // First segment starts from top center
      startX = centerX;
      endX = isRightToLeft ? centerX - halfWidth : centerX + halfWidth;
    } else {
      // Continue from previous segment's end
      const prevSegment = this.pathSegments[level - 1];
      startX = prevSegment.endX;
      endX = isRightToLeft ? centerX - halfWidth : centerX + halfWidth;
    }

    return {
      startX,
      startY,
      endX,
      endY,
      direction: isRightToLeft ? "rtl" : "ltr",
      level,
      length: 0, // Will be calculated
    };
  }

  addFinalSegmentToWizard() {
    if (this.pathSegments.length > 0) {
      const lastSegment = this.pathSegments[this.pathSegments.length - 1];

      // Add curved path to wizard position
      this.pathSegments.push({
        startX: lastSegment.endX,
        startY: lastSegment.endY,
        endX: this.wizardPosition.x,
        endY: this.wizardPosition.y,
        direction: "to_wizard",
        level: this.levels,
        length: 0,
        isToWizard: true,
      });
    }
  }

  calculateTotalLength() {
    this.totalLength = 0;

    for (let segment of this.pathSegments) {
      // Calculate length including corner curves
      if (segment.isToWizard) {
        // Curved path to wizard
        segment.length = Math.sqrt(
          Math.pow(segment.endX - segment.startX, 2) +
            Math.pow(segment.endY - segment.startY, 2)
        );
      } else {
        // Horizontal segment + vertical transition
        const horizontalLength = Math.abs(segment.endX - segment.startX);
        const verticalLength = Math.abs(segment.endY - segment.startY);
        segment.length = horizontalLength + verticalLength;
      }

      this.totalLength += segment.length;
    }
  }

  getPosition(progress) {
    // Convert progress (0-1) to position along zigzag path
    if (progress <= 0) {
      const firstSegment = this.pathSegments[0];
      return {
        x: firstSegment.startX,
        y: firstSegment.startY,
        angle: 0,
        segment: 0,
      };
    }

    if (progress >= 1) {
      return {
        x: this.wizardPosition.x,
        y: this.wizardPosition.y,
        angle: 0,
        segment: this.pathSegments.length - 1,
      };
    }

    const targetDistance = progress * this.totalLength;
    let currentDistance = 0;

    for (let i = 0; i < this.pathSegments.length; i++) {
      const segment = this.pathSegments[i];
      const segmentEndDistance = currentDistance + segment.length;

      if (targetDistance <= segmentEndDistance) {
        // Position is within this segment
        const segmentProgress =
          (targetDistance - currentDistance) / segment.length;
        return this.getPositionInSegment(segment, segmentProgress, i);
      }

      currentDistance = segmentEndDistance;
    }

    // Fallback to wizard position
    return {
      x: this.wizardPosition.x,
      y: this.wizardPosition.y,
      angle: 0,
      segment: this.pathSegments.length - 1,
    };
  }

  getPositionInSegment(segment, progress, segmentIndex) {
    if (segment.isToWizard) {
      // Curved path to wizard - use quadratic bezier
      const controlX = (segment.startX + segment.endX) / 2;
      const controlY = segment.startY; // Control point keeps same Y as start

      const t = progress;
      const x =
        Math.pow(1 - t, 2) * segment.startX +
        2 * (1 - t) * t * controlX +
        Math.pow(t, 2) * segment.endX;
      const y =
        Math.pow(1 - t, 2) * segment.startY +
        2 * (1 - t) * t * controlY +
        Math.pow(t, 2) * segment.endY;

      return {
        x,
        y,
        angle: this.calculateAngle(segment, progress),
        segment: segmentIndex,
      };
    } else {
      // Linear interpolation for straight segments
      const x = segment.startX + (segment.endX - segment.startX) * progress;
      const y = segment.startY + (segment.endY - segment.startY) * progress;

      return {
        x,
        y,
        angle: this.calculateAngle(segment, progress),
        segment: segmentIndex,
      };
    }
  }

  calculateAngle(segment, progress) {
    // Calculate the movement direction for sprite rotation
    const dx = segment.endX - segment.startX;
    const dy = segment.endY - segment.startY;
    return Math.atan2(dy, dx);
  }

  // Utility method for rendering the path (for debugging/visual guide)
  renderPath(ctx) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < this.pathSegments.length; i++) {
      const segment = this.pathSegments[i];

      if (i === 0) {
        ctx.moveTo(segment.startX, segment.startY);
      }

      if (segment.isToWizard) {
        // Draw curve to wizard
        const controlX = (segment.startX + segment.endX) / 2;
        const controlY = segment.startY;
        ctx.quadraticCurveTo(controlX, controlY, segment.endX, segment.endY);
      } else {
        ctx.lineTo(segment.endX, segment.endY);
      }
    }

    ctx.stroke();

    // Draw wizard position
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(this.wizardPosition.x, this.wizardPosition.y, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Get the starting position for the snake
  getStartPosition() {
    return this.getPosition(0);
  }

  // Get the end position (wizard location)
  getEndPosition() {
    return {
      x: this.wizardPosition.x,
      y: this.wizardPosition.y,
      angle: 0,
      segment: this.pathSegments.length - 1,
    };
  }
}
