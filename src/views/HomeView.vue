<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

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
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 3rem;
}

.start-btn {
  padding: 1.2rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}
</style>
