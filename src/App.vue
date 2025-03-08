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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--content-padding);
  overflow: hidden;
  transition: background-color 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :root {
    --content-padding: 1rem;
  }
}

/* 通用样式 */
button {
  font-family: inherit;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

a {
  text-decoration: none;
  transition: color 0.3s ease;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: var(--bs-body-bg);
}

::-webkit-scrollbar-thumb {
  background-color: var(--bs-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-primary-hover, var(--bs-primary-dark, var(--bs-primary)));
}

/* 定义一些全局容器变量 */
:root {
  --content-max-width: 1200px;
  --content-padding: 2rem;
  --border-radius: 0.5rem;
}
</style>
