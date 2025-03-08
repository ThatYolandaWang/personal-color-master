<script setup>
import { onMounted } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { initTheme, isDarkMode } from './utils/theme'

// 初始化主题
onMounted(() => {
  initTheme();
});
</script>

<template>
  <div id="app">
    <ThemeToggle />
    <main class="main-content container-fluid p-0">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
/* 基础样式已移至 main.css */

html, body {
  height: 100%;
  width: 100%;
  overflow: auto;
}

#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: background-color var(--transition-speed) ease;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: var(--content-padding, 2rem);
  overflow: visible;
  transition: background-color var(--transition-speed) ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :root {
    --content-padding: 1rem;
  }
  
  .main-content {
    padding: var(--content-padding, 1rem);
    align-items: flex-start;
  }
}
</style>
