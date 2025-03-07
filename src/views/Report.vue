<!-- src/views/Report.vue -->
<template>
  <div class="report-page">
    <ReportView 
      v-if="hasReport"
      :result="reportData"
      :loading="loading"
      :error="error"
      :errorMessage="errorMessage" 
      @retry="retryAnalysis"
      @regenerate="navigateToColorTest"
      @cancel="navigateToColorTest"
    />
    
    <div v-else class="no-report">
      <div class="notice-icon">📊</div>
      <h2>暂无分析报告</h2>
      <p>请先进行个人色彩测试以生成您的专属分析报告</p>
      <button class="btn primary" @click="navigateToColorTest">
        开始测试
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ReportView from '../components/ColorTest/ReportView.vue'

const router = useRouter()
const hasReport = ref(false)
const reportData = ref('')
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')

// 从会话存储中获取报告数据
onMounted(() => {
  try {
    const savedReport = sessionStorage.getItem('colorReport')
    const savedColors = sessionStorage.getItem('colorSelection')
    
    if (savedReport) {
      reportData.value = savedReport
      hasReport.value = true
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
.report-page {
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.no-report {
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 3rem 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.notice-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

h2 {
  color: var(--color-text);
  margin-bottom: 1rem;
}

p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background-color: var(--color-primary);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .report-page {
    padding: 1rem;
  }
  
  .no-report {
    padding: 2rem 1.5rem;
  }
}
</style>