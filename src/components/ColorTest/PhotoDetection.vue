<template>
  <div class="photo-detection">
    <div class="upload-section">
      <label class="upload-label">
        <input 
          type="file" 
          accept="image/*" 
          @change="handleFileSelect" 
          class="file-input"
        >
        <span class="upload-button">选择照片</span>
      </label>
      <p class="upload-help">请上传一张清晰的正面照片</p>
    </div>

    <div v-if="imageUrl" class="photo-editor">
      <div class="editor-container" ref="editorContainer">
        <!-- 照片展示区域，固定大小的容器 -->
        <div class="fixed-container">
          <!-- 可移动的图片容器 -->
          <div 
            class="image-container" 
            :style="{ 
              width: `${imageWidth}px`, 
              height: `${imageHeight}px`,
              transform: `translate(${imagePositionX}px, ${imagePositionY}px)`
            }"
            @mousedown="startImageDrag"
            :class="{ 'dragging': isImageDragging }"
          >
            <img 
              :src="imageUrl" 
              alt="上传的照片" 
              class="uploaded-image" 
              ref="uploadedImage"
            />
            
            <!-- 各面部区域的检测椭圆 -->
            <div 
              v-for="(region, key) in detectionRegions" 
              :key="key"
              class="detection-region"
              :class="{ 'active': activeRegion === key }"
              :style="{
                width: `${region.width}px`,
                height: `${region.height}px`,
                left: `${region.x}px`,
                top: `${region.y}px`,
                backgroundColor: region.color,
                borderColor: activeRegion === key ? '#00aaff' : 'rgba(255,255,255,0.5)'
              }"
              @mousedown.stop="startDrag($event, key)"
              @click.stop="setActiveRegion(key)"
            >
              <span class="region-label">{{ region.label }}</span>
            </div>
          </div>
        </div>
        
        <!-- 调整控件 -->
        <div class="editor-controls">
          <div class="size-controls">
            <label>照片大小</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model="sizeScale" 
                min="50" 
                max="200" 
                class="size-slider"
              />
              <span>{{ sizeScale }}%</span>
            </div>
          </div>
          
          <div v-if="activeRegion" class="region-controls">
            <h3>{{ detectionRegions[activeRegion].label }} 区域调整</h3>
            <div class="region-size-controls">
              <label>宽度</label>
              <input 
                type="range" 
                v-model="detectionRegions[activeRegion].width" 
                :min="20" 
                :max="imageWidth / 2" 
                class="region-slider"
              />
              
              <label>高度</label>
              <input 
                type="range" 
                v-model="detectionRegions[activeRegion].height" 
                :min="20" 
                :max="imageHeight / 2" 
                class="region-slider"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 检测结果展示 -->
      <div class="detection-results">
        <h3>检测结果</h3>
        <div class="color-results">
          <div 
            v-for="(region, key) in detectionRegions" 
            :key="key"
            class="color-result-item"
            @click="setActiveRegion(key)"
          >
            <span class="color-label">{{ region.label }}:</span>
            <div 
              class="color-preview" 
              :style="{ backgroundColor: region.color }"
            ></div>
            <span class="color-hex">{{ region.color }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            class="btn primary" 
            @click="detectColors"
          >
            检测颜色
          </button>
          <button 
            class="btn secondary" 
            @click="useDetectedColors"
            :disabled="!allColorsDetected"
          >
            使用这些颜色
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';

// 发射事件
const emit = defineEmits(['colorsDetected']);

// 图片相关状态
const imageUrl = ref('');
const uploadedImage = ref(null);
const editorContainer = ref(null);
const imageWidth = ref(400);
const imageHeight = ref(400);
const sizeScale = ref(100);
const imagePositionX = ref(0); // 图片X位置
const imagePositionY = ref(0); // 图片Y位置
const isImageDragging = ref(false); // 是否正在拖动图片
const imageDragStartX = ref(0); // 图片拖动起始X坐标
const imageDragStartY = ref(0); // 图片拖动起始Y坐标

// 拖拽状态
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const activeRegion = ref(null);

// 检测区域定义
const detectionRegions = reactive({
  forehead: {
    label: '前额',
    x: 150,
    y: 50,
    width: 100,
    height: 60,
    color: 'rgba(255, 255, 255, 0.5)'
  },
  leftCheek: {
    label: '左脸颊',
    x: 80,
    y: 150,
    width: 70,
    height: 50,
    color: 'rgba(255, 255, 255, 0.5)'
  },
  rightCheek: {
    label: '右脸颊',
    x: 250,
    y: 150,
    width: 70,
    height: 50,
    color: 'rgba(255, 255, 255, 0.5)'
  },
  neck: {
    label: '颈部',
    x: 150,
    y: 280,
    width: 100,
    height: 60,
    color: 'rgba(255, 255, 255, 0.5)'
  },
  lips: {
    label: '唇部',
    x: 165,
    y: 220,
    width: 70,
    height: 30,
    color: 'rgba(255, 255, 255, 0.5)'
  },
  hair: {
    label: '发色',
    x: 150,
    y: 20,
    width: 100,
    height: 40,
    color: 'rgba(255, 255, 255, 0.5)'
  }
});

// 监听照片大小变化
watch(sizeScale, (newValue) => {
  const oldScale = imageWidth.value / 400;
  const newScale = newValue / 100;
  
  // 计算新的尺寸
  const newWidth = 400 * newScale;
  const newHeight = (imageHeight.value / imageWidth.value) * newWidth;
  
  // 保持中心点位置不变
  const widthDiff = newWidth - imageWidth.value;
  const heightDiff = newHeight - imageHeight.value;
  
  // 调整图片位置，使缩放以中心点为基准
  imagePositionX.value -= widthDiff / 2;
  imagePositionY.value -= heightDiff / 2;
  
  // 更新图片尺寸
  imageWidth.value = newWidth;
  imageHeight.value = newHeight;
  
  // 调整区域大小和位置
  Object.keys(detectionRegions).forEach(key => {
    const region = detectionRegions[key];
    region.x = (region.x / oldScale) * newScale;
    region.y = (region.y / oldScale) * newScale;
    region.width = (region.width / oldScale) * newScale;
    region.height = (region.height / oldScale) * newScale;
  });
});

// 判断是否所有颜色都已检测
const allColorsDetected = computed(() => {
  return Object.values(detectionRegions).every(
    region => region.color !== 'rgba(255, 255, 255, 0.5)'
  );
});

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.match('image.*')) {
    alert('请选择图片文件');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    imageUrl.value = e.target.result;
    
    // 重置区域颜色和图片位置
    Object.keys(detectionRegions).forEach(key => {
      detectionRegions[key].color = 'rgba(255, 255, 255, 0.5)';
    });
    
    imagePositionX.value = 0;
    imagePositionY.value = 0;
    
    // 当图片加载完成后，调整大小并执行颜色检测
    setTimeout(() => {
      if (uploadedImage.value) {
        const img = uploadedImage.value;
        
        // 设置初始尺寸，保持原始宽高比
        const originalRatio = img.naturalWidth / img.naturalHeight;
        imageWidth.value = 400;
        imageHeight.value = 400 / originalRatio;
        
        // 重置缩放比例
        sizeScale.value = 100;
        
        // 根据图片大小调整检测区域位置
        adjustRegionsPosition();
        
        // 自动执行颜色检测
        detectColors();
      }
    }, 300);
  };
  
  reader.readAsDataURL(file);
};

