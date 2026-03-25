<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  board: (number | null)[]      // 81 length array, null for empty
  initialBoard: (number | null)[] // To distinguish user input from given numbers
  notes: number[][]             // 81 arrays of candidate numbers
  noteMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update:board', board: (number | null)[]): void
  (e: 'update:notes', notes: number[][]): void
  (e: 'complete'): void
}>()

const localBoard = ref([...props.board])
const localNotes = ref<number[][]>(props.notes.map(n => [...n]))
const selectedNumber = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)

watch(() => props.board, (newBoard) => {
  localBoard.value = [...newBoard]
}, { deep: true })

watch(() => props.notes, (newNotes) => {
  localNotes.value = newNotes.map(n => [...n])
}, { deep: true })

const selectCell = (index: number) => {
  selectedIndex.value = index
  const value = localBoard.value[index]
  selectedNumber.value = typeof value === 'number' ? value : null
}

// Peers = all cells sharing the same row, column, or 3x3 box
const getPeers = (index: number): number[] => {
  const row = Math.floor(index / 9)
  const col = index % 9
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  const peers = new Set<number>()
  for (let i = 0; i < 9; i++) {
    peers.add(row * 9 + i) // same row
    peers.add(i * 9 + col) // same col
  }
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      peers.add(r * 9 + c)
    }
  }
  peers.delete(index)
  return [...peers]
}

const fillNumber = (num: number | null) => {
  if (selectedIndex.value === null || isInitial(selectedIndex.value)) return

  if (props.noteMode && num !== null) {
    // Toggle note
    const notes = localNotes.value.map(n => [...n])
    const cellNotes = notes[selectedIndex.value] ?? []
    const idx = cellNotes.indexOf(num)
    if (idx >= 0) {
      cellNotes.splice(idx, 1)
    } else {
      cellNotes.push(num)
      cellNotes.sort((a, b) => a - b)
    }
    notes[selectedIndex.value] = cellNotes
    emit('update:notes', notes)
  } else {
    // Place real number — clear notes from this cell and remove number from peers' notes
    localBoard.value[selectedIndex.value] = num
    selectedNumber.value = num

    const notes = localNotes.value.map(n => [...n])
    notes[selectedIndex.value] = [] // clear this cell's notes
    if (num !== null) {
      getPeers(selectedIndex.value).forEach(peerIdx => {
        const peerNotes = notes[peerIdx]
        if (!peerNotes) return
        const i = peerNotes.indexOf(num)
        if (i >= 0) peerNotes.splice(i, 1)
      })
    }
    emit('update:notes', notes)
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

onMounted(() => { window.addEventListener('keydown', handleKeyDown) })
onUnmounted(() => { window.removeEventListener('keydown', handleKeyDown) })

const isInitial = (index: number) => props.initialBoard[index] !== null
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
        <!-- Initial / user-filled number -->
        <span v-if="isInitial(index)">{{ cell }}</span>
        <span v-else-if="cell" class="user-number">{{ cell }}</span>

        <!-- Notes mini-grid (only if cell is empty) -->
        <div v-else class="notes-grid">
          <span
            v-for="n in 9"
            :key="n"
            class="note-digit"
            :class="{ 'note-active': localNotes[index]?.includes(n) }"
          >{{ localNotes[index]?.includes(n) ? n : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Number pad -->
    <div class="number-pad">
      <button
        v-for="num in 9"
        :key="num"
        @click="fillNumber(num)"
        class="pad-btn"
        :class="{ 'pad-btn-note': noteMode }"
      >
        {{ num }}
      </button>
      <button @click="fillNumber(null)" class="pad-btn clear-btn" aria-label="Eraser">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="eraser-svg">
          <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"></path>
          <path d="M17 17L7 7"></path>
        </svg>
      </button>
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
  cursor: pointer;
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
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

/* Notes mini-grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  padding: 1px;
}

.note-digit {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.28rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0);
  transition: color 0.1s;
}

.note-digit.note-active {
  color: rgba(147, 197, 253, 0.9);
  font-weight: 700;
}

/* Number pad */
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

/* Note-mode active state for number buttons */
.pad-btn-note {
  background: rgba(147, 197, 253, 0.15);
  border-color: rgba(147, 197, 253, 0.5);
  color: #93c5fd;
  font-size: 0.75rem;
  font-weight: 700;
}

.pad-btn-note:hover {
  background: rgba(147, 197, 253, 0.25);
}

.clear-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.eraser-svg {
  width: 20px;
  height: 20px;
}

.initial-cell {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.highlighted {
  background: rgba(59, 130, 246, 0.3) !important;
  color: #fff !important;
}

@media (max-width: 450px) {
  .sudoku-grid {
    border-width: 2px;
  }

  .sudoku-cell {
    font-size: 1rem;
  }

  .note-digit {
    font-size: 0.22rem;
  }
}

@media (max-width: 350px) {
  .sudoku-cell {
    font-size: 0.875rem;
  }

  .note-digit {
    font-size: 0.18rem;
  }
}
</style>
