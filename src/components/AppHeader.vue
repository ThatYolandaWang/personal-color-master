<template>
  <header class="app-header py-2 mb-3">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center">
        <!-- 项目Logo和标题 -->
        <div class="d-flex align-items-center">
          <router-link to="/" class="d-flex align-items-center text-decoration-none">
            <img src="@/assets/logo.png" alt="个人色彩管家" class="app-logo me-2" />
            <span class="app-title">个人色彩管家</span>
          </router-link>
        </div>
        
        <!-- 中间显示当前页面标题 -->
        <div class="flex-grow-1 d-flex justify-content-center">
          <h1 class="current-page-title my-0" v-if="currentPageTitle">{{ currentPageTitle }}</h1>
        </div>
        
        <!-- 右侧功能区，包含主题切换按钮 -->
        <div>
          <button class="btn btn-sm rounded-circle theme-btn" 
                  @click="toggleTheme" 
                  :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
            <i class="bi" :class="{ 'bi-moon-fill': isDarkMode, 'bi-sun-fill': !isDarkMode }"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { isDarkMode, toggleTheme } from '../utils/theme'

const route = useRoute()

// 根据当前路由确定页面标题
const currentPageTitle = computed(() => {
  switch(route.path) {
    case '/':
      return '' // 首页不需要额外标题
    case '/user-survey':
      return '个人信息收集'
    case '/color-test':
      return '个人色彩测试'
    case '/report':
      return '色彩分析报告'
    default:
      return ''
  }
})
</script>

<style scoped>
.app-header {
  background-color: var(--color-surface, #f7f4f0);
  border-bottom: 1px solid var(--color-borderLight, #e7dfd5);
  box-shadow: 0 2px 5px var(--color-shadow, rgba(92, 90, 87, 0.15));
  position: sticky;
  top: 0;
  z-index: 900;
}

.app-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.app-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-text, #3c3a38);
}

.current-page-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-text, #3c3a38);
}

/* 主题切换按钮样式 */
.theme-btn {
  width: 36px !important;
  height: 36px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: transparent !important;
  color: var(--color-text, #3c3a38) !important;
  border: 1px solid var(--color-borderLight, #e7dfd5) !important;
  position: static !important; /* 覆盖全局样式的fixed定位 */
  transition: all 0.3s ease !important;
}

.theme-btn:hover {
  background-color: var(--color-hover, #e7dfd5) !important;
  transform: rotate(15deg) !important;
}

.theme-btn i {
  font-size: 1rem !important;
}

/* 深色模式适配 */
:root[data-bs-theme="morandi-dark"] .app-header {
  background-color: var(--color-surface, #666460);
}

:root[data-bs-theme="morandi-dark"] .app-title,
:root[data-bs-theme="morandi-dark"] .current-page-title {
  color: var(--color-text, #f5f2ee);
}

:root[data-bs-theme="morandi-dark"] .theme-btn {
  border-color: var(--color-borderLight, #706e6c) !important;
  color: var(--color-text, #f5f2ee) !important;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .app-title {
    font-size: 0.95rem;
  }
  
  .current-page-title {
    font-size: 1rem;
  }
  
  .app-logo {
    width: 30px;
    height: 30px;
  }
}
</style> 