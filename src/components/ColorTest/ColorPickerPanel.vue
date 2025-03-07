<template>
  <div class="color-picker-panel">
    <!-- 添加检测模式选择 -->
    <div class="detection-mode-switch">
      <button 
        :class="['mode-btn', { active: detectionMode === 'manual' }]" 
        @click="detectionMode = 'manual'"
      >
        手动选择
      </button>
      <button 
        :class="['mode-btn', { active: detectionMode === 'photo' }]" 
        @click="detectionMode = 'photo'"
      >
        照片检测
      </button>
    </div>

    <!-- 照片检测模式 -->
    <div v-if="detectionMode === 'photo'" class="photo-detection-container">
      <PhotoDetection @colorsDetected="applyDetectedColors" />
    </div>

    <!-- 手动选择模式 -->
    <div v-else class="color-pickers">
      <!-- 前额颜色选择 -->
      <div class="color-picker-item">
        <label>前额</label>
        <div class="picker-controls">
          <select v-model="colors.forehead" class="preset-select">
            <option value="">选择预设颜色</option>
            <optgroup label="浅色">
              <option value="#FFE4C4">象牙白</option>
              <option value="#FFE5B4">杏仁白</option>
              <option value="#FFDAB9">桃色</option>
            </optgroup>
            <optgroup label="中等">
              <option value="#DEB887">实木色</option>
              <option value="#D2B48C">褐棕色</option>
              <option value="#BC8F8F">玫瑰褐</option>
            </optgroup>
            <optgroup label="深色">
              <option value="#8B4513">马鞍棕</option>
              <option value="#A0522D">赭色</option>
              <option value="#6B4423">深褐</option>
            </optgroup>
          </select>
          <input type="color" v-model="colors.forehead" class="color-input" :title="colors.forehead">
        </div>
      </div>

      <!-- 脸颊颜色选择 -->
      <div class="color-picker-item">
        <label>脸颊</label>
        <div class="picker-controls">
          <select v-model="colors.cheeks" class="preset-select">
            <option value="">选择预设颜色</option>
            <optgroup label="浅色">
              <option value="#FFE4E1">浅玫瑰</option>
              <option value="#FFF0F5">淡紫红</option>
              <option value="#FFE4C4">象牙白</option>
            </optgroup>
            <optgroup label="中等">
              <option value="#DEB887">实木色</option>
              <option value="#D2B48C">褐棕色</option>
              <option value="#BC8F8F">玫瑰褐</option>
            </optgroup>
            <optgroup label="深色">
              <option value="#8B4513">马鞍棕</option>
              <option value="#A0522D">赭色</option>
              <option value="#6B4423">深褐</option>
            </optgroup>
          </select>
          <input type="color" v-model="colors.cheeks" class="color-input" :title="colors.cheeks">
        </div>
      </div>

      <!-- 颈部颜色选择 -->
      <div class="color-picker-item">
        <label>颈部</label>
        <div class="picker-controls">
          <select v-model="colors.neck" class="preset-select">
            <option value="">选择预设颜色</option>
            <optgroup label="浅色">
              <option value="#FFE4C4">象牙白</option>
              <option value="#FFDAB9">桃色</option>
              <option value="#F5DEB3">小麦色</option>
            </optgroup>
            <optgroup label="中等">
              <option value="#DEB887">实木色</option>
              <option value="#D2B48C">褐棕色</option>
              <option value="#BC8F8F">玫瑰褐</option>
            </optgroup>
            <optgroup label="深色">
              <option value="#8B4513">马鞍棕</option>
              <option value="#A0522D">赭色</option>
              <option value="#6B4423">深褐</option>
            </optgroup>
          </select>
          <input type="color" v-model="colors.neck" class="color-input" :title="colors.neck">
        </div>
      </div>

      <!-- 发色选择 -->
      <div class="color-picker-item">
        <label>发色</label>
        <div class="picker-controls">
          <select v-model="colors.hair" class="preset-select">
            <option value="">选择预设颜色</option>
            <optgroup label="黑色系">
              <option value="#000000">纯黑</option>
              <option value="#1C1C1C">碳黑</option>
              <option value="#2F4F4F">深灰</option>
            </optgroup>
            <optgroup label="棕色系">
              <option value="#8B4513">深棕</option>
              <option value="#A0522D">红棕</option>
              <option value="#6B4423">咖啡</option>
            </optgroup>
            <optgroup label="其他">
              <option value="#CD853F">栗色</option>
              <option value="#DEB887">浅棕</option>
              <option value="#D2691E">巧克力色</option>
            </optgroup>
          </select>
          <input type="color" v-model="colors.hair" class="color-input" :title="colors.hair">
        </div>
      </div>

      <!-- 瞳色选择 -->
      <div class="color-picker-item">
        <label>瞳色</label>
        <div class="picker-controls">
          <select v-model="colors.eyes" class="preset-select">
            <option value="">选择预设颜色</option>
            <optgroup label="黑色系">
              <option value="#000000">纯黑</option>
              <option value="#1C1C1C">碳黑</option>
              <option value="#2F4F4F">深灰</option>
            </optgroup>
            <optgroup label="棕色系">
              <option value="#8B4513">深棕</option>
              <option value="#A0522D">红棕</option>
              <option value="#6B4423">咖啡</option>
            </optgroup>
          </select>
          <input type="color" v-model="colors.eyes" class="color-input" :title="colors.eyes">
        </div>
      </div>

      <!-- 唇色选择 -->
      <div class="color-picker-item">
        <label>唇色</label>
        <div class="picker-controls">
          <select v-model="colors.lips" class="preset-select">
            <option value="">选择预设颜色</option>
            <optgroup label="粉色系">
              <option value="#FFB6C1">浅粉</option>
              <option value="#FF69B4">粉红</option>
              <option value="#DB7093">玫瑰粉</option>
            </optgroup>
            <optgroup label="红色系">
              <option value="#DC143C">鲜红</option>
              <option value="#CD5C5C">印度红</option>
              <option value="#B22222">深红</option>
            </optgroup>
            <optgroup label="其他">
              <option value="#FF8C69">珊瑚色</option>
              <option value="#C71585">紫红</option>
              <option value="#A52A2A">褐红</option>
            </optgroup>
          </select>
          <input type="color" v-model="colors.lips" class="color-input" :title="colors.lips">
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn primary" @click="submitColors" :disabled="loading">
        {{ loading ? '分析中...' : '开始分析' }}
      </button>
    </div>

    <AnalysisResult
      v-if="analysisResult || loading"
      :result="analysisResult"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { analyzeColors } from '../../services/deepseek'
