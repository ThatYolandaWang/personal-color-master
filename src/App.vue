<script setup>
import { onMounted } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { initTheme } from './utils/theme'

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <ThemeToggle />
    <main class="main-content container-fluid p-0">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
:root {
  /* 使用CSS变量实现主题切换 */
  --color-primary: #B5C7C9;
  --color-secondary: #E6D5C9;
  --color-accent: #D3C0CD;
  --color-background: #F5F5F5;
  --color-surface: #FFFFFF;
  --color-text: #2C3E50;
  --color-border: #E8E8E8;
  --color-hover: #A5B5B7;
  
  /* 布局变量 */
  --content-max-width: 1200px;
  --content-padding: 2rem;
  --border-radius: 12px;
}

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
  color: var(--color-text);
  background-color: var(--color-background);
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  transition: background-color 0.3s ease;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--content-padding);
  overflow: hidden;
  background-color: var(--color-background);
  transition: background-color 0.3s ease;
}

/* 添加暗色主题样式 */
.dark-mode {
  color: var(--color-text);
  background-color: var(--color-background) !important;
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
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--color-hover);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-hover);
}
</style>
