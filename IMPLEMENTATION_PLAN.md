# Snake Protector Typing Master - Implementation Plan

## 🏗️ Development Phases

### Phase 1: Core Foundation (Days 1-2) ✅ COMPLETE

**Goal**: Basic project structure and main menu

#### 1.1 Project Setup

- [x] Initialize project structure
- [x] Set up HTML5 Canvas with proper DPI scaling
- [x] Create basic CSS styling framework
- [x] Implement responsive canvas sizing

#### 1.2 Main Menu System

- [x] Create main menu UI components
- [x] Implement configuration state management
- [x] Add character set selection (checkboxes)
- [x] Add difficulty selection (radio buttons)
- [x] Add time duration selection (radio buttons)
- [x] Implement form validation
- [x] Create navigation between menu screens

#### 1.3 Game State Management

- [x] Design state machine (Menu → Game → Results)
- [x] Implement state transitions
- [x] Create configuration data structure
- [x] Set up event handling system

### Phase 2: Game Engine Core (Days 3-4) 🚧 IN PROGRESS ✅ 75% COMPLETE

**Goal**: Basic game mechanics and rendering with Zuma-style zigzag path

#### 2.1 Zigzag Path Mathematics

- [x] Implement configurable zigzag path system (Zuma-style)
- [x] Create triangular constraint boundary with wizard at bottom center
- [x] Calculate switchback segments with smooth corners
- [x] Create smooth movement interpolation along path segments
- [x] Calculate optimal snake speed based on settings
- [x] Determine snake length based on character sets and time

#### 2.2 Snake Entity System

- [x] Create Snake class with head, body segments, and tail
- [x] Implement segment rendering with letters
- [x] Add yellow highlighting for active segment
- [x] Create smooth head-to-body reattachment animation
- [x] Handle path direction changes at switchback points

#### 2.3 Input System

- [x] Capture keyboard input
- [x] Implement correct/incorrect letter detection
- [x] Add typing lockout mechanism (0.5s penalty)
- [x] Create visual feedback for input results

**Remaining for Phase 2:**

- [ ] Test and debug zigzag path rendering
- [ ] Fine-tune snake movement speed and spacing
- [ ] Verify input handling integration
- [ ] Add game over conditions (victory/defeat)
- [ ] Test all difficulty levels and character sets

### Phase 3: Visual Assets & Animation (Days 5-6)

**Goal**: Fantasy theme implementation and smooth animations

#### 3.1 Graphics System

- [ ] Create high-resolution sprite rendering
- [ ] Implement wizard character with wand animation
- [ ] Design basilisk head with multiple rotation frames
- [ ] Create circular body segments with letter rendering
- [ ] Add decorative tail graphics

#### 3.2 Visual Effects

- [ ] Implement particle effects for magical ambiance
- [ ] Create translucent overlay for penalty periods
- [ ] Add smooth segment destruction animations
- [ ] Design spiral pathway background
- [ ] Implement color theme system

#### 3.3 UI Polish

- [ ] Style main menu with fantasy theme
- [ ] Create hover and focus states for interactive elements
- [ ] Add smooth transitions between game states
- [ ] Implement responsive text rendering

### Phase 4: Scoring & Results (Days 7-8)

**Goal**: Complete scoring system and results screens

#### 4.1 Score Calculation

- [ ] Implement WPM calculation algorithm
- [ ] Add mistake penalty system
- [ ] Track typing accuracy and speed
- [ ] Create session-based best score tracking

#### 4.2 Statistics System

- [ ] Build statistics data structure
- [ ] Implement "best score today" display
- [ ] Create statistics table view
- [ ] Add score comparison logic

#### 4.3 Results Screens

- [ ] Design victory screen with celebration
- [ ] Create defeat screen with encouragement
- [ ] Display comprehensive game statistics
- [ ] Implement "Try Again" and "Main Menu" navigation

### Phase 5: Polish & Testing (Days 9-10)

**Goal**: Bug fixes, optimization, and final polish

#### 5.1 Performance Optimization

- [ ] Optimize canvas rendering performance
- [ ] Implement efficient collision detection
- [ ] Add frame rate monitoring
- [ ] Optimize memory usage

#### 5.2 User Experience Enhancement

