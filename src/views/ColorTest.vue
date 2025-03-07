<template>
  <div class="color-test">
    <div class="test-header">
      <h1>个人色彩测试</h1>
      <p class="description">请选择最接近您面部特征的颜色，我们将为您进行专业的色彩分析。</p>
    </div>

    <div class="test-content">
      <div class="mode-selection" v-if="!selectedMode">
        <div class="option manual" @click="selectMode('manual')">
          <h2>手动选择</h2>
          <p>手动选择最接近的肤色</p>
        </div>
        <div class="option auto" @click="selectMode('auto')">
          <h2>自动检测</h2>
          <p>上传照片自动分析</p>
        </div>
      </div>

      <div v-else class="test-area">
        <div class="back-button" @click="selectedMode = ''">
          <span>←</span> 返回选择
        </div>

        <div v-if="selectedMode === 'manual'" class="manual-selection">
          <div class="face-map-container">
            <FaceRegionMap />
          </div>
          <div class="color-picker-container">
            <ColorPickerPanel />
          </div>
        </div>

        <div v-if="selectedMode === 'auto'" class="auto-detection">
          <PhotoUpload />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ColorPickerPanel from '../components/ColorTest/ColorPickerPanel.vue'
import PhotoUpload from '../components/ColorTest/PhotoUpload.vue'
import FaceRegionMap from '../components/ColorTest/FaceRegionMap.vue'

const selectedMode = ref('')

const selectMode = (mode) => {
  selectedMode.value = mode
}
</script>

<style scoped>
.color-test {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.test-header {
  text-align: center;
  padding: 2rem 1rem;
}

h1 {
  color: var(--color-text);
  font-size: 2rem;
  margin-bottom: 1rem;
}

.description {
  color: var(--color-text);
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
}

.test-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mode-selection {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
}

.option {
  padding: 2rem;
  border-radius: var(--border-radius);
  background-color: var(--color-surface);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 200px;
}

.option:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.test-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  z-index: 1;
}

.back-button:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.manual-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 1rem;
}

.face-map-container {
  flex-shrink: 0;
  margin-bottom: 2rem;
}

.color-picker-container {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mode-selection {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .option {
    width: 100%;
    max-width: 300px;
  }

  .manual-selection {
    padding: 0.5rem;
  }
}

/* 适配大屏幕 */
@media (min-width: 1200px) {
  .manual-selection {
    flex-direction: row;
    gap: 2rem;
  }

  .face-map-container {
    margin-bottom: 0;
    width: 40%;
  }

  .color-picker-container {
    width: 60%;
  }
}
</style>
