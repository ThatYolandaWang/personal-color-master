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
      
      <div class="result-content" v-if="isJsonResult">
        <div class="user-profile-card section">
          <div class="user-info">
            <div class="color-type-badge">{{ processedResult.colorType }}</div>
            <div class="user-details">
              <h3 class="section-title">色彩类型分析</h3>
              <p class="analysis-reason">{{ processedResult.analysisReason }}</p>
              <p class="user-summary">{{ processedResult.userProfile.summary }}</p>
            </div>
          </div>
          
          <!-- 用户基本信息 -->
          <div class="user-basic-info mt-4" v-if="hasUserInfo">
            <h4 class="subsection-title">个人信息</h4>
            <div class="user-info-grid">
              <div class="info-item" v-if="props.userInfo.nickname">
                <span class="info-label">昵称:</span>
                <span class="info-value">{{ props.userInfo.nickname }}</span>
              </div>
              <div class="info-item" v-if="props.userInfo.gender">
                <span class="info-label">性别:</span>
                <span class="info-value">{{ props.userInfo.gender }}</span>
              </div>
              <div class="info-item" v-if="props.userInfo.age">
                <span class="info-label">年龄:</span>
                <span class="info-value">{{ props.userInfo.age }}</span>
              </div>
              <div class="info-item" v-if="props.userInfo.occupation">
                <span class="info-label">职业:</span>
                <span class="info-value">{{ props.userInfo.occupation }}</span>
              </div>
            </div>
          </div>
          
          <!-- 色彩检测数据 -->
          <div class="color-detection-data mt-4" v-if="hasColorSelection">
            <h4 class="subsection-title">检测色彩数据</h4>
            <div class="detected-colors-grid">
              <div class="detected-color-item">
                <div class="color-dot" :style="{ backgroundColor: props.colorSelection.forehead }"></div>
                <span class="color-label">前额</span>
              </div>
              <div class="detected-color-item">
                <div class="color-dot" :style="{ backgroundColor: props.colorSelection.cheeks }"></div>
                <span class="color-label">脸颊</span>
              </div>
              <div class="detected-color-item">
                <div class="color-dot" :style="{ backgroundColor: props.colorSelection.neck }"></div>
                <span class="color-label">颈部</span>
              </div>
              <div class="detected-color-item">
                <div class="color-dot" :style="{ backgroundColor: props.colorSelection.lips }"></div>
                <span class="color-label">唇部</span>
              </div>
              <div class="detected-color-item">
                <div class="color-dot" :style="{ backgroundColor: props.colorSelection.hair }"></div>
                <span class="color-label">发色</span>
              </div>
              <div class="detected-color-item">
                <div class="color-dot" :style="{ backgroundColor: props.colorSelection.eyes }"></div>
                <span class="color-label">眼睛</span>
              </div>
            </div>
          </div>
          
          <div class="color-cards mt-4">
            <h4 class="subsection-title">推荐色板</h4>
            <div class="color-category">
              <h5>主要色彩</h5>
              <div class="color-chips">
                <div 
                  v-for="(color, index) in processedResult.colorCards.primary" 
                  :key="`primary-${index}`"
                  class="color-chip"
                  :style="{ backgroundColor: getColorCode(color) }"
                >
                  <span class="color-name">{{ getColorName(color) }}</span>
                </div>
              </div>
            </div>
            
            <div class="color-category">
              <h5>次要色彩</h5>
              <div class="color-chips">
                <div 
                  v-for="(color, index) in processedResult.colorCards.secondary" 
                  :key="`secondary-${index}`"
                  class="color-chip"
                  :style="{ backgroundColor: getColorCode(color) }"
                >
                  <span class="color-name">{{ getColorName(color) }}</span>
                </div>
              </div>
            </div>
            
            <div class="color-category">
              <h5>点缀色彩</h5>
              <div class="color-chips">
                <div 
                  v-for="(color, index) in processedResult.colorCards.accent" 
                  :key="`accent-${index}`"
                  class="color-chip"
                  :style="{ backgroundColor: getColorCode(color) }"
                >
                  <span class="color-name">{{ getColorName(color) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="recommendations-section section">
          <div class="tabs">
            <div 
              class="tab" 
              :class="{ active: activeTab === 'clothing' }" 
              @click="activeTab = 'clothing'"
            >
              服装搭配
            </div>
            <div 
              class="tab" 
              :class="{ active: activeTab === 'makeup' }" 
              @click="activeTab = 'makeup'"
            >
              妆容推荐
            </div>
            <div 
              class="tab" 
              :class="{ active: activeTab === 'hair' }" 
              @click="activeTab = 'hair'"
            >
              发色建议
            </div>
          </div>
          
          <div class="tab-content">
            <div v-if="activeTab === 'clothing'" class="tab-pane">
              <div class="recommendation-category">
                <h4 class="subsection-title">推荐色彩</h4>
                <div class="color-chips">
                  <div 
                    v-for="(color, index) in processedResult.clothing.recommended" 
                    :key="`clothing-${index}`"
                    class="color-chip"
                    :style="{ backgroundColor: getColorCode(color) }"
                  >
                    <span class="color-name">{{ getColorName(color) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="recommendation-category">
                <h4 class="subsection-title">推荐风格</h4>
                <ul class="style-list">
                  <li v-for="(style, index) in processedResult.clothing.styles" :key="`style-${index}`">
                    {{ style }}
                  </li>
                </ul>
              </div>
              
              <div class="recommendation-category">
                <h4 class="subsection-title">单品示例</h4>
                <ul class="example-list">
                  <li v-for="(example, index) in processedResult.clothing.examples" :key="`example-${index}`">
                    {{ example }}
                  </li>
                </ul>
              </div>
              
              <div class="recommendation-category" v-if="processedResult.celebrities">
                <h4 class="subsection-title">明星示例</h4>
                <div class="celebrities">
                  <span class="celebrity-tag" v-for="(celeb, index) in processedResult.celebrities" :key="`celeb-${index}`">
                    {{ celeb }}
                  </span>
                </div>
              </div>
            </div>
            
            <div v-if="activeTab === 'makeup'" class="tab-pane">
              <div class="recommendation-category">
                <h4 class="subsection-title">底妆推荐</h4>
                <p>{{ processedResult.makeup.foundation }}</p>
              </div>
              
              <div class="recommendation-category">
                <h4 class="subsection-title">唇色推荐</h4>
                <div class="color-chips">
                  <div 
                    v-for="(color, index) in processedResult.makeup.lipstick" 
                    :key="`lipstick-${index}`"
                    class="color-chip"
                    :style="{ backgroundColor: getColorCode(color) }"
                  >
                    <span class="color-name">{{ getColorName(color) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="recommendation-category">
                <h4 class="subsection-title">眼影推荐</h4>
                <div class="color-chips">
                  <div 
                    v-for="(color, index) in processedResult.makeup.eyeshadow" 
                    :key="`eyeshadow-${index}`"
                    class="color-chip"
                    :style="{ backgroundColor: getColorCode(color) }"
                  >
                    <span class="color-name">{{ getColorName(color) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="recommendation-category">
                <h4 class="subsection-title">腮红推荐</h4>
                <div class="color-chips">
                  <div 
                    v-for="(color, index) in processedResult.makeup.blush" 
                    :key="`blush-${index}`"
                    class="color-chip"
                    :style="{ backgroundColor: getColorCode(color) }"
                  >
                    <span class="color-name">{{ getColorName(color) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="activeTab === 'hair'" class="tab-pane">
              <div class="recommendation-category">
                <h4 class="subsection-title">推荐发色</h4>
                <div class="color-chips">
                  <div 
                    v-for="(color, index) in processedResult.hairColor.recommended" 
                    :key="`hairRec-${index}`"
                    class="color-chip hair-color-chip"
                    :style="{ backgroundColor: getColorCode(color) }"
                  >
                    <span class="color-name">{{ getColorName(color) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="recommendation-category">
                <h4 class="subsection-title">避免发色</h4>
                <div class="color-chips">
                  <div 
                    v-for="(color, index) in processedResult.hairColor.avoid" 
                    :key="`hairAvoid-${index}`"
                    class="color-chip hair-color-chip avoid"
                    :style="{ backgroundColor: getColorCode(color) }"
                  >
                    <span class="color-name">{{ getColorName(color) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="avoid-zone-section section">
          <h3 class="section-title">
            <i class="warning-icon">⚠️</i> 规避雷区
          </h3>
          
          <div class="avoid-categories">
            <div class="avoid-category">
              <h4 class="subsection-title">避免的服装色彩</h4>
              <div class="color-chips">
                <div 
                  v-for="(color, index) in processedResult.avoidZone.clothing" 
                  :key="`avoidClothing-${index}`"
                  class="color-chip avoid"
                  :style="{ backgroundColor: getColorCode(color) }"
                >
                  <span class="color-name">{{ getColorName(color) }}</span>
                </div>
              </div>
            </div>
            
            <div class="avoid-category">
              <h4 class="subsection-title">避免的妆容色彩</h4>
              <div class="color-chips">
                <div 
                  v-for="(color, index) in processedResult.avoidZone.makeup" 
                  :key="`avoidMakeup-${index}`"
                  class="color-chip avoid"
                  :style="{ backgroundColor: getColorCode(color) }"
                >
                  <span class="color-name">{{ getColorName(color) }}</span>
                </div>
              </div>
            </div>
            
            <div class="avoid-category">
              <h4 class="subsection-title">避免的风格</h4>
              <ul class="avoid-list">
                <li v-for="(style, index) in processedResult.avoidZone.styles" :key="`avoidStyle-${index}`">
                  {{ style }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="xiaohongshu-section section">
          <h3 class="section-title">个性化推荐</h3>
          <p class="placeholder-text">更多精彩内容敬请期待...</p>
        </div>
      </div>
      
      <div class="result-content" v-else v-html="formattedResult"></div>
      
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
    type: [String, Object],
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
  },
  userInfo: {
    type: Object,
    default: () => ({})
  },
  colorSelection: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['retry', 'regenerate', 'cancel'])

const resultContainer = ref(null)
const loadingProgress = ref(0)
const progressInterval = ref(null)
const activeTab = ref('clothing')

const isJsonResult = computed(() => {
  return typeof props.result === 'object' && props.result !== null
})

const processedResult = computed(() => {
  if (isJsonResult.value) {
    return props.result
  }
  
  if (typeof props.result === 'string' && props.result.trim()) {
    try {
      const cleanContent = props.result.replace(/```json|```/g, '').trim()
      return JSON.parse(cleanContent)
    } catch (e) {
      console.warn('无法解析结果为JSON:', e)
      return null
    }
  }
  
  return null
})

const formattedDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
})

const formattedResult = computed(() => {
  if (!props.result || typeof props.result !== 'string') return ''
  
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

function getColorCode(colorStr) {
  if (!colorStr) return '#CCCCCC'
  
  const hexMatch = colorStr.match(/#[0-9A-Fa-f]{6}\b/)
  if (hexMatch) {
    return hexMatch[0]
  }
  
  if (colorStr.toLowerCase().includes('红')) return '#FF5252'
  if (colorStr.toLowerCase().includes('蓝')) return '#4285F4'
  if (colorStr.toLowerCase().includes('绿')) return '#0F9D58'
  if (colorStr.toLowerCase().includes('黄')) return '#FFCA28'
  if (colorStr.toLowerCase().includes('紫')) return '#9C27B0'
  if (colorStr.toLowerCase().includes('粉')) return '#FF80AB'
  if (colorStr.toLowerCase().includes('橙')) return '#FF9800'
  if (colorStr.toLowerCase().includes('棕')) return '#795548'
  if (colorStr.toLowerCase().includes('黑')) return '#212121'
  if (colorStr.toLowerCase().includes('白')) return '#FFFFFF'
  if (colorStr.toLowerCase().includes('灰')) return '#9E9E9E'
  
  return '#CCCCCC'
}

function getColorName(colorStr) {
  if (!colorStr) return '未知'
  
  return colorStr.replace(/#[0-9A-Fa-f]{6}\b/, '').trim()
}

const downloadReport = async () => {
  try {
    const element = resultContainer.value
    
    const options = {
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--color-surface') || '#ffffff',
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
    
    const link = document.createElement('a')
    link.download = '个人色彩分析报告.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('保存报告失败:', error)
    alert('保存报告失败，请稍后重试')
  }
}

const shareReport = async () => {
  try {
    if (navigator.share) {
      const element = resultContainer.value
      
      const options = {
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface') || '#ffffff',
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

watch(() => props.loading, (newValue) => {
  if (newValue) {
    loadingProgress.value = 0
    clearInterval(progressInterval.value)
    
    progressInterval.value = setInterval(() => {
      if (loadingProgress.value < 90) {
        loadingProgress.value += 0.5
      }
    }, 150)
  } else {
    clearInterval(progressInterval.value)
    loadingProgress.value = 100
  }
})

onMounted(() => {
  return () => {
    clearInterval(progressInterval.value)
  }
})

const hasUserInfo = computed(() => {
  return props.userInfo && (props.userInfo.nickname || props.userInfo.gender || 
         props.userInfo.age || props.userInfo.occupation)
})

const hasColorSelection = computed(() => {
  return props.colorSelection && Object.keys(props.colorSelection).length > 0
})
</script>

<style scoped>
.report-view {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
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
  background-color: var(--color-background-soft, #f5f5f5);
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  position: sticky;
  top: 0;
  z-index: 10;
}

.result-content {
  color: var(--color, #333);
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
  border-top: 1px solid var(--color-border, #e0e0e0);
  background-color: var(--color-background-soft, #f5f5f5);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid var(--color-border, #e0e0e0);
  border-top-color: var(--color-primary, #1a73e8);
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
  color: var(--color-text, #333);
  margin-bottom: 0.5rem;
}

.loading-subtext {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #666);
  margin-bottom: 2rem;
}

.loading-progress {
  width: 80%;
  max-width: 400px;
  height: 6px;
  background-color: var(--color-border, #e0e0e0);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--color-primary, #1a73e8);
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
  color: var(--color-text, #333);
}

.error-container p {
  color: var(--color-text-secondary, #666);
  margin-bottom: 2rem;
  max-width: 500px;
}

.error-actions {
  display: flex;
  gap: 1rem;
}

.result-header h2 {
  text-align: center;
  color: var(--color-text, #333);
  margin-bottom: 0.5rem;
}

.result-meta {
  text-align: center;
  color: var(--color-text-secondary, #666);
  font-size: 0.9rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius, 4px);
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background-color: var(--color-primary, #1a73e8);
  color: white;
}

.btn.secondary {
  background-color: var(--color-background-soft, #f5f5f5);
  color: var(--color-text, #333);
}

.btn.outline {
  background-color: transparent;
  color: var(--color-text, #333);
  border: 1px solid var(--color-border, #e0e0e0);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn.outline:hover {
  background-color: var(--color-background-soft, #f5f5f5);
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.4rem;
  color: var(--color-primary, #1a73e8);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary, #1a73e8);
}

.subsection-title {
  font-size: 1.1rem;
  color: var(--color-text, #333);
  margin: 1.2rem 0 0.8rem;
}

.user-profile-card {
  display: flex;
  flex-direction: column;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.color-type-badge {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background-color: var(--color-primary, #1a73e8);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-bottom: 1rem;
}

.analysis-reason {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.user-summary {
  line-height: 1.6;
  color: var(--color-text-secondary, #666);
}

.color-cards {
  margin-top: 1.5rem;
}

.color-category {
  margin-bottom: 1.5rem;
}

.color-category h5 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary, #666);
}

.color-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.color-chip {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.color-chip:hover {
  transform: scale(1.05);
}

.color-chip.avoid {
  position: relative;
}

.color-chip.avoid::before {
  content: "×";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: red;
  font-weight: bold;
}

.color-name {
  font-size: 0.7rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 4px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.8rem 1.2rem;
  font-weight: 500;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab.active {
  color: var(--color-primary, #1a73e8);
  border-bottom-color: var(--color-primary, #1a73e8);
}

.tab:hover {
  color: var(--color-primary, #1a73e8);
}

.tab-content {
  min-height: 300px;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.recommendation-category {
  margin-bottom: 1.5rem;
}

.style-list, .example-list, .avoid-list {
  padding-left: 1.2rem;
  margin-bottom: 1rem;
}

.style-list li, .example-list li, .avoid-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.celebrities {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.celebrity-tag {
  background-color: var(--color-background-soft, #f5f5f5);
  color: var(--color-text, #333);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.warning-icon {
  color: #f5a623;
  margin-right: 0.5rem;
}

.avoid-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.hair-color-chip {
  background-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
}

.xiaohongshu-section {
  background-color: #fafafa;
  padding: 2rem;
  text-align: center;
}

.placeholder-text {
  color: var(--color-text-secondary, #666);
  font-style: italic;
}

.mt-4 {
  margin-top: 1.5rem;
}

/* 用户信息和色彩检测样式 */
.user-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: 500;
  margin-right: 0.5rem;
  min-width: 60px;
  color: var(--color-text-secondary, #666);
}

.info-value {
  color: var(--color-text, #333);
}

.detected-colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.detected-color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
}

.color-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 0.3rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-container {
    border-radius: 0;
    max-height: none;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .tab {
    flex: 1;
    text-align: center;
    padding: 0.6rem 0.4rem;
    font-size: 0.9rem;
  }
  
  .color-chips {
    justify-content: center;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .avoid-categories {
    grid-template-columns: 1fr;
  }
}
</style> 