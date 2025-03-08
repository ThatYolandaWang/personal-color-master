<template>
  <div class="color-picker-panel">
    <!-- 仅使用照片检测模式 -->
    <div v-if="!showReport" class="photo-detection-container">
      <PhotoDetection @colorsDetected="applyDetectedColors" ref="photoDetection" />
    </div>

    <div v-if="!showReport" class="actions">
      <button class="btn primary" @click="submitColors" :disabled="loading">
        {{ loading ? '分析中...' : '开始分析' }}
      </button>
    </div>

    <!-- 报告视图组件 -->
    <ReportView 
      v-if="showReport"
      :result="analysisResult"
      :loading="loading"
      :error="analysisError"
      :errorMessage="errorMessage"
      @retry="retryAnalysis"
      @regenerate="regenerateAnalysis"
      @cancel="cancelReport"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { analyzeColors } from '../../services/deepseek'
import ReportView from './ReportView.vue'
import PhotoDetection from './PhotoDetection.vue'

// 路由
const router = useRouter()

// 颜色数据
const colors = ref({
  forehead: '#FFE4C4', // 默认颜色：象牙白
  cheeks: '#FFE4E1',   // 默认颜色：浅玫瑰
  neck: '#F5DEB3',     // 默认颜色：小麦色
  hair: '#1C1C1C',     // 默认颜色：碳黑
  eyes: '#2F4F4F',     // 默认颜色：深灰
  lips: '#DB7093'      // 默认颜色：玫瑰粉
})

// 分析和报告状态
const loading = ref(false)
const analysisResult = ref('')
const showReport = ref(false)
const analysisError = ref(false)
const errorMessage = ref('')
const requestTimeout = ref(null)
const photoDetection = ref(null)

// 从会话存储加载已保存的颜色数据
onMounted(() => {
  try {
    const savedColors = sessionStorage.getItem('colorSelection')
    if (savedColors) {
      colors.value = JSON.parse(savedColors)
    }
  } catch (e) {
    console.error('无法加载保存的颜色数据:', e)
  }
})

// 应用从照片检测获取的颜色
const applyDetectedColors = (detectedColors) => {
  // 将检测到的颜色应用到表单
  colors.value.forehead = detectedColors.forehead || colors.value.forehead
  colors.value.cheeks = detectedColors.cheeks || colors.value.cheeks
  colors.value.neck = detectedColors.neck || colors.value.neck
  colors.value.lips = detectedColors.lips || colors.value.lips
  colors.value.hair = detectedColors.hair || colors.value.hair
  
  // 保存颜色数据到会话存储
  saveColorSelection()
}

// 保存颜色选择到会话存储
const saveColorSelection = () => {
  try {
    sessionStorage.setItem('colorSelection', JSON.stringify(colors.value))
  } catch (e) {
    console.error('无法保存颜色数据:', e)
  }
}

// 保存报告数据到会话存储
const saveReportData = (report) => {
  try {
    sessionStorage.setItem('colorReport', report)
  } catch (e) {
    console.error('无法保存报告数据:', e)
  }
}

// 提交颜色进行分析
const submitColors = async () => {
  // 验证所有颜色是否都已选择
  const allSelected = Object.values(colors.value).every(color => color)
  if (!allSelected) {
    alert('请选择所有区域的颜色')
    return
  }
  
  // 保存颜色选择
  saveColorSelection()
  
  // 重置状态
  analysisResult.value = ''
  analysisError.value = false
  errorMessage.value = ''
  showReport.value = true
  loading.value = true
  
  // 设置请求超时（60秒）
  clearTimeout(requestTimeout.value)
  requestTimeout.value = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      analysisError.value = true
      errorMessage.value = '请求超时，请检查网络连接后重试。'
    }
  }, 60000)
  
  try {
    const result = await analyzeColors(colors.value)
    analysisResult.value = result
    analysisError.value = false
    
    // 保存报告数据
    saveReportData(result)
    
    // 始终导航到报告页面
    router.push('/report')
  } catch (error) {
    console.error('颜色分析失败:', error)
    analysisError.value = true
    errorMessage.value = error.message || '分析失败，请稍后重试'
  } finally {
    loading.value = false
    clearTimeout(requestTimeout.value)
  }
}

// 重试分析（当发生错误时）
const retryAnalysis = () => {
  submitColors()
}

// 重新生成分析（当已经有结果时）
const regenerateAnalysis = () => {
  submitColors()
}

// 取消报告显示，返回颜色选择
const cancelReport = () => {
  showReport.value = false
  loading.value = false
  clearTimeout(requestTimeout.value)
}
</script>

<style scoped>
.color-picker-panel {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.photo-detection-container {
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-size: 1.1rem;
}

.btn.primary {
  background-color: var(--color-primary);
  color: var(--color-surface);
}

.btn.primary:hover {
  background-color: var(--color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .actions {
    margin-top: 1rem;
  }
}
</style>