- [ ] Add keyboard navigation throughout
- [ ] Implement proper focus management
- [ ] Create smooth loading transitions
- [ ] Add error handling and user feedback

#### 5.3 Testing & Bug Fixes

- [ ] Test all character set combinations
- [ ] Verify scoring accuracy across difficulty levels
- [ ] Test edge cases (very short/long games)
- [ ] Cross-browser compatibility testing
- [ ] Mobile device testing (basic functionality)

## 📁 File Structure

```
typing-game/
├── index.html                 # Main HTML entry point
├── css/
│   ├── main.css              # Core styles and layout
│   ├── menu.css              # Main menu styling
│   ├── game.css              # Game arena styling
│   └── themes.css            # Fantasy theme colors and effects
├── js/
│   ├── main.js               # Application entry point
│   ├── gameState.js          # State management system
│   ├── config.js             # Configuration and constants
│   ├── menu/
│   │   ├── mainMenu.js       # Main menu controller
│   │   ├── statistics.js     # Statistics view
│   │   └── validation.js     # Form validation
│   ├── game/
│   │   ├── gameEngine.js     # Core game logic
│   │   ├── snake.js          # Snake entity and behavior
│   │   ├── spiral.js         # Spiral mathematics
│   │   ├── input.js          # Input handling
│   │   └── scoring.js        # Score calculation
│   ├── graphics/
│   │   ├── renderer.js       # Canvas rendering system
│   │   ├── sprites.js        # Sprite management
│   │   ├── animations.js     # Animation system
│   │   └── effects.js        # Particle effects
│   └── utils/
│       ├── math.js           # Mathematical utilities
│       ├── timer.js          # Timing utilities
│       └── helpers.js        # General helper functions
├── assets/
│   ├── images/
│   │   ├── wizard/           # Wizard character sprites
│   │   ├── snake/            # Basilisk graphics
│   │   ├── ui/               # User interface elements
│   │   └── effects/          # Particle and effect graphics
│   └── fonts/                # Custom fonts (if needed)
├── README.md                 # Project documentation
└── DESIGN_DOCUMENT.md        # This design document
```

## 🔧 Key Technical Implementation Details

### Canvas Setup with High-DPI Support

```javascript
function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;

  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.style.width = canvas.offsetWidth + "px";
  canvas.style.height = canvas.offsetHeight + "px";

  ctx.scale(ratio, ratio);
  return ctx;
}
```

### Zigzag Path System

```javascript
class ZigzagPath {
  constructor(canvasWidth, canvasHeight, levels = 6) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.levels = levels;
    this.wizardPosition = { x: canvasWidth / 2, y: canvasHeight * 0.9 };
    this.pathSegments = [];
    this.totalLength = 0;
    this.generatePath();
  }

  generatePath() {
    // Create switchback segments forming triangular constraint
    // Start at top, zigzag down to wizard at bottom center
    // Calculate smooth corner transitions
    const segmentHeight = (this.wizardPosition.y * 0.8) / this.levels;

    for (let level = 0; level < this.levels; level++) {
      const y = level * segmentHeight + 50; // Start offset from top
      const triangleWidth = this.calculateTriangleWidth(level);

      const isRightToLeft = level % 2 === 1;
      const segment = this.createPathSegment(y, triangleWidth, isRightToLeft);
      this.pathSegments.push(segment);
    }
  }

  getPosition(progress) {
    // Convert progress (0-1) to position along zigzag path
    // Handle transitions between segments smoothly
  }
}
```

### Snake Entity Structure

```javascript
class Snake {
  constructor(path, letters) {
    this.path = path;
    this.head = new SnakeHead();
    this.bodySegments = letters.map((letter) => new BodySegment(letter));
    this.tail = new SnakeTail();
    this.position = 0; // Progress along spiral (0 to 1)
    this.speed = 0; // Units per second
  }

  update(deltaTime) {
    this.position += this.speed * deltaTime;
    this.updateSegmentPositions();
  }

  removeFirstSegment() {
    if (this.bodySegments.length > 0) {
      this.bodySegments.shift();
      this.repositionHead();
    }
  }
}
```

### Input Handler with Lockout

