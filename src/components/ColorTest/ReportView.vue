<template>
  <div class="container mb-5" style="height: 100%;">
    <!-- 加载状态 -->
    <div class="d-flex flex-column justify-content-center align-items-center py-5" v-if="loading">
      <div class="spinner-border text-primary mb-4" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
      <p class="h5">正在分析您的个人色彩特征...</p>
      <p class="text-muted">这可能需要一点时间，请耐心等待</p>
      <div class="progress w-75 mt-3">
        <div class="progress-bar" :style="{ width: `${loadingProgress}%` }"></div>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="d-flex flex-column justify-content-center align-items-center py-5">
      <div class="display-1 text-danger mb-3">!</div>
      <h3 class="mb-3">分析失败</h3>
      <p class="mb-4">{{ errorMessage }}</p>
      <div class="d-flex gap-3">
        <button class="btn btn-primary" @click="$emit('retry')">重新生成</button>
        <button class="btn btn-secondary" @click="$emit('cancel')">返回</button>
      </div>
    </div>
    
    <!-- 报告内容 -->
    <div v-else-if="result" ref="resultContainer" class="pt-5 mt-4 report-content">
      <!-- 报告头部 -->
      <header class="text-center mb-4 pt-3">
        <div class="d-flex justify-content-center align-items-center mb-2">
          <img src="@/assets/logo.png" alt="个人色彩管家" class="report-logo me-2" />
        </div>
        <div class="text-primary fs-6 mb-2">为您定制 / MAKE-UP FOR THE</div>
        <h1 class="h2 fw-bold mb-2">{{ processedResult.colorType }}</h1>
        <div class="fs-5 letter-spacing-2">{{ getSeasonTraits(processedResult.colorType) }}</div>
      </header>

      <div class="row g-4 mb-4">
        <div class="col-md-8">
          <!-- 用户信息 -->
          <section class="mb-4" v-if="hasUserInfo">
            <h2 class="h4 border-bottom pb-2 mb-3">个人信息 / PERSONAL INFO</h2>
            <div class="row g-3">
              <div class="col-md-6" v-if="props.userInfo.nickname">
                <span class="fw-medium me-2">昵称:</span>
                <span>{{ props.userInfo.nickname }}</span>
              </div>
              <div class="col-md-6" v-if="props.userInfo.gender">
                <span class="fw-medium me-2">性别:</span>
                <span>{{ props.userInfo.gender }}</span>
              </div>
              <div class="col-md-6" v-if="props.userInfo.age">
                <span class="fw-medium me-2">年龄:</span>
                <span>{{ props.userInfo.age }}</span>
              </div>
              <div class="col-md-6" v-if="props.userInfo.occupation">
                <span class="fw-medium me-2">职业:</span>
                <span>{{ props.userInfo.occupation }}</span>
              </div>
            </div>
          </section>

          <!-- 检测色彩数据 -->
          <section class="mb-4" v-if="hasColorSelection">
            <h2 class="h4 border-bottom pb-2 mb-3">检测色彩数据 / DETECTED COLORS</h2>
            <div class="row g-3">
              <div class="col-4 col-md-2 text-center" v-for="(colorKey, label) in {
                '前额 / Forehead': 'forehead',
                '脸颊 / Cheeks': 'cheeks',
                '颈部 / Neck': 'neck',
                '唇部 / Lips': 'lips',
                '发色 / Hair': 'hair',
                '眼睛 / Eyes': 'eyes'
              }">
                <div class="rounded-circle mx-auto mb-2 shadow-sm" 
                     style="width: 40px; height: 40px; border: 1px solid rgba(0,0,0,0.1)"
                     :style="{ backgroundColor: props.colorSelection[colorKey] }"></div>
                <span class="small text-secondary">{{ label }}</span>
              </div>
            </div>
          </section>

          <!-- 色彩分析 -->
          <section class="mb-4">
            <h2 class="h4 border-bottom pb-2 mb-3">色彩特征分析 / COLOR ANALYSIS</h2>
            <p class="mb-3">{{ processedResult.analysisReason }}</p>
            <p v-if="processedResult.userProfile && processedResult.userProfile.summary">
              {{ processedResult.userProfile.summary }}
            </p>
          </section>

          <!-- 色彩调色板 -->
          <section class="mb-4">
            <h2 class="h4 border-bottom pb-2 mb-3">推荐色彩调色板 / COLOUR PALETTE</h2>
            <div class="d-flex flex-wrap gap-1">
              <div v-for="(color, index) in processedResult.colorCards.primary" 
                   :key="`palette-${index}`"
                   class="d-inline-block"
                   style="aspect-ratio: 1; width: 25px"
                   :style="{ backgroundColor: getColorCode(color) }">
              </div>
            </div>
          </section>
        </div>

        <div class="col-md-4">
          <!-- 色彩维度 -->
          <section class="mb-4">
            <h2 class="h4 border-bottom pb-2 mb-3">色彩维度 / COLOUR DIMENSIONS</h2>
            
            <div class="mb-4">
              <div class="mb-2 fw-medium">色相 / HUE</div>
              <div class="position-relative mb-3" style="height: 2px; background-color: #ddd;">
                <div class="position-absolute" 
                     style="width: 12px; height: 12px; background-color: #000; border-radius: 50%; top: 50%; transform: translate(-50%, -50%)"
                     :style="getHuePosition()"></div>
              </div>
              <div class="d-flex justify-content-between small text-secondary">
                <span>冷色调 / cool</span>
                <span>暖色调 / warm</span>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="mb-2 fw-medium">明度 / VALUE</div>
              <div class="position-relative mb-3" style="height: 2px; background-color: #ddd;">
                <div class="position-absolute" 
                     style="width: 12px; height: 12px; background-color: #000; border-radius: 50%; top: 50%; transform: translate(-50%, -50%)"
                     :style="getValuePosition()"></div>
              </div>
              <div class="d-flex justify-content-between small text-secondary">
                <span>浅色 / light</span>
                <span>深色 / dark</span>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="mb-2 fw-medium">饱和度 / CHROMA</div>
              <div class="position-relative mb-3" style="height: 2px; background-color: #ddd;">
                <div class="position-absolute" 
                     style="width: 12px; height: 12px; background-color: #000; border-radius: 50%; top: 50%; transform: translate(-50%, -50%)"
                     :style="getChromaPosition()"></div>
              </div>
              <div class="d-flex justify-content-between small text-secondary">
                <span>柔和 / soft</span>
                <span>鲜艳 / bright</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <!-- 妆容推荐 -->
      <section class="mb-4">
        <h2 class="h4 border-bottom pb-2 mb-3">底妆推荐 / COMPLEXION MAKE-UP</h2>
        <p class="fst-italic text-secondary mb-3 small">应与肤色相匹配，选择哑光或自然的质地 / must be skin-matched; choose matte or natural finishes</p>
        
        <div class="mb-4">
          <h3 class="h5 mb-3">粉底与遮瑕 / Foundation & Concealers</h3>
          <div class="d-flex flex-wrap gap-4 mb-3">
            <div v-for="(color, index) in processedResult.makeup.foundation || []" 
                 :key="`foundation-${index}`"
                 class="text-center">
              <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                   :style="{ backgroundColor: getColorCode(color) }"></div>
              <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
            </div>
          </div>
          <p v-if="typeof processedResult.makeup.foundation === 'string'">
            {{ processedResult.makeup.foundation }}
          </p>
        </div>
      </section>

      <!-- 眼妆 -->
      <section class="mb-4">
        <h2 class="h4 border-bottom pb-2 mb-3">眼妆推荐 / EYE MAKE-UP</h2>
        <p class="fst-italic text-secondary mb-3 small">选择冰冷或鲜艳的色彩，避免过于温暖和柔和的色调 / choose icy or bright colours; avoid overly warm & soft colours</p>
        
        <div class="row g-4">
          <div class="col-md-4">
            <h3 class="h5 mb-2">眼影 / Eyeshadow</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.makeup.eyeshadow || []" 
                   :key="`eyeshadow-${index}`"
                   class="text-center">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }"></div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <h3 class="h5 mb-2">眼线 / Eyeliner</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.makeup.eyeliner || processedResult.makeup.liner || []" 
                   :key="`eyeliner-${index}`"
                   class="text-center">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }"></div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <h3 class="h5 mb-2">睫毛膏 / Mascara</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.makeup.mascara || []" 
                   :key="`mascara-${index}`"
                   class="text-center">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }"></div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 唇妆和腮红 -->
      <section class="mb-4">
        <h2 class="h4 border-bottom pb-2 mb-3">唇部与腮红推荐 / LIP & CHEEK MAKE-UP</h2>
        <p class="fst-italic text-secondary mb-3 small">光泽感、丝缎感或微亮质地，避免裸色和橙色调 / gloss, satin, or lustre; avoid nude & orange-based colours</p>
        
        <div class="row g-4">
          <div class="col-md-6">
            <h3 class="h5 mb-2">腮红 / Blush</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.makeup.blush || []" 
                   :key="`blush-${index}`"
                   class="text-center">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }"></div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <h3 class="h5 mb-2">唇膏 / Lipstick</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.makeup.lipstick || []" 
                   :key="`lipstick-${index}`"
                   class="text-center">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }"></div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 服装推荐 -->
      <section class="mb-4" v-if="processedResult.clothing">
        <h2 class="h4 border-bottom pb-2 mb-3">服装推荐 / CLOTHING RECOMMENDATIONS</h2>
        <p class="fst-italic text-secondary mb-3 small">{{ getClothingGuidance(processedResult.colorType) }}</p>
        
        <div class="row g-4">
          <div class="col-md-6">
            <h3 class="h5 mb-2">推荐色彩 / Recommended Colors</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.clothing.recommended || []" 
                   :key="`clothing-${index}`"
                   class="text-center">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }"></div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <h3 class="h5 mb-2">建议风格 / Recommended Styles</h3>
            <ul class="ps-4">
              <li v-for="(style, index) in processedResult.clothing.styles || []" 
                  :key="`style-${index}`"
                  class="mb-2">
                {{ style }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 发色推荐 -->
      <section class="mb-4" v-if="processedResult.hairColor">
        <h2 class="h4 border-bottom pb-2 mb-3">发色推荐 / HAIR COLOR RECOMMENDATIONS</h2>
        <p class="fst-italic text-secondary mb-3 small">{{ getHairGuidance(processedResult.colorType) }}</p>
        
        <div class="row g-4">
          <div class="col-md-6">
            <h3 class="h5 mb-2">推荐发色 / Recommended Hair Colors</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.hairColor.recommended || []" 
                   :key="`hair-${index}`"
                   class="text-center">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }"></div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <h3 class="h5 mb-2">避免发色 / Hair Colors to Avoid</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.hairColor.avoid || []" 
                   :key="`avoid-hair-${index}`"
                   class="text-center position-relative">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }">
                  <div class="position-absolute top-50 start-50 translate-middle text-danger fw-bold fs-3">×</div>
                </div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 规避雷区 -->
      <section class="mb-4" v-if="processedResult.avoidZone">
        <h2 class="h4 border-bottom pb-2 mb-3">规避雷区 / COLORS TO AVOID</h2>
        <p class="fst-italic text-secondary mb-3 small">以下色彩和风格可能会削弱您的自然魅力 / These colors may diminish your natural attributes</p>
        
        <div class="row g-4">
          <div class="col-md-4">
            <h3 class="h5 mb-2">避免的色彩 / Colors to Avoid</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.avoidZone.clothing || []" 
                   :key="`avoid-${index}`"
                   class="text-center position-relative">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }">
                  <div class="position-absolute top-50 start-50 translate-middle text-danger fw-bold fs-3">×</div>
                </div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4" v-if="processedResult.avoidZone.makeup && processedResult.avoidZone.makeup.length">
            <h3 class="h5 mb-2">避免的妆容色彩 / Makeup Colors to Avoid</h3>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="(color, index) in processedResult.avoidZone.makeup" 
                   :key="`avoid-makeup-${index}`"
                   class="text-center position-relative">
                <div style="width: 60px; height: 40px; margin-bottom: 0.5rem;" 
                     :style="{ backgroundColor: getColorCode(color) }">
                  <div class="position-absolute top-50 start-50 translate-middle text-danger fw-bold fs-3">×</div>
                </div>
                <div class="small text-secondary" style="max-width: 80px;">{{ getColorName(color) }}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4" v-if="processedResult.avoidZone.styles && processedResult.avoidZone.styles.length">
            <h3 class="h5 mb-2">避免的风格 / Styles to Avoid</h3>
            <ul class="ps-4">
              <li v-for="(style, index) in processedResult.avoidZone.styles" 
                  :key="`avoid-style-${index}`"
                  class="mb-2">
                {{ style }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 底部操作栏 -->
      <div class="d-flex justify-content-center gap-3 my-4 pt-3 border-top">
        <button class="btn btn-primary" @click="downloadReport">保存报告</button>
        <button class="btn btn-secondary" @click="shareReport">分享报告</button>
        <button class="btn btn-outline-secondary" @click="$emit('regenerate')">重新生成</button>
      </div>

      <footer class="text-center text-secondary small mt-4 pt-3 border-top">
        <div>© {{ new Date().getFullYear() }} 个人色彩管家 / Personal Color Master</div>
        <div>生成时间: {{ formattedDate }}</div>
      </footer>

      <!-- 返回顶部按钮 -->
      <button 
        class="btn rounded-circle back-to-top" 
        @click="scrollToTop"
        v-show="showBackToTop"
      >
        <i class="bi bi-arrow-up"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 确保按钮字体统一 */
.btn {
  font-family: var(--font-family-base) !important;
}

/* 保留少量必要的自定义样式 */
.letter-spacing-2 {
  letter-spacing: 0.2em;
}

/* 设置报告Logo样式 */
.report-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

/* 不再需要单独的返回顶部按钮样式，使用全局样式 */
</style>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

// 返回顶部相关
const showBackToTop = ref(false)

// 监听滚动事件，控制返回顶部按钮显示
const handleScroll = () => {
  if (window.scrollY > 300) {
    showBackToTop.value = true
  } else {
    showBackToTop.value = false
  }
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 确保有足够的空间显示标题
onMounted(() => {
  // 确保滚动到顶部
  if (resultContainer.value) {
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (resultContainer.value.parentElement) {
        resultContainer.value.parentElement.scrollTop = 0;
      }
    }, 200);
  }
  
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
  
  return () => {
    clearInterval(progressInterval.value)
  }
})

