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
  <ThemeToggle />
  <div class="container-fluid">
    <router-view></router-view>
  </div>
</template>

