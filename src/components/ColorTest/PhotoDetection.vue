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
        <div class="fixed-container" @click="handleContainerClick" @wheel="handleWheel">
          <!-- 图片容器 -->
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
              v-if="!isCropMode"
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
          
          <!-- 裁剪框 -->
          <div v-if="isCropMode" class="crop-overlay">
            <div class="crop-corners">
              <div class="crop-corner top-left"></div>
              <div class="crop-corner top-right"></div>
              <div class="crop-corner bottom-left"></div>
              <div class="crop-corner bottom-right"></div>
            </div>
            <div class="crop-guidelines">
              <div class="crop-guideline horizontal-top"></div>
              <div class="crop-guideline horizontal-middle"></div>
              <div class="crop-guideline horizontal-bottom"></div>
              <div class="crop-guideline vertical-left"></div>
              <div class="crop-guideline vertical-middle"></div>
              <div class="crop-guideline vertical-right"></div>
            </div>
          </div>
        </div>
        
        <!-- 裁剪按钮或确认取消按钮 -->
        <div class="crop-actions">
          <template v-if="!isCropMode">
            <button 
              class="btn primary"
              @click="enterCropMode"
            >
              裁剪
            </button>
          </template>
          <template v-else>
            <button 
              class="btn primary"
              @click="confirmCrop"
            >
              确认
            </button>
            <button 
              class="btn secondary"
              @click="cancelCrop"
            >
              取消
            </button>
          </template>
        </div>
        <div v-if="isCropMode" class="crop-mode-tip">
          提示: 可使用鼠标拖动图片调整位置，滚轮可放大缩小图片
        </div>
        
        <!-- 调整控件 -->
        <div class="editor-controls" v-if="!isCropMode">
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
      <div class="detection-results" v-if="!isCropMode">
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
const imageWidth = ref(600);
const imageHeight = ref(800);
const imagePositionX = ref(0); // 图片X位置
const imagePositionY = ref(0); // 图片Y位置
const isImageDragging = ref(false); // 是否正在拖动图片
const imageDragStartX = ref(0); // 图片拖动起始X坐标
const imageDragStartY = ref(0); // 图片拖动起始Y坐标
const isCropMode = ref(false); // 是否处于裁剪模式
const originalImagePosition = ref({ x: 0, y: 0, width: 0, height: 0 }); // 保存原始图片位置信息

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
    
    // 重置裁剪模式
    isCropMode.value = false;
    
    // 当图片加载完成后设置初始位置和大小
    setTimeout(() => {
      if (uploadedImage.value) {
        const img = uploadedImage.value;
        
        // 计算图片的初始尺寸
        const containerWidth = 450; // 固定容器宽度
        const containerHeight = 600; // 固定容器高度
        
        // 根据图片原始宽高比计算合适的尺寸
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const containerRatio = containerWidth / containerHeight;
        
        if (imgRatio > containerRatio) {
          // 图片较宽，以高度为基准
          imageHeight.value = containerHeight;
          imageWidth.value = containerHeight * imgRatio;
          imagePositionX.value = (containerWidth - imageWidth.value) / 2;
          imagePositionY.value = 0;
        } else {
          // 图片较高，以宽度为基准
          imageWidth.value = containerWidth;
          imageHeight.value = containerWidth / imgRatio;
          imagePositionX.value = 0;
          imagePositionY.value = (containerHeight - imageHeight.value) / 2;
        }
        
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
  // 在裁剪模式下或没有选中区域时才能拖动图片
  if (isCropMode.value || !activeRegion.value) {
    isImageDragging.value = true;
    
    // 记录起始位置
    imageDragStartX.value = event.clientX;
    imageDragStartY.value = event.clientY;
    
    // 添加移动和结束拖拽的事件监听
    document.addEventListener('mousemove', dragImage);
    document.addEventListener('mouseup', stopImageDrag);
    
    // 防止事件冒泡
    event.preventDefault();
  }
};

// 拖动图片
const dragImage = (event) => {
  if (!isImageDragging.value) return;
  
  const dx = event.clientX - imageDragStartX.value;
  const dy = event.clientY - imageDragStartY.value;
  
  // 更新图片位置
  imagePositionX.value += dx;
  imagePositionY.value += dy;
  
  // 限制图片不能完全移出容器
  const containerWidth = 450;
  const containerHeight = 600;
  
  // 确保至少保留100px的图片在容器内
  const minVisible = 100;
  imagePositionX.value = Math.max(Math.min(imagePositionX.value, minVisible), containerWidth - imageWidth.value - minVisible);
  imagePositionY.value = Math.max(Math.min(imagePositionY.value, minVisible), containerHeight - imageHeight.value - minVisible);
  
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
  
  // 自动将检测结果发送给父组件
  if (allColorsDetected.value) {
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
  }
};

// 组件挂载时添加事件监听
onMounted(() => {
  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    if (uploadedImage.value) {
      // 处理窗口大小变化时的图片位置调整
      const containerWidth = 450;
      const containerHeight = 600;
      
      // 确保图片不会完全移出容器
      const minVisible = 100;
      imagePositionX.value = Math.max(Math.min(imagePositionX.value, minVisible), containerWidth - imageWidth.value - minVisible);
      imagePositionY.value = Math.max(Math.min(imagePositionY.value, minVisible), containerHeight - imageHeight.value - minVisible);
    }
  });
});

