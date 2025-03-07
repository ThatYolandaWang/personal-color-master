<template>
  <div class="analysis-result" v-if="result">
    <div class="result-content">
      <div class="loading-overlay" v-if="loading">
        <div class="spinner"></div>
        <p>正在分析您的个人色彩特征...</p>
      </div>
      
      <template v-else>
        <h2>个人色彩分析报告</h2>
        <div class="result-text" v-html="formattedResult"></div>
        
        <div class="actions">
          <button class="btn primary" @click="downloadReport">
            保存报告
          </button>
          <button class="btn secondary" @click="shareReport">
            分享报告
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps({
  result: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
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
    const element = document.querySelector('.result-content')
    const canvas = await html2canvas(element, {
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--color-surface')
    })
    
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
      const element = document.querySelector('.result-content')
      const canvas = await html2canvas(element)
      const blob = await new Promise(resolve => canvas.toBlob(resolve))
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
</script>

<style scoped>
.analysis-result {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.result-content {
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-surface);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

h2 {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  text-align: center;
}

.result-text {
  color: var(--color-text);
  line-height: 1.6;
}

.result-text h3 {
  margin: 1.5rem 0 1rem;
  color: var(--color-primary);
}

.result-text p {
  margin-bottom: 1rem;
}

.result-text li {
  margin-bottom: 0.5rem;
  list-style-type: none;
  padding-left: 1.5rem;
  position: relative;
}

.result-text li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn.primary {
  background-color: var(--color-primary);
  color: var(--color-surface);
}

.btn.secondary {
  background-color: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-content {
    padding: 1.5rem;
    width: 95%;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 