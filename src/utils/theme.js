import { ref, watch } from 'vue'

// 导出一个响应式的深色模式变量
export const isDarkMode = ref(false)

// 自定义颜色
export const themeColors = {
  light: {
    // 基础色彩 - 使用莫兰迪色系
    primary: '#8e9fbc',
    secondary: '#b3b1a9',
    accent: '#bcd1c4',
    
    // 背景色
    background: '#f5f2ee',
    surface: '#f7f4f0',
    card: '#ffffff',
    
    // 文本色
    text: '#3c3a38',
    textSecondary: '#706e6c',
    
    // 边框色
    border: '#ddcec0',
    borderLight: '#e7dfd5',
    
    // 交互色
    hover: '#e7dfd5',
    active: '#ddcec0',
    
    // 其他自定义颜色
    overlay: 'rgba(92, 90, 87, 0.1)',
    shadow: 'rgba(92, 90, 87, 0.15)',
  },
  dark: {
    // 基础色彩 - 使用莫兰迪色系
    primary: '#9eadc8',
    secondary: '#c1bfb7',
    accent: '#cce0d4',
    
    // 背景色
    background: '#5c5a57',
    surface: '#666460',
    card: '#706e6c',
    
    // 文本色
    text: '#f5f2ee',
    textSecondary: '#e0d4c6',
    
    // 边框色
    border: '#7d7b78',
    borderLight: '#706e6c',
    
    // 交互色
    hover: '#666460',
    active: '#7d7b78',
    
    // 其他自定义颜色
    overlay: 'rgba(245, 242, 238, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  }
}

// 切换主题亮暗模式
export function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
}

// 应用主题
export function applyTheme() {
  const isDark = isDarkMode.value
  const root = document.documentElement
  
  // 设置莫兰迪主题
  root.setAttribute('data-bs-theme', isDark ? 'morandi-dark' : 'morandi-light')
  
  // 选择当前主题颜色
  const colorTheme = isDark ? themeColors.dark : themeColors.light
  
  // 应用自定义CSS变量
  Object.entries(colorTheme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  
  // 设置其他UI相关变量
  root.style.setProperty('--border-radius', '0.5rem')
  root.style.setProperty('--content-padding', '2rem')
  root.style.setProperty('--content-max-width', '1200px')
  
  // 更新meta主题色
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const bgColor = getComputedStyle(root).getPropertyValue('--bs-body-bg').trim()
    metaThemeColor.setAttribute('content', bgColor || (isDark ? '#5c5a57' : '#f5f2ee'))
  }
  
  // 保存主题偏好
  localStorage.setItem('theme-mode', isDark ? 'dark' : 'light')
}

// 初始化主题
export function initTheme() {
  // 检查本地存储中的主题偏好
  const savedThemeMode = localStorage.getItem('theme-mode')
  
  // 设置亮暗模式
  if (savedThemeMode) {
    // 如果有保存的主题偏好，使用它
    isDarkMode.value = savedThemeMode === 'dark'
  } else {
    // 否则检测系统颜色模式偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
  }
  
  // 应用主题
  applyTheme()
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // 只有在用户没有明确设置主题偏好时才自动切换
    if (!localStorage.getItem('theme-mode')) {
      isDarkMode.value = e.matches
      applyTheme()
    }
  })
  
  // 监听isDarkMode变化
  watch(isDarkMode, () => {
    applyTheme()
  })
}

// 自定义组件样式辅助函数
export function useDarkMode(element) {
  if (!element) return
  
  const updateElementClass = () => {
    if (isDarkMode.value) {
      element.classList.add('dark-mode')
    } else {
      element.classList.remove('dark-mode')
    }
  }
  
  // 初始化
  updateElementClass()
  
  // 监听isDarkMode变化
  watch(isDarkMode, updateElementClass)
  
  return {
    isDark: isDarkMode
  }
} 