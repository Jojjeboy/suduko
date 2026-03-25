<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Using a more robust import for the sudoku library
import * as sudokuModule from 'sudoku'
import SudokuBoard from '@/components/SudokuBoard.vue'

const { t } = useI18n()
const router = useRouter()

// Handle potentially different bundle formats for the sudoku library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sudoku: any = (sudokuModule as any).default || sudokuModule

type Difficulty = 'easy' | 'medium' | 'hard'
const difficulty = ref<Difficulty | null>(null)
const board = ref<(number | null)[]>([])
const initialBoard = ref<(number | null)[]>([])
const isGameActive = ref(false)

const goBack = () => {
  if (isGameActive.value) {
    isGameActive.value = false
  } else {
    router.push('/')
  }
}

const startNewGame = (level: Difficulty) => {
  difficulty.value = level
  
  let puzzle: (number | null)[]
  let rating: number
  
  let attempts = 0
  const maxAttempts = 50
  
  do {
    puzzle = sudoku.makepuzzle()
    rating = sudoku.ratepuzzle(puzzle, 4)
    attempts++
  } while (
    attempts < maxAttempts && (
      (level === 'easy' && rating > 1) ||
      (level === 'medium' && (rating <= 1 || rating > 2.5)) ||
      (level === 'hard' && rating <= 2.5)
    )
  )
  
  board.value = puzzle.map((v: number | null) => v !== null ? v + 1 : null)
  initialBoard.value = [...board.value]
  isGameActive.value = true
}

const checkGame = () => {
  const currentBoard = board.value.map(v => v !== null ? v - 1 : null)
  const solved = sudoku.solvepuzzle(currentBoard)
  
  if (!solved) {
    alert(t('game.unsolvable'))
    return
  }
  
  const isCorrectSoFar = currentBoard.every((v, i) => v === null || v === solved[i])
  
  if (!isCorrectSoFar) {
    alert(t('game.incorrect'))
  } else if (board.value.every(v => v !== null)) {
    alert(t('game.congratulations'))
    isGameActive.value = false
  } else {
    alert(t('game.looking_good'))
  }
}

const solveGame = () => {
  const currentBoard = initialBoard.value.map(v => v !== null ? v - 1 : null)
  const solved = sudoku.solvepuzzle(currentBoard)
  board.value = solved.map((v: number) => v + 1)
}
</script>

<template>
  <main class="center-content">
    <div class="glass-container game-container">
      <div v-if="!isGameActive" class="level-selection">
        <h2>{{ $t('game.select_difficulty') }}</h2>
        <div class="difficulty-buttons">
          <button @click="startNewGame('easy')" class="btn btn-primary level-btn easy">
            {{ $t('game.easy') }}
          </button>
          <button @click="startNewGame('medium')" class="btn btn-primary level-btn medium">
            {{ $t('game.medium') }}
          </button>
          <button @click="startNewGame('hard')" class="btn btn-primary level-btn hard">
            {{ $t('game.hard') }}
          </button>
        </div>
        <button @click="goBack" class="btn btn-secondary back-btn">
          {{ $t('game.back_to_home') }}
        </button>
      </div>

      <div v-else class="active-game">
        <div class="game-header">
          <button @click="goBack" class="btn-icon" aria-label="Back">←</button>
          <h2>{{ $t(`game.${difficulty}`) }}</h2>
          <div class="header-spacer"></div>
        </div>
        
        <SudokuBoard 
          v-model:board="board" 
          :initial-board="initialBoard"
        />
        
        <div class="game-footer">
          <button @click="checkGame" class="btn btn-primary compact-btn">
            {{ $t('game.check_board') }}
          </button>
          <button @click="solveGame" class="btn btn-secondary compact-btn">
            {{ $t('game.solve') }}
          </button>
          <button @click="isGameActive = false" class="btn btn-secondary compact-btn">
            {{ $t('game.new_game') }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.game-container {
  width: 95%;
  max-width: 500px;
  padding: 2rem;
}

.level-selection h2, .active-game h2 {
  margin-bottom: 2rem;
  text-align: center;
}

.difficulty-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.level-btn {
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.easy { background: #10b981; }
.medium { background: #f59e0b; }
.hard { background: #ef4444; }

.back-btn {
  width: 100%;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-spacer { width: 40px; }

.game-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.compact-btn {
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  min-width: 100px;
}

@media (max-width: 400px) {
  .game-container {
    padding: 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .game-footer {
    gap: 0.25rem;
  }
  
  .compact-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    min-width: 80px;
  }
}
</style>
