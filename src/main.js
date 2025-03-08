import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'

// 引入Bootstrap
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
// 引入Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

// 引入主题初始化函数
import { initTheme } from './utils/theme'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)

// 初始化主题
initTheme()

app.mount('#app')
