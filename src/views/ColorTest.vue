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
          <h2>照片检测</h2>
          <p>上传照片自动分析肤色</p>
        </div>
      </div>

      <div v-else class="test-area">
        <div class="settings">
          <div class="setting-item">
            <label class="toggle">
              <input type="checkbox" v-model="showReportPage">
              <span class="toggle-slider"></span>
              <span class="toggle-text">分析完成后显示独立报告页面</span>
            </label>
          </div>
        </div>

        <div class="test-container">
          <div class="face-map-container" v-if="selectedMode === 'manual'">
            <FaceRegionMap />
          </div>
          <div class="color-picker-container">
            <ColorPickerPanel
              :initialMode="selectedMode === 'auto' ? 'photo' : 'manual'"
              :navigateToReport="showReportPage"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ColorPickerPanel from '../components/ColorTest/ColorPickerPanel.vue'
import FaceRegionMap from '../components/ColorTest/FaceRegionMap.vue'

const selectedMode = ref('')
const showReportPage = ref(false)

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

.settings {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  padding-top: 0;
}

.setting-item {
  display: flex;
  align-items: center;
}

.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: var(--color-border);
  border-radius: 20px;
  transition: .4s;
  margin-right: 8px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 14px;
  color: var(--color-text);
}

.test-container {
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

  .test-container {
    padding: 0.5rem;
  }
  
  .settings {
    justify-content: center;
    padding-bottom: 0;
  }
}

/* 适配大屏幕 */
@media (min-width: 1200px) {
  .test-container {
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