onUnmounted(() => {
  // 移除滚动事件监听
  window.removeEventListener('scroll', handleScroll)
})

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
      backgroundColor: '#ffffff',
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
        backgroundColor: '#ffffff',
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

// 获取服装指导建议
function getClothingGuidance(colorType) {
  if (!colorType) return '选择高对比度、纯净色彩；避免柔和或灰暗色调';
  
  if (colorType.includes('冬季') || colorType.includes('明亮')) {
    return '选择高对比度、纯净色彩；避免柔和或灰暗色调';
  } else if (colorType.includes('夏季') || colorType.includes('柔和')) {
    return '选择柔和、带灰度的色彩；避免过于鲜艳或强烈对比的色调';
  } else if (colorType.includes('春季') || colorType.includes('清新')) {
    return '选择明亮、温暖的色彩；避免过于深沉或冷调的色彩';
  } else if (colorType.includes('秋季') || colorType.includes('深沉')) {
    return '选择温暖、带土黄色调的色彩；避免过于鲜艳或冷调的色彩';
  }
  
  return '选择与您的色彩季型和谐的色彩，避免与您的自然特质不协调的色调';
}

// 获取发色指导建议
function getHairGuidance(colorType) {
  if (!colorType) return '选择与您的自然肤色和眼睛相协调的发色，增强您的整体和谐感';
  
  if (colorType.includes('冬季')) {
    return '选择纯净、无黄的深色调；冷调黑色、铂金或冰棕色都是理想选择';
  } else if (colorType.includes('夏季')) {
    return '选择带灰度的柔和色调；灰棕色、灰金色或浅灰调都能展现您的优势';
  } else if (colorType.includes('春季')) {
    return '选择温暖明亮的色调；金色、蜜糖色或温暖的栗色都能衬托您的特质';
  } else if (colorType.includes('秋季')) {
    return '选择富有深度的温暖色调；赤铜色、栗色或深金色都能展现您的魅力';
  }
  
  return '选择与您的色彩季型和谐的发色，避免与您的自然特质不协调的色调';
}

