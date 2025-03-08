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
          
          <!-- 缩放指示 -->
          <div class="zoom-tip">鼠标悬停于照片上，可使用滚轮放大缩小</div>
        </div>
        
        <!-- 调整控件 -->
        <div class="editor-controls">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';

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
    
    // 当图片加载完成后设置初始位置和大小
    setTimeout(() => {
      if (uploadedImage.value) {
        const img = uploadedImage.value;
        const fixedContainer = editorContainer.value.querySelector('.fixed-container');
        
        // 获取容器的实际尺寸
        const containerWidth = fixedContainer.clientWidth;
        const containerHeight = fixedContainer.clientHeight || fixedContainer.offsetWidth * 4/3; // 3:4比例
        
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
        
        // 调整区域位置
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
  
  // 获取固定容器的实际尺寸
  const fixedContainer = editorContainer.value.querySelector('.fixed-container');
  const containerWidth = fixedContainer.clientWidth;
  const containerHeight = fixedContainer.clientHeight || fixedContainer.offsetWidth * 4/3;
  
  // 确定边界限制
  const minVisible = Math.min(containerWidth, containerHeight) * 0.1; // 至少保留10%在容器内
  
  // 图片小于容器时的特殊处理 - 允许居中放置
  if (imageWidth.value < containerWidth) {
    // 水平方向允许图片在容器内自由移动
    const maxLeft = (containerWidth - imageWidth.value) / 2 + containerWidth * 0.3; // 增加一些余量
    const minLeft = (containerWidth - imageWidth.value) / 2 - containerWidth * 0.3;
    imagePositionX.value = Math.max(Math.min(imagePositionX.value, maxLeft), minLeft);
  } else {
    // 图片宽度大于容器时的正常限制
    imagePositionX.value = Math.max(Math.min(imagePositionX.value, 0), containerWidth - imageWidth.value);
  }
  
  if (imageHeight.value < containerHeight) {
    // 垂直方向允许图片在容器内自由移动
    const maxTop = (containerHeight - imageHeight.value) / 2 + containerHeight * 0.3; // 增加一些余量
    const minTop = (containerHeight - imageHeight.value) / 2 - containerHeight * 0.3;
    imagePositionY.value = Math.max(Math.min(imagePositionY.value, maxTop), minTop);
  } else {
    // 图片高度大于容器时的正常限制
    imagePositionY.value = Math.max(Math.min(imagePositionY.value, 0), containerHeight - imageHeight.value);
  }
  
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

// 处理窗口大小变化
const handleResize = () => {
  if (uploadedImage.value) {
    // 获取固定容器的实际尺寸
    const fixedContainer = editorContainer.value.querySelector('.fixed-container');
    const containerWidth = fixedContainer.clientWidth;
    const containerHeight = fixedContainer.clientHeight || fixedContainer.offsetWidth * 4/3;
    
    // 当图片小于容器时，确保图片居中
    if (imageWidth.value < containerWidth) {
      imagePositionX.value = (containerWidth - imageWidth.value) / 2;
    } else {
      // 确保图片不会太远离容器边界
      const maxOffsetX = containerWidth * 0.1;
      imagePositionX.value = Math.max(Math.min(imagePositionX.value, maxOffsetX), containerWidth - imageWidth.value - maxOffsetX);
    }
    
    if (imageHeight.value < containerHeight) {
      imagePositionY.value = (containerHeight - imageHeight.value) / 2;
    } else {
      // 确保图片不会太远离容器边界
      const maxOffsetY = containerHeight * 0.1;
      imagePositionY.value = Math.max(Math.min(imagePositionY.value, maxOffsetY), containerHeight - imageHeight.value - maxOffsetY);
    }
  }
};

// 处理document点击事件
const handleDocumentClick = (event) => {
  // 如果点击的不是检测区域，则取消区域选择
  const isDetectionRegion = event.target.closest('.detection-region');
  // 只有在点击区域外且有活动区域时取消选择
  if (!isDetectionRegion && activeRegion.value !== null) {
    activeRegion.value = null;
  }
};

// 组件挂载时添加事件监听
onMounted(() => {
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  
  // 添加全局点击事件监听，用于取消区域选择
  document.addEventListener('click', handleDocumentClick);
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleDocumentClick);
});

// 处理点击容器
const handleContainerClick = (event) => {
  // 如果点击的不是检测区域（detection-region），则取消区域选择
  const isDetectionRegion = event.target.closest('.detection-region');
  if (!isDetectionRegion) {
    activeRegion.value = null;
  }
};

// 处理滚轮事件
const handleWheel = (event) => {
  event.preventDefault();
  
  const delta = event.deltaY;
  // 使用更小的缩放因子，让缩放更平滑
  const scaleFactor = delta > 0 ? 0.98 : 1.02; // 缩小或放大2%
  
  // 获取容器的实际尺寸
  const fixedContainer = event.currentTarget;
  const containerWidth = fixedContainer.clientWidth;
  const containerHeight = fixedContainer.clientHeight || fixedContainer.offsetWidth * 4/3;
  
  // 获取鼠标在容器中的相对位置
  const containerRect = fixedContainer.getBoundingClientRect();
  const mouseX = event.clientX - containerRect.left;
  const mouseY = event.clientY - containerRect.top;
  
  // 计算鼠标相对于图片的位置比例（考虑图片在容器内的实际位置）
  // 注意：只有鼠标在图片上时才应该进行比例计算
  const mouseOverImageX = mouseX - imagePositionX.value;
  const mouseOverImageY = mouseY - imagePositionY.value;
  
  // 检查鼠标是否在图片上
  if (mouseOverImageX >= 0 && mouseOverImageX <= imageWidth.value && 
      mouseOverImageY >= 0 && mouseOverImageY <= imageHeight.value) {
    
    // 计算鼠标相对于图片的位置比例
    const relativeX = mouseOverImageX / imageWidth.value;
    const relativeY = mouseOverImageY / imageHeight.value;
    
    // 计算新的宽高
    const oldWidth = imageWidth.value;
    const oldHeight = imageHeight.value;
    const newWidth = oldWidth * scaleFactor;
    const newHeight = oldHeight * scaleFactor;
    
    // 确保图片不会缩放太小
    const minScale = Math.min(containerWidth, containerHeight) * 0.3; // 最小尺寸为容器尺寸的30%
    if (newWidth >= minScale && newHeight >= minScale) {
      // 先更新图片尺寸
      imageWidth.value = newWidth;
      imageHeight.value = newHeight;
      
      // 更新图片位置，保持鼠标指向的图片点不变
      imagePositionX.value = mouseX - (relativeX * newWidth);
      imagePositionY.value = mouseY - (relativeY * newHeight);
      
      // 特殊处理：当图片小于容器时，确保图片居中显示
      if (newWidth < containerWidth) {
        // 图片宽度小于容器，水平居中
        imagePositionX.value = (containerWidth - newWidth) / 2;
      } else {
        // 图片宽度大于容器，确保不会太远离边界
        const maxOffsetX = containerWidth * 0.1;
        imagePositionX.value = Math.max(Math.min(imagePositionX.value, maxOffsetX), containerWidth - newWidth - maxOffsetX);
      }
      
      if (newHeight < containerHeight) {
        // 图片高度小于容器，垂直居中
        imagePositionY.value = (containerHeight - newHeight) / 2;
      } else {
        // 图片高度大于容器，确保不会太远离边界
        const maxOffsetY = containerHeight * 0.1;
        imagePositionY.value = Math.max(Math.min(imagePositionY.value, maxOffsetY), containerHeight - newHeight - maxOffsetY);
      }
      
      // 调整区域位置和大小
      adjustRegionsPosition();
    }
  }
};
</script>

<style scoped>
.photo-detection {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  /*min-height: calc(100vh - 180px);*/ /* 最小高度 */
  max-height: calc(100vh - 180px); /* 最大高度 */
  overflow: hidden; /* 防止内容溢出 */
}

.upload-section {
  text-align: center;
  margin-bottom: 15px;
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
  flex-direction: row;
  gap: 15px;
  flex: 1;
  overflow: hidden;
}

.editor-container {
  flex: 1;
  position: relative;
  max-width: 65%;
}

/* 固定大小的容器，3:4比例 */
.fixed-container {
  width: 100%;
  height: 0;
  padding-bottom: 133.33%; /* 3:4比例 */
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
  transform-origin: center;
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
  margin-top: 10px;
  padding: 10px;
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
  padding: 15px;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.detection-results {
  flex: 1;
  padding: 15px;
  background-color: var(--color-background-soft);
  border-radius: var(--border-radius);
  overflow-y: auto;
  max-height: 100%;
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
  justify-content: center;
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
  margin-top: 15px;
  text-align: center;
  bottom: 0;
  background-color: var(--color-background-soft);
  padding-bottom: 5px;
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
@media (max-width: 768px) {
  .photo-detection {
    height: auto;
  }
  
  .photo-editor {
    flex-direction: column;
  }
  
  .editor-container {
    max-width: 100%;
  }
  
  .fixed-container {
    padding-bottom: 100%; /* 移动端使用1:1比例 */
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

.zoom-tip {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 12px;
  text-shadow: 0 0 3px rgba(0,0,0,0.8);
  pointer-events: none;
  background-color: rgba(0,0,0,0.3);
  padding: 3px 0;
  opacity: 0.7;
}
</style> 