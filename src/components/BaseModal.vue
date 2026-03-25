<script setup lang="ts">
defineProps<{
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  isConfirm?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-container glass-container">
        <div class="modal-header">
          <h2 v-if="title">{{ title }}</h2>
          <button class="close-btn" @click="emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <p v-if="message">{{ message }}</p>
          <slot></slot>
        </div>
        
        <div class="modal-footer">
          <button 
            v-if="isConfirm" 
            @click="emit('cancel')" 
            class="btn btn-secondary compact-btn"
          >
            {{ cancelText || 'Cancel' }}
          </button>
          <button 
            @click="emit('confirm')" 
            class="btn btn-primary compact-btn"
          >
            {{ confirmText || 'OK' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-container {
  width: 100%;
  max-width: 400px;
  padding: 1.5rem !important;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #aaa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;
}

.close-btn:hover {
  color: white;
}

.modal-body {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.compact-btn {
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  min-width: 80px;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container {
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}
</style>