// 开始拖动图片
const startImageDrag = (event) => {
  if (activeRegion.value) return; // 如果正在拖动区域，则不拖动图片
  
  isImageDragging.value = true;
  
  // 记录起始位置
  imageDragStartX.value = event.clientX;
  imageDragStartY.value = event.clientY;
  
  // 添加移动和结束拖拽的事件监听
  document.addEventListener('mousemove', dragImage);
  document.addEventListener('mouseup', stopImageDrag);
  
  // 防止事件冒泡
  event.preventDefault();
};

// 拖动图片
const dragImage = (event) => {
  if (!isImageDragging.value) return;
  
  const dx = event.clientX - imageDragStartX.value;
  const dy = event.clientY - imageDragStartY.value;
  
  // 更新图片位置
  imagePositionX.value += dx;
  imagePositionY.value += dy;
  
  // 更新起始位置
  imageDragStartX.value = event.clientX;
  imageDragStartY.value = event.clientY;
};

// 停止拖动图片
const stopImageDrag = () => {
  isImageDragging.value = false;
  document.removeEventListener('mousemove', dragImage);
  document.removeEventListener('mouseup', stopImageDrag);
};

// 调整区域位置
const adjustRegionsPosition = () => {
  const w = imageWidth.value;
  const h = imageHeight.value;
  
  detectionRegions.forehead.x = w * 0.375;
  detectionRegions.forehead.y = h * 0.125;
  detectionRegions.forehead.width = w * 0.25;
  detectionRegions.forehead.height = h * 0.15;
  
  detectionRegions.leftCheek.x = w * 0.2;
  detectionRegions.leftCheek.y = h * 0.375;
  detectionRegions.leftCheek.width = w * 0.175;
  detectionRegions.leftCheek.height = h * 0.125;
  
  detectionRegions.rightCheek.x = w * 0.625;
  detectionRegions.rightCheek.y = h * 0.375;
  detectionRegions.rightCheek.width = w * 0.175;
  detectionRegions.rightCheek.height = h * 0.125;
  
  detectionRegions.neck.x = w * 0.375;
  detectionRegions.neck.y = h * 0.7;
  detectionRegions.neck.width = w * 0.25;
  detectionRegions.neck.height = h * 0.15;
  
  detectionRegions.lips.x = w * 0.41;
  detectionRegions.lips.y = h * 0.55;
  detectionRegions.lips.width = w * 0.175;
  detectionRegions.lips.height = h * 0.075;
  
  detectionRegions.hair.x = w * 0.375;
  detectionRegions.hair.y = h * 0.05;
  detectionRegions.hair.width = w * 0.25;
  detectionRegions.hair.height = h * 0.1;
};

