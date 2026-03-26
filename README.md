# Sudoku

A minimalist Sudoku game built with Vue 3 and Vite.

## Features

- Save game state to `localStorage`.
- Progressive Web App (PWA) support.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Future Enhancements & Suggestions

As an expert in Sudoku gaming, here are several high-impact features and visual improvements to elevate the "Sudoku Master" experience:

### 🎮 Gameplay Mechanics

- **Undo/Redo System**: A must-have for advanced puzzles. Allow users to step back through their moves to correct mistakes without clearing the whole cell.
- **Smart Hint System**: Instead of just revealing a number, provide a hint that explains the logic (e.g., "This is the only spot for a 5 in this row").
- **Error Highlighting (Toggleable)**: Real-time feedback that highlights conflicting numbers in the same row, column, or 3x3 box as you type.
- **Auto-Cleanup Notes**: Automatically remove a number from the pencil marks in a row, column, and block when that number is finally placed in a cell.

### 📊 Statistics & Progression

- **Detailed Player Stats**: Track win/loss ratios, average completion times per difficulty, and current win streaks.
- **Daily Challenges**: A unique, synchronized puzzle for every player worldwide each day, with a dedicated leaderboard.
- **Global Leaderboards**: Compare your best times with other Sudoku Master players globally.

### ✨ Visuals & UX

- **Dynamic Themes**: Support for Dark/Light mode, high-contrast themes, and customizable board colors or background gradients (Glassmorphism vs. Flat).
- **Smooth Animations**: Add subtle "pop" animations when a number is placed and a rewarding "fireworks" or "shimmer" effect upon completing a board.
- **Haptic Feedback & Sound**: Subtle click sounds for number placement and haptic feedback on mobile devices for a more tactile feel.
- **Multi-select / Drag-fill**: Allow users to select multiple cells to apply the same pencil notes simultaneously.

### 🌐 Social & Multiplayer

- **Sudoku Battle Mode**: Real-time 1v1 matches where players race to solve identical boards with penalties for incorrect moves.
- **Local Multi-user Support**: Save separate progress and statistics for multiple people using the same device.
