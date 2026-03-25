<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  board: (number | null)[] // 81 length array, null for empty
  initialBoard: (number | null)[] // To distinguish user input from given numbers
}>()

const emit = defineEmits<{
  (e: 'update:board', board: (number | null)[]): void
  (e: 'complete'): void
}>()

const localBoard = ref([...props.board])
const selectedNumber = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)

watch(() => props.board, (newBoard) => {
  localBoard.value = [...newBoard]
}, { deep: true })

const selectCell = (index: number) => {
  selectedIndex.value = index
  const value = localBoard.value[index]
  if (typeof value === 'number') {
    selectedNumber.value = value
  } else {
    selectedNumber.value = null
  }
}

const fillNumber = (num: number | null) => {
  if (selectedIndex.value !== null && !isInitial(selectedIndex.value)) {
    localBoard.value[selectedIndex.value] = num
    selectedNumber.value = num
    emit('update:board', [...localBoard.value])
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (selectedIndex.value === null || isInitial(selectedIndex.value)) return
  
  const key = event.key
  if (/^[1-9]$/.test(key)) {
    fillNumber(parseInt(key))
  } else if (key === 'Backspace' || key === 'Delete') {
    fillNumber(null)
  }
}

// Global keyboard listener
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const isInitial = (index: number) => {
  return props.initialBoard[index] !== null
}
</script>

<template>
  <div class="sudoku-container">
    <div class="sudoku-grid">
      <div 
        v-for="(cell, index) in localBoard" 
        :key="index" 
        class="sudoku-cell"
        :class="{
          'border-right': (index + 1) % 3 === 0 && (index + 1) % 9 !== 0,
          'border-bottom': Math.floor(index / 9) % 3 === 2 && Math.floor(index / 9) !== 8,
          'initial-cell': isInitial(index),
          'highlighted': cell !== null && cell === selectedNumber,
          'selected': index === selectedIndex
        }"
        @click="selectCell(index)"
      >
        <span v-if="isInitial(index)">{{ cell }}</span>
        <span v-else class="user-number" :class="{ 'empty': !cell }">
          {{ cell || '' }}
        </span>
      </div>
    </div>

    <div class="number-pad">
      <button 
        v-for="num in 9" 
        :key="num" 
        @click="fillNumber(num)"
        class="pad-btn"
      >
        {{ num }}
      </button>
      <button @click="fillNumber(null)" class="pad-btn clear-btn">✕</button>
    </div>
  </div>
</template>

<style scoped>
.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.sudoku-cell {
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 500;
  position: relative;
}

.sudoku-cell.border-right {
  border-right: 2px solid rgba(255, 255, 255, 0.4);
}

.sudoku-cell.border-bottom {
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
}

.sudoku-cell.selected {
  background: rgba(59, 130, 246, 0.4);
}

.user-number {
  color: #60a5fa;
  font-weight: 700;
}

.number-pad {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  width: 100%;
  max-width: 450px;
}

.pad-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pad-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.pad-btn:active {
  transform: translateY(0);
}

.clear-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.initial-cell {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.highlighted {
  background: rgba(59, 130, 246, 0.3) !important;
  color: #fff !important;
}

.highlighted input {
  color: #fff !important;
}

@media (max-width: 450px) {
  .sudoku-grid {
    border-width: 2px;
  }
  
  .sudoku-cell {
    font-size: 1rem;
  }
  
  .sudoku-cell input {
    font-size: 1rem;
  }
}

@media (max-width: 350px) {
  .sudoku-cell {
    font-size: 0.875rem;
  }
  
  .sudoku-cell input {
    font-size: 0.875rem;
  }
}
</style>
