<template>
  <button class="theme-toggle" @click="toggleTheme" :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
    <span class="icon" :class="{ 'is-dark': isDarkMode }">
      {{ isDarkMode ? 'Night' : 'Day' }}
    </span>
  </button>
</template>

<script setup>
import { isDarkMode, toggleTheme } from '../utils/theme'
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  padding: 0.5rem;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icon {
  font-size: 1.2rem;
  line-height: 1;
}
</style> 