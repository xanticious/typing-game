# Snake Protector Typing Master - Design Document

## 🎯 Project Overview

**Snake Protector Typing Master** is a fantasy-themed typing game where players defend a wizard by typing letters to destroy an approaching magical basilisk snake. The snake follows a spiral path toward the center, and players must type the letters on its body segments to eliminate them before the snake reaches the wizard.

## 🎨 Visual Design

### Theme: Fantasy Wizard vs. Basilisk

- **Setting**: Mystical arena with zigzag pathways (Zuma-style)
- **Protagonist**: Wizard at the bottom center with animated wand casting protective spells
- **Antagonist**: Magical Basilisk snake with ornate design
- **Color Palette**: Rich fantasy colors - deep purples, golds, emerald greens
- **Highlight Color**: Bright yellow for active typing targets
- **Art Style**: High resolution, sharp, crisp graphics with magical particle effects

### Game Elements

- **Snake Head**: Detailed basilisk head with glowing eyes
- **Body Segments**: Circular segments containing upright letters/characters
- **Tail**: Decorative flowing tail for visual appeal
- **Wizard**: Bottom center character with wand animation
- **Background**: Zigzag pathway with switchbacks in triangular constraint, magical ambiance
- **UI Overlays**: Translucent effects for penalties and feedback

## 🎮 Game Mechanics

### Core Gameplay Loop

1. Snake spawns at the top start of the zigzag path with generated letter sequence
2. Player types the highlighted (yellow) front body segment letter
3. **Correct Input**: Segment disappears, head slides back, snake continues along path
4. **Incorrect Input**: 0.5 second typing lockout with visual penalty
5. **Victory**: All segments destroyed before reaching the wizard at bottom center
6. **Defeat**: Snake reaches the wizard at the bottom center

### Input System

- **Target**: Always the front body segment (highlighted in yellow)
- **Feedback**: Immediate visual response to correct/incorrect input
- **Penalty**: Half-second lockout with translucent shield overlay
- **Letters**: Always displayed upright for readability

### Movement System

- **Path**: Configurable zigzag switchbacks from top to bottom center
- **Layout**: Triangular constraint with wizard at bottom apex
- **Speed**: Calculated based on difficulty setting and time duration
- **Length**: Determined by character set selections and time setting
- **Direction**: Follows switchback pattern with smooth corner transitions

## 🎛️ Main Menu Configuration

### Game Title Screen

```
🐍 Snake Protector Typing Master 🧙‍♂️

Character Sets:
☐ Lowercase letters (a-z)
☐ Uppercase letters (A-Z)
☐ Numbers (0-9)
☐ Symbols (~!@#$%^&*()_-+={[}]|\:;"'<,>.?/)

Difficulty (Speed):
○ Slowest (~10 WPM)
○ Slower (~20 WPM)
○ Slow (~30 WPM)
○ Medium (~40 WPM)
○ Fast (~50 WPM)
○ Faster (~60 WPM)
○ Fastest (~70 WPM)

Time Duration:
○ Shortest (10 seconds)
○ Shorter (20 seconds)
○ Short (30 seconds)
○ Medium (40 seconds)
○ Long (50 seconds)
○ Longer (60 seconds)
○ Extra Long (120 seconds)

[Start Game]    [View Statistics]
```

### Configuration Logic

- **Character Sets**: Multiple selections allowed, must select at least one
- **Difficulty**: Single selection, affects snake speed
- **Time**: Single selection, determines game duration and snake length
- **Validation**: Ensure at least one character set is selected before starting

## 📊 Scoring System

### Score Calculation

```
Base WPM = (total_characters_typed / 5) / (time_elapsed_minutes)
Mistake_penalty = mistake_count * 2
Final_score = Base_WPM - mistake_penalty
```

### Session Statistics

- **Current Session**: Track best score for each difficulty/time combination
- **Display**: "Best score today: X WPM" or "No data" for unplayed combinations
- **Storage**: Session-only (no persistence to localStorage)

### Statistics View

- **Format**: Table showing best scores for each configuration
- **Columns**: Character Sets, Difficulty, Time, Best WPM, Mistakes
- **Navigation**: Return to main menu option

