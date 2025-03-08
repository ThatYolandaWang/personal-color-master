import { ref, watch } from 'vue'

// 创建响应式的主题状态
export const isDarkMode = ref(false)

// Bootstrap 5.3 颜色模式 - 移除自定义颜色
// 保留这些值以支持旧版本代码的平滑过渡
export const themeColors = {
  light: {
    primary: '#0d6efd',    // Bootstrap primary
    secondary: '#6c757d',  // Bootstrap secondary
    accent: '#0dcaf0',     // Bootstrap info
    background: '#ffffff', // 白色背景
    surface: '#ffffff',    // 白色表面
    text: '#212529',       // Bootstrap 标准文本
    border: '#dee2e6',     // Bootstrap border
    hover: '#0b5ed7',      // Bootstrap primary hover
  },
  dark: {
    primary: '#0d6efd',    // 保持Bootstrap primary
    secondary: '#6c757d',  // 保持Bootstrap secondary
    accent: '#0dcaf0',     // 保持Bootstrap info
    background: '#212529', // Bootstrap dark背景
    surface: '#343a40',    // Bootstrap dark表面
    text: '#f8f9fa',       // Bootstrap dark文本
    border: '#495057',     // Bootstrap dark边框
    hover: '#0b5ed7',      // 保持hover颜色
  }
}

// 切换主题
export function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
}

// 应用主题 - 使用Bootstrap的方式
export function applyTheme() {
  const theme = isDarkMode.value ? 'dark' : 'light'
  const root = document.documentElement
  
  // 设置Bootstrap 5.3的data-bs-theme属性
  root.setAttribute('data-bs-theme', theme)
  
  // 向后兼容性 - 设置自定义CSS变量
  const colorTheme = isDarkMode.value ? themeColors.dark : themeColors.light
  Object.entries(colorTheme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  
  // 更新meta主题色
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', colorTheme.background)
  }
  
  // 保存主题偏好
  localStorage.setItem('theme', theme)
}

// 初始化主题
export function initTheme() {
  // 检查本地存储的主题偏好
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // 检查系统主题偏好
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === null) {
      isDarkMode.value = e.matches
      applyTheme()
    }
  })
}

// 导出一个方法来检查元素是否应该使用深色样式
// 这是为了帮助组件过渡到新的主题系统
export function useDarkStyle(element) {
  return isDarkMode.value
} 