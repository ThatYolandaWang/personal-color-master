import { ref } from 'vue'

// 创建响应式的主题状态
export const isDarkMode = ref(false)

// 主题色彩变量
export const themeColors = {
  light: {
    // 莫兰迪色系
    primary: '#B5C7C9',    // 柔和的灰蓝色
    secondary: '#E6D5C9',  // 温柔的粉褐色
    accent: '#D3C0CD',     // 柔和的紫灰色
    background: '#F5F5F5', // 浅灰色背景
    surface: '#FFFFFF',    // 纯白色表面
    text: '#2C3E50',       // 深灰文字
    border: '#E8E8E8',     // 浅灰边框
    hover: '#A5B5B7',      // 悬停色
  },
  dark: {
    primary: '#7A8B8D',    // 深灰蓝色
    secondary: '#9E8A7E',  // 深褐色
    accent: '#8E7B88',     // 深紫灰色
    background: '#1A1A1A', // 深色背景
    surface: '#2C2C2C',    // 深灰表面
    text: '#E0E0E0',       // 浅灰文字
    border: '#3E3E3E',     // 深灰边框
    hover: '#5A6B6D',      // 深色悬停色
  }
}

// 切换主题
export function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
}

// 应用主题
export function applyTheme() {
  const theme = isDarkMode.value ? themeColors.dark : themeColors.light
  const root = document.documentElement
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  
  // 更新meta主题色
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.background)
  }
  
  // 保存主题偏好
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
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
} 