// 设置当前活动区域
const setActiveRegion = (key) => {
  activeRegion.value = key;
};

// 开始拖拽区域
const startDrag = (event, key) => {
  isDragging.value = true;
  activeRegion.value = key;
  
  // 记录起始位置
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  
  // 添加移动和结束拖拽的事件监听
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', stopDrag);
  
  // 防止事件冒泡
  event.preventDefault();
};

// 拖拽移动处理
const dragMove = (event) => {
  if (!isDragging.value || !activeRegion.value) return;
  
  const dx = event.clientX - dragStartX.value;
  const dy = event.clientY - dragStartY.value;
  
  // 更新区域位置
  const region = detectionRegions[activeRegion.value];
  region.x += dx;
  region.y += dy;
  
  // 确保区域在图片范围内
  region.x = Math.max(0, Math.min(imageWidth.value - region.width, region.x));
  region.y = Math.max(0, Math.min(imageHeight.value - region.height, region.y));
  
  // 更新起始位置
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
};

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', stopDrag);
};

// 计算区域内的平均颜色
const getAverageColor = (x, y, width, height) => {
  if (!uploadedImage.value) return 'rgba(255, 255, 255, 0.5)';
  
  const img = uploadedImage.value;
  
  // 创建临时canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置canvas大小
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  // 将图片绘制到canvas
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  
  // 计算实际区域在图片上的位置
  const scaleX = img.naturalWidth / imageWidth.value;
  const scaleY = img.naturalHeight / imageHeight.value;
  const realX = x * scaleX;
  const realY = y * scaleY;
  const realWidth = width * scaleX;
  const realHeight = height * scaleY;
  
  // 获取区域的像素数据
  const imageData = ctx.getImageData(realX, realY, realWidth, realHeight);
  const data = imageData.data;
  
  // 计算平均颜色
  let r = 0, g = 0, b = 0;
  const pixelCount = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  
  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);
  
  // 转换为十六进制颜色代码
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return hex;
};

// 检测所有区域的颜色
const detectColors = () => {
  if (!imageUrl.value) return;
  
  Object.keys(detectionRegions).forEach(key => {
    const region = detectionRegions[key];
    region.color = getAverageColor(region.x, region.y, region.width, region.height);
  });
};

