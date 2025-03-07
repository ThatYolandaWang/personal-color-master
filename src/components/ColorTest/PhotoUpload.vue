<template>
  <div class="photo-upload">
    <div class="upload-area" 
         @drop.prevent="handleDrop"
         @dragover.prevent
         @click="triggerFileInput">
      <input 
        type="file"
        ref="fileInput"
        style="display: none"
        accept="image/*"
        @change="handleFileSelect"
      >
      <div v-if="!previewUrl" class="upload-placeholder">
        <i class="upload-icon">📸</i>
        <p>点击或拖拽上传照片</p>
      </div>
      <img v-else :src="previewUrl" class="preview-image">
    </div>
    
    <div v-if="previewUrl" class="detection-result">
      <div class="loading" v-if="isAnalyzing">分析中...</div>
      <div v-else class="color-results">
        <div v-for="(result, index) in colorResults" 
             :key="index" 
             class="color-result-item">
          <span>{{ result.label }}:</span>
          <div class="color-box" :style="{ backgroundColor: result.color }"></div>
          <span>{{ result.rgb }}</span>
        </div>
      </div>
      <button 
        class="analyze-btn"
        :disabled="isAnalyzing"
        @click="analyzePhoto">
        {{ isAnalyzing ? '分析中...' : '开始分析' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoUpload',
  data() {
    return {
      previewUrl: '',
      isAnalyzing: false,
      colorResults: []
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      this.handleFile(file)
    },
    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      this.handleFile(file)
    },
    handleFile(file) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewUrl = e.target.result
      }
      reader.readAsDataURL(file)
    },
    async analyzePhoto() {
      this.isAnalyzing = true
      try {
        // 这里需要调用腾讯云人脸检测API
        // const response = await this.detectFace(this.previewUrl)
        // this.colorResults = this.processDetectionResult(response)
      } catch (error) {
        console.error('分析失败:', error)
        alert('照片分析失败，请重试')
      } finally {
        this.isAnalyzing = false
      }
    }
  }
}
</script>

<style scoped>
.photo-upload {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.detection-result {
  margin-top: 20px;
}

.color-results {
  margin: 20px 0;
}

.color-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.analyze-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.analyze-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