import AnalysisResult from './AnalysisResult.vue'
import PhotoDetection from './PhotoDetection.vue'

// 接收外部传入的初始模式
const props = defineProps({
  initialMode: {
    type: String,
    default: 'manual', // 默认为手动模式
    validator: (value) => ['manual', 'photo'].includes(value)
  }
})

// 检测模式：manual = 手动选择, photo = 照片检测
const detectionMode = ref(props.initialMode)

const colors = ref({
  forehead: '#FFE4C4', // 默认颜色：象牙白
  cheeks: '#FFE4E1',   // 默认颜色：浅玫瑰
  neck: '#F5DEB3',     // 默认颜色：小麦色
  hair: '#1C1C1C',     // 默认颜色：碳黑
  eyes: '#2F4F4F',     // 默认颜色：深灰
  lips: '#DB7093'      // 默认颜色：玫瑰粉
})

const loading = ref(false)
const analysisResult = ref('')

// 应用从照片检测获取的颜色
const applyDetectedColors = (detectedColors) => {
  // 将检测到的颜色应用到表单
  colors.value.forehead = detectedColors.forehead || colors.value.forehead
  colors.value.cheeks = detectedColors.cheeks || colors.value.cheeks
  colors.value.neck = detectedColors.neck || colors.value.neck
  colors.value.hair = detectedColors.hair || colors.value.hair
  colors.value.lips = detectedColors.lips || colors.value.lips
  
  // 自动切换到手动模式以便查看和微调结果
  detectionMode.value = 'manual'
}

const submitColors = async () => {
  // 验证所有颜色是否都已选择
  const allSelected = Object.values(colors.value).every(color => color)
  if (!allSelected) {
    alert('请选择所有区域的颜色')
    return
  }
  
  try {
    loading.value = true
    const result = await analyzeColors(colors.value)
    analysisResult.value = result
  } catch (error) {
    console.error('颜色分析失败:', error)
    alert('分析失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.color-picker-panel {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

/* 检测模式切换 */
.detection-mode-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.mode-btn {
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s;
}

.mode-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.photo-detection-container {
  margin-bottom: 2rem;
}

.color-pickers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.color-picker-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.picker-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

label {
  font-weight: 500;
  color: var(--color-text);
}

.preset-select {
  flex: 1;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
}

.color-input {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: var(--border-radius);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .color-pickers {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .color-picker-item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .picker-controls {
    flex: 1;
    max-width: 200px;
  }
}
</style>
