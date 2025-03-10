<template>
  <div class="container-fluid color-test-page">
    <div class="row pt-2">
      <div class="col-12 text-center">
        <p class="lead mb-4">请选择最接近您面部特征的颜色，我们将为您进行专业的色彩分析。</p>
      </div>
    </div>

    <div class="row flex-grow-1">
      <div class="col-12">
        <ColorPickerPanel
          initialMode="photo"
        />
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
.color-test-page {
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .color-test-page {
    padding-bottom: 2rem;
  }
}
</style>