## 🎯 Game States

### 1. Main Menu

- Configuration selection
- Statistics viewing
- Game initialization

### 2. Game Arena

- Active typing gameplay
- Real-time snake movement
- Input processing and feedback
- Score tracking

### 3. Results Screen

#### Victory

```
🎉 Congratulations! 🎉
You protected the wizard!

📊 Your Results:
• Characters typed: X
• Mistakes: X
• Final WPM: X
• Time taken: X seconds

[Try Again]    [Main Menu]
```

#### Defeat

```
💀 Ouch! The basilisk reached the wizard! 💀

📊 Your Results:
• Characters typed: X
• Mistakes: X
• Final WPM: X
• Time survived: X seconds

[Try Again]    [Main Menu]
```

## 🔧 Technical Specifications

### Technology Stack

- **Framework**: Vanilla JavaScript
- **Graphics**: HTML5 Canvas with high-DPI support
- **Deployment**: Static hosting on GitHub Pages
- **Target**: Desktop browsers, modern web standards

### Performance Requirements

- **Frame Rate**: 60 FPS smooth animation
- **Responsiveness**: Immediate input feedback (<50ms)
- **Load Time**: Under 3 seconds on standard broadband
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)

### Mathematical Calculations

#### Zigzag Path System

```javascript
// Configurable zigzag path with switchbacks
class ZigzagPath {
  constructor(canvasWidth, canvasHeight, levels = 6) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.levels = levels;
    this.wizardX = canvasWidth / 2;
    this.wizardY = canvasHeight * 0.9; // Bottom center
    this.generatePathSegments();
  }

  generatePathSegments() {
    // Create triangular constraint with switchbacks
    // Each level gets progressively narrower
    // Smooth corners at direction changes
  }
}
```

#### Snake Speed Calculation

```javascript
speed = (total_path_length / time_duration) * difficulty_multiplier;
snake_length = character_pool_size * time_factor;
```

#### Difficulty Multipliers

- Slowest: 0.5x
- Slower: 0.75x
- Slow: 1.0x
- Medium: 1.25x
- Fast: 1.5x
- Faster: 1.75x
- Fastest: 2.0x

## 🎨 Asset Requirements

### Graphics Assets

- Wizard character sprite (idle and casting animations)
- Basilisk head design (multiple angles for rotation)
- Body segment circles (with letter rendering)
- Tail design elements
- Background spiral pathway
- Particle effects for magical ambiance
- UI elements (buttons, overlays, text styling)

### Audio Assets (Future Enhancement)

- Background magical ambiance
- Typing success/error sounds
- Victory/defeat fanfares
- UI interaction sounds

## 🔄 User Experience Flow

### Navigation Flow

```
Main Menu → Game Configuration → Game Arena → Results → [Loop]
     ↓
Statistics View → Main Menu
```

### Input Accessibility

- **Keyboard Navigation**: Tab through menu options
- **Enter/Space**: Activate buttons
- **Escape**: Return to previous screen
- **Focus Indicators**: Clear visual focus states

### Error Handling

- **Invalid Configuration**: Prevent game start, show error message
- **Input Errors**: Visual feedback, brief lockout period
- **Game Interruption**: Pause/resume functionality

## 🚀 Future Enhancements (Post-MVP)

### Gameplay Features

- **Survival Mode**: Increasing difficulty over time
- **Multiple Themes**: Different visual styles and characters
- **Power-ups**: Special abilities for the wizard
- **Multiplayer**: Competitive typing battles

### Accessibility Features

- **Colorblind Support**: Alternative highlight methods
- **Audio Cues**: Sound feedback for actions
- **Font Size Options**: Adjustable text sizing
- **High Contrast Mode**: Improved visibility options

### Technical Improvements

- **Mobile Support**: Touch typing interface
- **Persistent Statistics**: Local storage for long-term tracking
- **Cloud Sync**: Account-based progress saving
- **Performance Optimization**: Advanced rendering techniques

---

_This design document serves as the foundation for implementing Snake Protector Typing Master, ensuring a cohesive and engaging user experience while maintaining technical feasibility and performance standards._
