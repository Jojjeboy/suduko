<script setup lang="ts">
import { ref, watch } from 'vue'

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

watch(() => props.board, (newBoard) => {
  localBoard.value = [...newBoard]
}, { deep: true })

const selectCell = (index: number) => {
  const value = localBoard.value[index]
  if (typeof value === 'number') {
    selectedNumber.value = value
  } else {
    selectedNumber.value = null
  }
}

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // Only allow 1-9
  if (/^[1-9]$/.test(value)) {
    localBoard.value[index] = parseInt(value)
    selectedNumber.value = localBoard.value[index]
  } else {
    localBoard.value[index] = null
    target.value = ''
    selectedNumber.value = null
  }
  
  emit('update:board', [...localBoard.value])
}

const isInitial = (index: number) => {
  return props.initialBoard[index] !== null
}
</script>

<template>
  <div class="sudoku-grid">
    <div 
      v-for="(cell, index) in localBoard" 
      :key="index" 
      class="sudoku-cell"
      :class="{
        'border-right': (index + 1) % 3 === 0 && (index + 1) % 9 !== 0,
        'border-bottom': Math.floor(index / 9) % 3 === 2 && Math.floor(index / 9) !== 8,
        'initial-cell': isInitial(index),
        'highlighted': cell !== null && cell === selectedNumber
      }"
      @click="selectCell(index)"
    >
      <input
        v-if="!isInitial(index)"
        type="text"
        :value="cell || ''"
        @input="handleInput(index, $event)"
        @focus="selectCell(index)"
        maxlength="1"
        inputmode="numeric"
      />
      <span v-else>{{ cell }}</span>
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

.sudoku-cell input {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  text-align: center;
  color: #60a5fa; /* User input color - slightly lighter blue */
  font-size: 1.25rem;
  font-weight: 700;
  outline: none;
  padding: 0;
}

.sudoku-cell input:focus {
  background: rgba(59, 130, 246, 0.2);
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
