<!-- src/views/Report.vue -->
<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center py-4">
    <ReportView 
      v-if="hasReport"
      :result="reportData"
      :loading="loading"
      :error="error"
      :errorMessage="errorMessage" 
      :userInfo="userInfo"
      :colorSelection="colorSelection"
      @retry="retryAnalysis"
      @regenerate="navigateToColorTest"
      @cancel="navigateToColorTest"
    />
    
    <div v-else class="card shadow-sm">
      <div class="card-body text-center p-5">
        <div class="display-1 mb-4">📊</div>
        <p class="mb-4">请先进行个人色彩测试以生成您的专属分析报告</p>
        <button class="btn btn-primary btn-lg px-4" @click="navigateToColorTest">
          开始测试
          <i class="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ReportView from '../components/ColorTest/ReportView.vue'

const router = useRouter()
const hasReport = ref(false)
const reportData = ref(null)
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const userInfo = ref({})
const colorSelection = ref({})

// 从会话存储中获取报告数据
onMounted(() => {
  try {
    const savedReport = sessionStorage.getItem('colorReport')
    const savedColors = sessionStorage.getItem('colorSelection')
    const savedUserInfo = sessionStorage.getItem('userInfo')
    
    if (savedReport) {
      // 尝试解析JSON格式的报告
      try {
        // 删除可能的代码块标记
        const cleanContent = savedReport.replace(/```json|```/g, '').trim()
        reportData.value = JSON.parse(cleanContent)
      } catch (e) {
        console.warn('无法解析JSON报告，使用原始文本:', e)
        reportData.value = savedReport
      }
      
      hasReport.value = true
    }
    
    if (savedColors) {
      try {
        colorSelection.value = JSON.parse(savedColors)
      } catch (e) {
        console.error('无法解析颜色选择数据:', e)
      }
    }
    
    if (savedUserInfo) {
      try {
        userInfo.value = JSON.parse(savedUserInfo)
      } catch (e) {
        console.error('无法解析用户信息:', e)
      }
    }
  } catch (e) {
    console.error('无法获取保存的报告:', e)
  }
})

// 重试分析
const retryAnalysis = () => {
  navigateToColorTest()
}

// 导航到色彩测试页面
const navigateToColorTest = () => {
  router.push('/color-test')
}
</script>

<style scoped>
/* 移除单独的字体样式，使用全局样式 */
</style>