// 根据色彩类型获取季节特征描述
function getSeasonTraits(colorType) {
  if (!colorType) return '未知色彩特征';
  
  const traits = {
    '冬季': '鲜艳 + 冷色调',
    '夏季': '柔和 + 冷色调',
    '春季': '鲜艳 + 温色调',
    '秋季': '柔和 + 温色调',
    '明亮冬季': '高对比度 + 鲜艳 + 冷色调',
    '明亮春季': '高对比度 + 鲜艳 + 温色调',
    '柔和夏季': '低对比度 + 柔和 + 冷色调',
    '柔和秋季': '低对比度 + 柔和 + 温色调',
    '清新春季': '明亮 + 温色调',
    '清爽夏季': '明亮 + 冷色调',
    '深沉秋季': '深沉 + 温色调',
    '深邃冬季': '深沉 + 冷色调'
  };
  
  // 遍历traits对象查找匹配的特征
  for (const season in traits) {
    if (colorType.includes(season)) {
      return traits[season];
    }
  }
  
  return '个性化色彩特征';
}

// 获取色彩维度位置
function getHuePosition() {
  return {
    left: '20%' // 根据实际色彩特征调整
  }
}

function getValuePosition() {
  return {
    left: '60%' // 根据实际色彩特征调整
  }
}

function getChromaPosition() {
  return {
    left: '80%' // 根据实际色彩特征调整
  }
}
</script> 