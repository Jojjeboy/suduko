<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const bestTimes = ref<Record<string, number | null>>({
  easy: null,
  medium: null,
  hard: null
})

const formatTime = (totalSeconds: number | null) => {
  if (totalSeconds === null) return '--:--'
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  const saved = localStorage.getItem('sudoku-best-times')
  if (saved) {
    try {
      bestTimes.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse best times', e)
    }
  }
})

const startGame = () => {
  router.push('/play')
}
</script>

<template>
  <main class="center-content">
    <div class="glass-container">
      <h1>{{ $t('welcome.title') }}</h1>
      <p class="subtitle">{{ $t('welcome.subtitle') }}</p>
      
      <div class="welcome-actions">
        <button @click="startGame" class="btn btn-primary start-btn">
          {{ $t('welcome.start_game') }}
        </button>
      </div>

      <div class="scoreboard">
        <h3>{{ $t('game.scoreboard') }}</h3>
        <div class="score-grid">
          <div class="score-item">
            <span class="label">{{ $t('game.easy') }}</span>
            <span class="value">{{ formatTime(bestTimes.easy as number | null) }}</span>
          </div>
          <div class="score-item">
            <span class="label">{{ $t('game.medium') }}</span>
            <span class="value">{{ formatTime(bestTimes.medium as number | null) }}</span>
          </div>
          <div class="score-item">
            <span class="label">{{ $t('game.hard') }}</span>
            <span class="value">{{ formatTime(bestTimes.hard as number | null) }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.glass-container {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
}

h1 {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff 0%, #aaa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 3rem;
}

.start-btn {
  background-color: #ffffff;
  color: #35495e;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  width: 100%;
}

.start-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.scoreboard {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.scoreboard h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.score-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.score-item .label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.score-item .value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1.1rem;
  color: #60a5fa;
  font-weight: 700;
}
</style>