```javascript
class InputHandler {
  constructor() {
    this.isLocked = false;
    this.lockoutDuration = 500; // 0.5 seconds
  }

  handleKeyPress(key, targetLetter) {
    if (this.isLocked) return;

    if (key === targetLetter) {
      this.onCorrectInput();
    } else {
      this.onIncorrectInput();
      this.lockInput();
    }
  }

  lockInput() {
    this.isLocked = true;
    setTimeout(() => {
      this.isLocked = false;
    }, this.lockoutDuration);
  }
}
```

### Scoring Algorithm Implementation

```javascript
class ScoreCalculator {
  constructor() {
    this.startTime = null;
    this.charactersTyped = 0;
    this.mistakes = 0;
  }

  calculateWPM() {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const wordsTyped = this.charactersTyped / 5;
    return Math.round(wordsTyped / elapsedMinutes);
  }

  calculateFinalScore() {
    const baseWPM = this.calculateWPM();
    const penalty = this.mistakes * 2;
    return Math.max(0, baseWPM - penalty);
  }
}
```

## 🎯 Configuration Management

### Settings Data Structure

```javascript
const gameConfig = {
  characterSets: {
    lowercase: false,
    uppercase: false,
    numbers: false,
    symbols: false,
  },
  difficulty: "medium", // slowest, slower, slow, medium, fast, faster, fastest
  duration: "medium", // shortest, shorter, short, medium, long, longer, extra-long

  // Calculated values
  speedMultiplier: 1.25,
  durationSeconds: 40,
  characterPool: [],
};
```

### Difficulty Mappings

```javascript
const DIFFICULTY_SETTINGS = {
  slowest: { multiplier: 0.5, targetWPM: 10 },
  slower: { multiplier: 0.75, targetWPM: 20 },
  slow: { multiplier: 1.0, targetWPM: 30 },
  medium: { multiplier: 1.25, targetWPM: 40 },
  fast: { multiplier: 1.5, targetWPM: 50 },
  faster: { multiplier: 1.75, targetWPM: 60 },
  fastest: { multiplier: 2.0, targetWPM: 70 },
};

const DURATION_SETTINGS = {
  shortest: 10,
  shorter: 20,
  short: 30,
  medium: 40,
  long: 50,
  longer: 60,
  "extra-long": 120,
};
```

## 🚀 Deployment Strategy

### GitHub Pages Setup

1. **Repository Structure**: Ensure all files are in the root or organized for static hosting
2. **Build Process**: No build step required (vanilla JavaScript)
3. **Domain**: Use GitHub Pages default domain or custom domain
4. **HTTPS**: GitHub Pages provides HTTPS by default

### Performance Considerations

- **Asset Optimization**: Compress images and minimize file sizes
- **Lazy Loading**: Load game assets only when needed
- **Caching**: Implement proper cache headers for static assets
- **CDN**: Consider using GitHub's global CDN for fast loading

## 🧪 Testing Strategy

### Manual Testing Checklist

- [ ] All character set combinations work correctly
- [ ] Difficulty levels produce appropriate game speeds
- [ ] Scoring calculations are accurate
- [ ] Session statistics track properly
- [ ] Keyboard navigation works throughout
- [ ] Visual feedback is clear and immediate
- [ ] Performance is smooth on target browsers

### Edge Cases to Test

- [ ] Single character games (very short duration)
- [ ] All character sets enabled (maximum complexity)
- [ ] Rapid typing vs. very slow typing
- [ ] Browser window resizing during gameplay
- [ ] Multiple games in sequence (statistics tracking)

## 📈 Success Metrics

### Technical Goals

- **Load Time**: < 3 seconds on standard broadband
- **Frame Rate**: Consistent 60 FPS during gameplay
- **Input Lag**: < 50ms response to keystrokes
- **Memory Usage**: < 100MB RAM consumption

### User Experience Goals

- **Intuitive Controls**: Users can navigate without instructions
- **Clear Feedback**: Immediate understanding of correct/incorrect input
- **Engaging Visuals**: Smooth animations and appealing graphics
- **Accurate Scoring**: Reliable WPM and mistake tracking

---

_This implementation plan provides a structured approach to building Snake Protector Typing Master, ensuring all features are delivered on schedule while maintaining high quality and performance standards._
