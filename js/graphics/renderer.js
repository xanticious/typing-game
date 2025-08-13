// Canvas rendering system

class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas with id '${canvasId}' not found`);
    }

    this.ctx = this.setupHighDPICanvas();
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Cache frequently used values
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.isInitialized = true;
  }

  setupHighDPICanvas() {
    const ctx = this.canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;

    // Get the size from CSS
    const rect = this.canvas.getBoundingClientRect();

    // Set actual size in memory (scaled for DPI)
    this.canvas.width = rect.width * ratio;
    this.canvas.height = rect.height * ratio;

    // Scale CSS size back down
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";

    // Scale the drawing context
    ctx.scale(ratio, ratio);

    // Store the display size for calculations
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;

    return ctx;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);

    // Draw background gradient
    this.drawBackground();
  }

  drawBackground() {
    // Create radial gradient from center
    const gradient = this.ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      0,
      this.centerX,
      this.centerY,
      Math.max(this.displayWidth, this.displayHeight) / 2
    );

    gradient.addColorStop(0, "#4a2c7a");
    gradient.addColorStop(0.6, "#2d1b4e");
    gradient.addColorStop(1, "#1a0033");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
  }

  drawSpiral(
    centerX,
    centerY,
    startRadius,
    endRadius,
    totalAngle,
    segments = 200
  ) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
    this.ctx.lineWidth = 2;

    let firstPoint = true;

    for (let i = 0; i <= segments; i++) {
      const progress = i / segments;
      const angle = progress * totalAngle;
      const radius = MathUtils.lerp(startRadius, endRadius, progress);

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (firstPoint) {
        this.ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  drawWizard(x, y, animationFrame = 0) {
    const size = 40;

    // Wizard glow effect
    this.ctx.save();
    this.ctx.shadowColor = "#d4af37";
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Wizard body (simple representation for now)
    this.ctx.fillStyle = "#4a2c7a";
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Wizard outline
    this.ctx.strokeStyle = "#d4af37";
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Wizard face/eyes
    this.ctx.fillStyle = "#d4af37";
    this.ctx.beginPath();
    this.ctx.arc(x - 8, y - 5, 3, 0, Math.PI * 2);
    this.ctx.arc(x + 8, y - 5, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Wand animation
    const wandLength = 25;
    const wandAngle = Math.sin(animationFrame * 0.1) * 0.3;
    const wandX = x + Math.cos(wandAngle) * wandLength;
    const wandY = y + Math.sin(wandAngle) * wandLength;

    this.ctx.strokeStyle = "#8b4513";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(wandX, wandY);
    this.ctx.stroke();

    // Wand tip sparkle
    this.ctx.fillStyle = "#ffff00";
    this.ctx.beginPath();
    this.ctx.arc(wandX, wandY, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawSnakeHead(x, y, angle, size = 30) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    // Head glow
    this.ctx.shadowColor = "#50c878";
    this.ctx.shadowBlur = 15;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Head shape (triangular)
    this.ctx.fillStyle = "#50c878";
    this.ctx.beginPath();
    this.ctx.moveTo(size, 0);
    this.ctx.lineTo(-size / 2, -size / 3);
    this.ctx.lineTo(-size / 2, size / 3);
    this.ctx.closePath();
    this.ctx.fill();

    // Head outline
    this.ctx.strokeStyle = "#2d5a3d";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Eyes
    this.ctx.fillStyle = "#ff0000";
    this.ctx.beginPath();
    this.ctx.arc(size / 3, -size / 6, 3, 0, Math.PI * 2);
    this.ctx.arc(size / 3, size / 6, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawSnakeSegment(x, y, letter, isActive = false, radius = 25) {
    this.ctx.save();

    // Segment glow
    if (isActive) {
      this.ctx.shadowColor = "#ffff00";
      this.ctx.shadowBlur = 20;
    } else {
      this.ctx.shadowColor = "#d4af37";
      this.ctx.shadowBlur = 10;
    }
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Segment background
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    if (isActive) {
      gradient.addColorStop(0, "#ffff00");
      gradient.addColorStop(1, "#f4d03f");
    } else {
      gradient.addColorStop(0, "#4a2c7a");
      gradient.addColorStop(1, "#2d1b4e");
    }

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Segment border
    this.ctx.strokeStyle = isActive ? "#ffff00" : "#d4af37";
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Letter
    this.ctx.fillStyle = isActive ? "#1a0033" : "#ffffff";
    this.ctx.font = "bold 20px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(letter, x, y);

    this.ctx.restore();
  }

  drawSnakeTail(segments, tailLength = 3) {
    if (segments.length < 2) return;

    this.ctx.save();
    this.ctx.strokeStyle = "rgba(80, 200, 120, 0.6)";
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = "round";

    // Draw tail segments getting smaller
    for (let i = 0; i < Math.min(tailLength, segments.length - 1); i++) {
      const segmentIndex = segments.length - 1 - i;
      const segment = segments[segmentIndex];
      const nextSegment = segments[segmentIndex - 1];

      if (!segment || !nextSegment) continue;

      const alpha = 1 - i / tailLength;
      const width = 8 * alpha;

      this.ctx.globalAlpha = alpha;
      this.ctx.lineWidth = width;
      this.ctx.beginPath();
      this.ctx.moveTo(segment.x, segment.y);
      this.ctx.lineTo(nextSegment.x, nextSegment.y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawParticleEffect(x, y, type = "spell") {
    this.ctx.save();

    const time = Date.now() * 0.01;
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time;
      const distance = 20 + Math.sin(time + i) * 10;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;

      this.ctx.fillStyle = type === "spell" ? "#d4af37" : "#50c878";
      this.ctx.globalAlpha = 0.7;
      this.ctx.beginPath();
      this.ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawTextWithOutline(
    text,
    x,
    y,
    fillColor = "#ffffff",
    outlineColor = "#000000",
    fontSize = 16
  ) {
    this.ctx.save();

    this.ctx.font = `bold ${fontSize}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Outline
    this.ctx.strokeStyle = outlineColor;
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(text, x, y);

    // Fill
    this.ctx.fillStyle = fillColor;
    this.ctx.fillText(text, x, y);

    this.ctx.restore();
  }

  // Utility methods
  resize() {
    this.ctx = this.setupHighDPICanvas();
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.displayWidth / 2;
    this.centerY = this.displayHeight / 2;
  }

  // Effect methods
  fadeIn(duration = 1000) {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      this.canvas.style.opacity = progress.toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    this.canvas.style.opacity = "0";
    requestAnimationFrame(animate);
  }

  flash(color = "#ffffff", duration = 200) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    this.ctx.restore();

    setTimeout(() => {
      // Flash effect will be cleared on next render
    }, duration);
  }

  shake(intensity = 5, duration = 300) {
    const startTime = Date.now();
    const originalTransform = this.canvas.style.transform;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        const shakeX = (Math.random() - 0.5) * intensity * (1 - progress);
        const shakeY = (Math.random() - 0.5) * intensity * (1 - progress);

        this.canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        requestAnimationFrame(animate);
      } else {
        this.canvas.style.transform = originalTransform;
      }
    };

    requestAnimationFrame(animate);
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Renderer;
}
