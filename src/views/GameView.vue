<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Using a more robust import for the sudoku library
import * as sudokuModule from 'sudoku'
import SudokuBoard from '@/components/SudokuBoard.vue'
import BaseModal from '@/components/BaseModal.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// Handle potentially different bundle formats for the sudoku library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sudoku: any = (sudokuModule as any).default || sudokuModule

type Difficulty = 'easy' | 'medium' | 'hard'
const difficulty = ref<Difficulty | null>(null)
const board = ref<(number | null)[]>([])
const initialBoard = ref<(number | null)[]>([])
const isGameActive = ref(false)

// Modal State
const modalConfig = ref({
  show: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  isConfirm: false,
  onConfirm: () => {},
  onCancel: () => {}
})

const showModal = (config: Partial<typeof modalConfig.value>) => {
  modalConfig.value = {
    ...modalConfig.value,
    show: true,
    title: config.title || '',
    message: config.message || '',
    confirmText: config.confirmText || t('game.ok') || 'OK',
    cancelText: config.cancelText || t('game.cancel') || 'Cancel',
    isConfirm: config.isConfirm || false,
    onConfirm: config.onConfirm || (() => {}),
    onCancel: config.onCancel || (() => {})
  }
}

const closeModal = () => {
  modalConfig.value.show = false
}

const handleModalConfirm = () => {
  modalConfig.value.onConfirm()
  closeModal()
}

const handleModalCancel = () => {
  modalConfig.value.onCancel()
  closeModal()
}

// Timer and Scoreboard
const seconds = ref(0)
let timerInterval: number | null = null
const bestTimes = ref<Record<Difficulty, number | null>>({
  easy: null,
  medium: null,
  hard: null
})

const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const loadBestTimes = () => {
  const saved = localStorage.getItem('sudoku-best-times')
  if (saved) {
    try {
      bestTimes.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse best times', e)
    }
  }
}

const saveBestTime = (level: Difficulty, time: number) => {
  const currentBest = bestTimes.value[level]
  if (currentBest === null || time < currentBest) {
    bestTimes.value[level] = time
    localStorage.setItem('sudoku-best-times', JSON.stringify(bestTimes.value))
    return true
  }
  return false
}

// Session Management
const saveSession = () => {
  if (isGameActive.value && difficulty.value) {
    const session = {
      difficulty: difficulty.value,
      board: board.value,
      initialBoard: initialBoard.value,
      seconds: seconds.value
    }
    localStorage.setItem('sudoku-active-session', JSON.stringify(session))
  }
}

const clearSession = () => {
  localStorage.removeItem('sudoku-active-session')
}

const loadSession = () => {
  const saved = localStorage.getItem('sudoku-active-session')
  if (saved) {
    try {
      const session = JSON.parse(saved)
      if (route.query.resume === 'true') {
        difficulty.value = session.difficulty
        board.value = session.board
        initialBoard.value = session.initialBoard
        seconds.value = session.seconds
        isGameActive.value = true
        startTimer(true)
      } else {
        showModal({
          title: t('game.resume_title'),
          message: t('game.resume_prompt'),
          isConfirm: true,
          onConfirm: () => {
            difficulty.value = session.difficulty
            board.value = session.board
            initialBoard.value = session.initialBoard
            seconds.value = session.seconds
            isGameActive.value = true
            startTimer(true)
          },
          onCancel: () => {
            clearSession()
          }
        })
      }
    } catch (e) {
      console.error('Failed to parse active session', e)
      clearSession()
    }
  }
}

const startTimer = (resume = false) => {
  stopTimer()
  if (!resume) seconds.value = 0
  timerInterval = window.setInterval(() => {
    seconds.value++
    saveSession() // Save session every second (or we can just save on board change)
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onMounted(() => {
  loadBestTimes()
  loadSession()
})

onUnmounted(() => {
  stopTimer()
})

const goBack = () => {
  if (isGameActive.value) {
    isGameActive.value = false
  } else {
    router.push('/')
  }
}

const startNewGame = (level: Difficulty) => {
  // If there's an active session of a different level, clear it
  clearSession()
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
  startTimer()
}

// Watch for board changes to save session
watch(board, () => {
  if (isGameActive.value) {
    saveSession()
  }
}, { deep: true })

const checkGame = () => {
  const currentBoard = board.value.map(v => v !== null ? v - 1 : null)
  const solved = sudoku.solvepuzzle(currentBoard)
  
  if (!solved) {
    showModal({
      title: t('game.error_title') || 'Error',
      message: t('game.unsolvable')
    })
    return
  }
  
  const isCorrectSoFar = currentBoard.every((v, i) => v === null || v === solved[i])
  
  if (!isCorrectSoFar) {
    showModal({
      title: t('game.incorrect_title') || 'Sudoku',
      message: t('game.incorrect')
    })
  } else if (board.value.every(v => v !== null)) {
    stopTimer()
    clearSession() // Clear session on win
    const isNewRecord = saveBestTime(difficulty.value!, seconds.value)
    
    let message = t('game.congratulations')
    if (isNewRecord) {
      message += ` ${t('game.new_record')} (${formatTime(seconds.value)})`
    } else {
      message += ` (${formatTime(seconds.value)})`
    }
    
    showModal({
      title: t('game.win_title') || 'Congratulations!',
      message: message
    })
    isGameActive.value = false
  } else {
    showModal({
      title: t('game.status_title') || 'Sudoku',
      message: t('game.looking_good')
    })
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
          <div class="header-center">
            <h2>{{ $t(`game.${difficulty}`) }}</h2>
            <div class="timer-info">
              <span class="current-timer">{{ formatTime(seconds) }}</span>
              <span v-if="bestTimes[difficulty!] !== null" class="best-timer">
                Best: {{ formatTime(bestTimes[difficulty!]!) }}
              </span>
            </div>
          </div>
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

    <!-- Custom Modal -->
    <BaseModal
      :show="modalConfig.show"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :confirm-text="modalConfig.confirmText"
      :cancel-text="modalConfig.cancelText"
      :is-confirm="modalConfig.isConfirm"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
      @close="closeModal"
    />
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
  margin-bottom: 1rem;
}

.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-center h2 {
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
}

.timer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.current-timer {
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: #60a5fa;
}

.best-timer {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
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
