<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import { initTheme } from './utils/theme'

// 初始化主题
onMounted(() => {
  initTheme();
});
</script>

<template>
  <AppHeader />
  <div class="container-fluid">
    <router-view></router-view>
  </div>
</template>

