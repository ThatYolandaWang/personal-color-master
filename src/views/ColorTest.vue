<template>
  <div class="color-test">
    <div class="test-header">
      <h1>个人色彩测试</h1>
      <p class="description">请选择最接近您面部特征的颜色，我们将为您进行专业的色彩分析。</p>
    </div>

    <div class="test-content">
      <div class="test-area">
        <div class="test-container">
          <div class="color-picker-container">
            <ColorPickerPanel
              initialMode="photo"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ColorPickerPanel from '../components/ColorTest/ColorPickerPanel.vue'

const route = useRoute()
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

.test-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.test-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 1rem;
}

.color-picker-container {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-container {
    padding: 0.5rem;
  }
}

/* 适配大屏幕 */
@media (min-width: 1200px) {
  .test-container {
    flex-direction: row;
    gap: 2rem;
  }

  .color-picker-container {
    width: 100%;
  }
}
</style>