// 使用检测到的颜色
const useDetectedColors = () => {
  if (!allColorsDetected.value) return;
  
  // 将检测结果发送给父组件
  const colors = {
    forehead: detectionRegions.forehead.color,
    cheeks: ((color1, color2) => {
      // 计算左右脸颊的平均色
      const hex1 = color1.replace('#', '');
      const hex2 = color2.replace('#', '');
      
      const r1 = parseInt(hex1.substring(0, 2), 16);
      const g1 = parseInt(hex1.substring(2, 4), 16);
      const b1 = parseInt(hex1.substring(4, 6), 16);
      
      const r2 = parseInt(hex2.substring(0, 2), 16);
      const g2 = parseInt(hex2.substring(2, 4), 16);
      const b2 = parseInt(hex2.substring(4, 6), 16);
      
      const r = Math.round((r1 + r2) / 2);
      const g = Math.round((g1 + g2) / 2);
      const b = Math.round((b1 + b2) / 2);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    })(detectionRegions.leftCheek.color, detectionRegions.rightCheek.color),
    neck: detectionRegions.neck.color,
    lips: detectionRegions.lips.color,
    hair: detectionRegions.hair.color,
    eyes: '#2F4F4F' // 由于无法准确检测，使用默认深灰色
  };
  
  emit('colorsDetected', colors);
};

// 组件挂载时添加事件监听
onMounted(() => {
  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    if (uploadedImage.value) {
      // 保持图片不超出视口
      const containerWidth = document.documentElement.clientWidth - 80;
      const maxWidth = Math.min(containerWidth, 800);
      
      if (imageWidth.value > maxWidth) {
        const ratio = imageHeight.value / imageWidth.value;
        const oldWidth = imageWidth.value;
        imageWidth.value = maxWidth;
        imageHeight.value = maxWidth * ratio;
        
        // 调整缩放比例
        sizeScale.value = Math.round((maxWidth / 400) * 100);
        
        // 调整位置
        imagePositionX.value = imagePositionX.value * (maxWidth / oldWidth);
        imagePositionY.value = imagePositionY.value * (maxWidth / oldWidth);
      }
    }
  });
});
</script>

<style scoped>
.photo-detection {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.upload-section {
  text-align: center;
  margin-bottom: 20px;
}

.upload-label {
  display: inline-block;
  cursor: pointer;
}

.file-input {
  display: none;
}

.upload-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--border-radius);
  transition: all 0.3s;
}

.upload-button:hover {
  background-color: var(--color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.upload-help {
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.photo-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-container {
  width: 100%;
  position: relative;
}

/* 固定大小的容器 */
.fixed-container {
  width: 500px;
  height: 500px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background-soft);
}

.image-container {
  position: absolute;
  cursor: move;
  transition: transform 0.1s ease;
}

.image-container.dragging {
  transition: none;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.detection-region {
  position: absolute;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 50%;
  cursor: move;
  opacity: 0.6;
  transition: opacity 0.3s, border-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detection-region:hover,
.detection-region.active {
  opacity: 0.8;
  z-index: 10;
}

.region-label {
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0,0,0,0.8);
  pointer-events: none;
}

.editor-controls {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--color-background-soft);
  border-radius: var(--border-radius);
}

.size-controls,
.region-controls {
  margin-bottom: 15px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.size-slider,
.region-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border);
  outline: none;
  border-radius: 3px;
}

.size-slider::-webkit-slider-thumb,
.region-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

.region-size-controls {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.detection-results {
  padding: 20px;
  background-color: var(--color-background-soft);
  border-radius: var(--border-radius);
}

.color-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin: 15px 0;
}

.color-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  border-radius: var(--border-radius);
  transition: background-color 0.3s;
}

.color-result-item:hover {
  background-color: var(--color-background-mute);
}

.color-preview {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
}

.color-hex {
  font-size: 14px;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn.primary {
  background-color: var(--color-primary);
  color: white;
}

.btn.secondary {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .photo-editor {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .editor-container {
    flex: 1.5;
  }
  
  .detection-results {
    flex: 1;
  }
}

@media (max-width: 767px) {
  .fixed-container {
    width: 320px;
    height: 320px;
  }
  
  .color-results {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .fixed-container {
    width: 280px;
    height: 280px;
  }
  
  .color-results {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 