// 处理点击容器
const handleContainerClick = (event) => {
  // 如果点击的是容器本身(而不是其中的区域)，则取消区域选择
  if (event.target.classList.contains('fixed-container')) {
    activeRegion.value = null;
  }
};

// 进入裁剪模式
const enterCropMode = () => {
  // 保存当前图片位置和大小，以便取消时恢复
  originalImagePosition.value = {
    x: imagePositionX.value,
    y: imagePositionY.value,
    width: imageWidth.value,
    height: imageHeight.value
  };
  
  // 设置裁剪模式
  isCropMode.value = true;
};

// 确认裁剪
const confirmCrop = () => {
  isCropMode.value = false;
  
  // 调整区域位置
  adjustRegionsPosition();
  
  // 自动执行颜色检测
  detectColors();
};

// 取消裁剪
const cancelCrop = () => {
  // 恢复原始图片位置和大小
  imagePositionX.value = originalImagePosition.value.x;
  imagePositionY.value = originalImagePosition.value.y;
  imageWidth.value = originalImagePosition.value.width;
  imageHeight.value = originalImagePosition.value.height;
  
  // 退出裁剪模式
  isCropMode.value = false;
};

// 处理滚轮事件
const handleWheel = (event) => {
  // 只在裁剪模式下处理滚轮缩放
  if (!isCropMode.value) return;
  
  event.preventDefault();
  
  const delta = event.deltaY;
  const scaleFactor = delta > 0 ? 0.95 : 1.05; // 缩小或放大5%
  
  // 获取鼠标在容器中的相对位置
  const containerRect = event.currentTarget.getBoundingClientRect();
  const mouseX = event.clientX - containerRect.left - imagePositionX.value;
  const mouseY = event.clientY - containerRect.top - imagePositionY.value;
  
  // 计算新的宽高
  const newWidth = imageWidth.value * scaleFactor;
  const newHeight = imageHeight.value * scaleFactor;
  
  // 根据鼠标位置计算新的位置偏移
  const newPosX = imagePositionX.value - (mouseX * scaleFactor - mouseX);
  const newPosY = imagePositionY.value - (mouseY * scaleFactor - mouseY);
  
  // 限制最小/最大缩放
  const containerWidth = 450;
  const containerHeight = 600;
  
  // 确保图片不会缩放太小
  const minScale = 100; // 最小尺寸
  if (newWidth >= minScale && newHeight >= minScale) {
    // 更新图片位置和大小
    imageWidth.value = newWidth;
    imageHeight.value = newHeight;
    imagePositionX.value = newPosX;
    imagePositionY.value = newPosY;
  }
};
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

/* 固定大小的容器，3:4比例 */
.fixed-container {
  width: 450px;
  height: 600px;
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

/* 裁剪框样式 */
.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.crop-corners {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed rgba(255, 255, 255, 0.7);
  box-sizing: border-box;
}

.crop-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  background-color: rgba(0, 0, 0, 0.5);
}

.crop-corner.top-left {
  top: -8px;
  left: -8px;
}

.crop-corner.top-right {
  top: -8px;
  right: -8px;
}

.crop-corner.bottom-left {
  bottom: -8px;
  left: -8px;
}

.crop-corner.bottom-right {
  bottom: -8px;
  right: -8px;
}

.crop-guidelines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.crop-guideline {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.3);
}

.crop-guideline.horizontal-top {
  top: 33.3%;
  left: 0;
  right: 0;
  height: 1px;
}

.crop-guideline.horizontal-middle {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
}

.crop-guideline.horizontal-bottom {
  top: 66.7%;
  left: 0;
  right: 0;
  height: 1px;
}

.crop-guideline.vertical-left {
  top: 0;
  bottom: 0;
  left: 33.3%;
  width: 1px;
}

.crop-guideline.vertical-middle {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
}

.crop-guideline.vertical-right {
  top: 0;
  bottom: 0;
  left: 66.7%;
  width: 1px;
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

.region-controls {
  margin-bottom: 15px;
}

.region-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border);
  outline: none;
  border-radius: 3px;
}

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
    width: 300px;
    height: 400px;
  }
  
  .color-results {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .fixed-container {
    width: 225px;
    height: 300px;
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

.crop-actions {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.crop-mode-tip {
  margin-top: 5px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style> 