<template>
  <div class="theme-controls">
    <!-- 仅保留亮暗模式切换 -->
    <button class="btn theme-toggle shadow-sm" @click="toggleTheme" :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'"
      :class="isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'">
      <i class="bi" :class="{ 'bi-moon-fill': isDarkMode, 'bi-sun-fill': !isDarkMode }"></i>
    </button>
  </div>
</template>

<script setup>
import { isDarkMode, toggleTheme } from '../utils/theme'
</script>

<style scoped>
.theme-controls {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.theme-toggle {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-speed, 0.3s) ease;
  background-color: transparent;
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}

.theme-toggle:hover {
  transform: scale(1.1);
  background-color: var(--bs-primary);
  color: var(--bs-light);
}

.theme-toggle i {
  font-size: 1.2rem;
}
</style> 