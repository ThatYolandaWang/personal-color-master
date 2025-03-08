<template>
  <div class="report-view">
    <div class="loading-container" v-if="loading">
      <div class="spinner"></div>
      <p class="loading-text">正在分析您的个人色彩特征...</p>
      <p class="loading-subtext">这可能需要一点时间，请耐心等待</p>
      <div class="loading-progress">
        <div class="progress-bar" :style="{ width: `${loadingProgress}%` }"></div>
      </div>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <h3>分析失败</h3>
      <p>{{ errorMessage }}</p>
      <div class="error-actions">
        <button class="btn primary" @click="$emit('retry')">
          重新生成
        </button>
        <button class="btn secondary" @click="$emit('cancel')">
          返回
        </button>
      </div>
    </div>
    
    <div v-else-if="result" class="result-container" ref="resultContainer">
      <div class="result-header">
        <h2>个人色彩分析报告</h2>
        <div class="result-meta">
          <span>生成时间: {{ formattedDate }}</span>
        </div>
      </div>
      
      <div class="result-content" v-html="formattedResult"></div>
      
      <div class="actions">
        <button class="btn primary" @click="downloadReport">
          保存报告
        </button>
        <button class="btn secondary" @click="shareReport">
          分享报告
        </button>
        <button class="btn outline" @click="$emit('regenerate')">
          重新生成
        </button>
        <button class="btn outline" @click="$emit('cancel')">
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps({
  result: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: '分析过程中发生错误，请稍后重试。'
  }
})

const emit = defineEmits(['retry', 'regenerate', 'cancel'])

const resultContainer = ref(null)
const loadingProgress = ref(0)
const progressInterval = ref(null)

// 格式化生成时间
const formattedDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
})

// 格式化分析结果，将文本转换为HTML
const formattedResult = computed(() => {
  if (!props.result) return ''
  
  return props.result
    .split('\n')
    .map(line => {
      if (line.startsWith('#')) {
        return `<h3>${line.replace('#', '')}</h3>`
      }
      if (line.startsWith('-')) {
        return `<li>${line.replace('-', '')}</li>`
      }
      if (line.trim() === '') {
        return '<br>'
      }
      return `<p>${line}</p>`
    })
    .join('')
})

// 下载报告为图片
const downloadReport = async () => {
  try {
    const element = resultContainer.value
    
    // 设置截图选项，确保捕获完整内容
    const options = {
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--color-surface'),
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      scale: 2, // 提高分辨率
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // 确保克隆的元素显示全部内容
        const clonedElement = clonedDoc.querySelector('.result-container')
        if (clonedElement) {
          clonedElement.style.maxHeight = 'none'
          clonedElement.style.overflow = 'visible'
        }
      }
    }
    
    const canvas = await html2canvas(element, options)
    
    const link = document.createElement('a')
    link.download = '个人色彩分析报告.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('保存报告失败:', error)
    alert('保存报告失败，请稍后重试')
  }
}

// 分享报告
const shareReport = async () => {
  try {
    if (navigator.share) {
      const element = resultContainer.value
      
      // 设置相同的截图选项
      const options = {
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface'),
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.result-container')
          if (clonedElement) {
            clonedElement.style.maxHeight = 'none'
            clonedElement.style.overflow = 'visible'
          }
        }
      }
      
      const canvas = await html2canvas(element, options)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], '个人色彩分析报告.png', { type: 'image/png' })
      
      await navigator.share({
        title: '个人色彩分析报告',
        text: '这是我的个人色彩分析报告，快来看看吧！',
        files: [file]
      })
    } else {
      alert('您的浏览器不支持分享功能')
    }
  } catch (error) {
    console.error('分享报告失败:', error)
    alert('分享失败，请稍后重试')
  }
}

// 监视loading状态变化，控制进度条
watch(() => props.loading, (newValue) => {
  if (newValue) {
    // 重置并启动进度条
    loadingProgress.value = 0
    clearInterval(progressInterval.value)
    
    // 模拟进度增长，总时间约为30秒
    progressInterval.value = setInterval(() => {
      if (loadingProgress.value < 90) {
        // 前90%的进度在30秒内完成
        loadingProgress.value += 0.5
      }
    }, 150)
  } else {
    // 停止进度条并重置
    clearInterval(progressInterval.value)
    loadingProgress.value = 100
  }
})

// 组件卸载时清除定时器
onMounted(() => {
  return () => {
    clearInterval(progressInterval.value)
  }
})
</script>

<style scoped>
.report-view {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.loading-container,
.error-container {
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.result-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh;
  overflow: hidden;
}

.result-header {
  background-color: var(--color-background-soft);
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.result-content {
  color: var(--color-text);
  line-height: 1.6;
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  max-height: calc(80vh - 180px);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 0;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
  margin-bottom: 2rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.loading-subtext {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.loading-progress {
  width: 80%;
  max-width: 400px;
  height: 6px;
  background-color: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.error-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f44336;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.error-container h3 {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.error-container p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  max-width: 500px;
}

.error-actions {
  display: flex;
  gap: 1rem;
}

.result-header h2 {
  text-align: center;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.result-meta {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.result-content h3 {
  margin: 1.5rem 0 1rem;
  color: var(--color-primary);
  font-size: 1.3rem;
}

.result-content p {
  margin-bottom: 1rem;
}

.result-content li {
  margin-bottom: 0.5rem;
  list-style-type: none;
  padding-left: 1.5rem;
  position: relative;
}

.result-content li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.btn {
  padding: 0.8rem 1.5rem;
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

.btn.secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.btn.outline {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn.outline:hover {
  background-color: var(--color-background-soft);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-container {
    border-radius: 0;
    max-height: none;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 