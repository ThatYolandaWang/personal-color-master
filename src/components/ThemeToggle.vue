<template>
  <div class="theme-controls">
    <!-- 仅保留亮暗模式切换 -->
    <button class="btn btn-primary rounded-circle theme-toggle" @click="toggleTheme" :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
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

/* 使用全局圆形按钮样式，仅保留位置相关样式 */
.theme-toggle {
  position: static !important;
  bottom: auto !important;
  right: auto !important;
}
</style> 