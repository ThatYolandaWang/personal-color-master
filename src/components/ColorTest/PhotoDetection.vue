<template>
  <div class="container photo-detection-container">
    <div class="row justify-content-center">
      <!-- 上传区域 -->
      <div class="col-12 text-center">
        <div class="border-0 p-3 mx-auto" style="max-width: 400px;">
          <div >
            <label class="btn btn-primary btn-lg d-block mx-auto" style="max-width: 200px;">
        <input 
          type="file" 
          accept="image/*" 
          @change="handleFileSelect" 
                class="d-none"
        >
              <i class="bi bi-upload me-2"></i>
              {{ imageUrl ? '重新上传照片' : '上传照片' }}
      </label>
            <small v-if="!imageUrl" class="text-secondary d-block mt-2">请上传一张清晰的正面照片</small>
          </div>
        </div>
    </div>

      <!-- 照片编辑和结果区域 -->
      <div v-if="imageUrl" class="col-12">
        <div class="row g-4">
          <!-- 照片编辑区 -->
          <div class="col-md-8 mb-3">
        <!-- 照片展示区域 -->
            <div class="card shadow-sm border-0">
              <div class="card-header">
                <h5 class="card-title mb-0 text-center">检测区域</h5>
              </div>
              <div class="card-footer border-0 text-center p-3">
                <!-- 开始分析按钮 -->
                <button 
                class="btn btn-primary btn-lg px-4 rounded-3 shadow-sm detect-button" 
                  @click="startAnalysis"
                  :disabled="!allColorsDetected"
                >
                  <i class="bi bi-palette-fill me-2"></i>开始分析
                </button>

                <small v-if="!allColorsDetected" class="text-secondary d-block mt-2 text-center">
                  请先完成所有区域的颜色检测
                </small>
              </div>

              <div class="card-body p-2">
                <div class="photo-container border rounded-3 overflow-hidden position-relative bg-light" ref="editorContainer">
                  <div 
                    class="fixed-container" 
                    @click="handleContainerClick"
                    @wheel="handleWheel"
                    @touchstart="handleTouchStart"
                    @touchmove="handleTouchMove"
                    @touchend="handleTouchEnd"
                  >
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
                        @touchstart.stop="startDrag($event, key)"
                        @click.stop="setActiveRegion(key)"
          >
            <span class="region-label">{{ region.label }}</span>
                      </div>
                    </div>
          </div>
        </div>
        
                <!-- 操作提示 -->
                <div class="alert alert-info mt-3 mb-0 py-2 small">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    <div class="d-none d-md-block">鼠标悬停于照片上，可使用滚轮放大缩，拖动照片可调整位置，点击圆形区域可进行细节调整</div>
                    <div class="d-md-none">双指捏合可放大缩小照片拖动照片调整位置，点击圆形区域调整大小</div>
                  </div>
                </div>
            </div>
          </div>
          

          </div>
          
          <!-- 检测结果展示 -->
          <div class="col-md-4 mb-3">
            <!-- 区域调整控件 -->
            <div v-if="activeRegion" class="card mt-3 shadow-sm border-0">
              <div class="card-header">
                <h5 class="card-title mb-0 text-center">{{ detectionRegions[activeRegion].label }} 区域调整</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label d-flex justify-content-between">
                    <span>宽度</span>
                    <span class="text-secondary small">{{ Math.round(detectionRegions[activeRegion].width) }}px</span>
                  </label>
              <input 
                type="range" 
                    class="form-range" 
                v-model="detectionRegions[activeRegion].width" 
                :min="20" 
                :max="imageWidth / 2" 
                    @input="handleRangeInteraction"
                  />
                </div>
                <div class="mb-0">
                  <label class="form-label d-flex justify-content-between">
                    <span>高度</span>
                    <span class="text-secondary small">{{ Math.round(detectionRegions[activeRegion].height) }}px</span>
                  </label>
              <input 
                type="range" 
                    class="form-range" 
                v-model="detectionRegions[activeRegion].height" 
                :min="20" 
                :max="imageHeight / 2" 
                    @input="handleRangeInteraction"
              />
          </div>
        </div>
      </div>
      
            <div class="card shadow-sm border-0">
              <div class="card-header">
                <h5 class="mb-0 text-center">检测结果</h5>
              </div>
              <div class="card-footer border-0 text-center p-3">
                <button 
                  class="btn btn-primary btn-lg px-4 rounded-3 shadow-sm detect-button" 
                  @click="detectColors"
                >
                  <i class="bi bi-eyedropper me-2"></i>检测颜色
                </button>
              </div>
              <div class="card-body p-3">
                <div class="row g-3">
          <div 
            v-for="(region, key) in detectionRegions" 
            :key="key"
                    class="col-12 col-sm-6 col-md-12"
            @click="setActiveRegion(key)"
          >
                    <div class="color-result-item d-flex align-items-center p-2 border rounded-3"
                         :class="{'bg-light': activeRegion === key}">
                      <span class="me-2 fw-medium">{{ region.label }}:</span>
            <div 
                        class="color-preview me-2 border" 
              :style="{ backgroundColor: region.color }"
            ></div>
                      <span class="small text-monospace ms-auto">{{ region.color }}</span>
                    </div>
                  </div>
                </div>
          </div>
        </div>
        

        </div>
      </div>
    </div>
    </div>

    <!-- 回到顶部按钮 -->
    <button 
      class="btn btn-primary rounded-circle back-to-top-btn shadow" 
      @click="scrollToTop"
      v-show="showBackToTop"
    >
      <i class="bi bi-arrow-up"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// 路由器
const router = useRouter();

// 发射事件
const emit = defineEmits(['colorsDetected']);

// 图片相关状态
const imageUrl = ref('');
const uploadedImage = ref(null);
const editorContainer = ref(null);
const imageWidth = ref(600);
const imageHeight = ref(800);
const imagePositionX = ref(0);
const imagePositionY = ref(0);
const isImageDragging = ref(false);
const imageDragStartX = ref(0);
const imageDragStartY = ref(0);

// 触摸相关状态
const touchStartX = ref(0);
const touchStartY = ref(0);
const lastTouchDistance = ref(0);

// 拖拽状态
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const activeRegion = ref(null);

// 图片容器相关
const imageContainerRef = ref(null);
const imageContainerRect = ref(null);

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

// 回到顶部相关变量
const showBackToTop = ref(false);

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
  // 如果正在拖动检测区域，不允许拖动图片
  if (isDragging.value) return;
  
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
  
  // 移除实时颜色计算，提高拖拽流畅度
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
  // 阻止事件传播，避免触发图片拖动
  event.preventDefault();
  event.stopPropagation();
  
  isDragging.value = true;
  activeRegion.value = key;
  
  // 缓存图片容器位置，用于精确计算
  if (editorContainer.value) {
    const imageContainer = editorContainer.value.querySelector('.image-container');
    if (imageContainer) {
      imageContainerRect.value = imageContainer.getBoundingClientRect();
    }
  }
  
  // 处理触摸事件
  if (event.type === 'touchstart') {
    const touch = event.touches[0];
    
    // 精确记录触摸起始位置
    dragStartX.value = touch.clientX;
    dragStartY.value = touch.clientY;
    
    // 添加事件监听
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', stopDrag);
    return;
  }
  
  // 处理鼠标事件
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', stopDrag);
};

// 拖拽移动处理
const dragMove = (event) => {
  if (!isDragging.value || !activeRegion.value) return;
  
  // 阻止默认行为和冒泡
  event.preventDefault();
  event.stopPropagation();
  
  let dx, dy;
  let clientX, clientY;
  
  // 处理触摸事件
  if (event.type === 'touchmove') {
    const touch = event.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    // 处理鼠标事件
    clientX = event.clientX;
    clientY = event.clientY;
  }
  
  // 计算偏移量
  dx = clientX - dragStartX.value;
  dy = clientY - dragStartY.value;
  
  // 更新起始位置
  dragStartX.value = clientX;
  dragStartY.value = clientY;
  
  // 考虑图片位置和缩放比例
  const region = detectionRegions[activeRegion.value];
  
  // 更新区域位置
  region.x += dx;
  region.y += dy;
  
  // 确保区域在图片范围内
  region.x = Math.max(0, Math.min(imageWidth.value - region.width, region.x));
  region.y = Math.max(0, Math.min(imageHeight.value - region.height, region.y));
};

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', dragMove);
  document.removeEventListener('touchend', stopDrag);

    // 在停止拖拽时更新当前活动区域的颜色
  if (activeRegion.value) {
    const region = detectionRegions[activeRegion.value];
    const averageColor = getAverageColor(region.x, region.y, region.width, region.height);
    region.color = averageColor; // 更新区域颜色
    detectColors(); // 重新检测颜色以更新结果
  }
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
  // 阻止range输入元素上的点击事件取消选择
  const isRangeInput = event.target.tagName === 'INPUT' && event.target.type === 'range';
  if (isRangeInput) return;
  
  // 如果点击的不是检测区域，则取消区域选择
  const isDetectionRegion = event.target.closest('.detection-region');
  
  // 只有在点击区域外且有活动区域时取消选择，且不在拖动过程中
  if (!isDetectionRegion && !isRangeInput && activeRegion.value !== null && !isDragging.value) {
    activeRegion.value = null;
  }
};

// 组件挂载时添加事件监听
onMounted(() => {
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  
  // 添加全局点击事件监听，用于取消区域选择
  document.addEventListener('click', handleDocumentClick);
  
  // 处理触摸事件时避免滚动
  document.addEventListener('touchmove', (e) => {
    if (isDragging.value || isImageDragging.value) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // 添加滚动事件监听
  window.addEventListener('scroll', checkScrollPosition);
  
  // 初始检查滚动位置
  checkScrollPosition();
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('touchmove', null, { passive: false });
  window.removeEventListener('scroll', checkScrollPosition);
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
      
      // 缩放后执行一次颜色检测，但不频繁执行
      if (Math.abs(oldWidth - newWidth) > oldWidth * 0.05) {
        detectColors();
      }
    }
  }
};

// 处理触摸开始
const handleTouchStart = (event) => {
  // 如果正在拖动检测区域，不进行图片移动
  if (isDragging.value) return;
  
  if (event.touches.length === 1) {
    // 单指触摸 - 移动
    touchStartX.value = event.touches[0].clientX - imagePositionX.value;
    touchStartY.value = event.touches[0].clientY - imagePositionY.value;
  } else if (event.touches.length === 2) {
    // 双指触摸 - 缩放
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    lastTouchDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }
};

// 处理触摸移动
const handleTouchMove = (event) => {
  // 如果正在拖动检测区域，不进行图片移动
  if (isDragging.value) return;
  
  event.preventDefault();
  
  if (event.touches.length === 1) {
    // 单指移动
    const touch = event.touches[0];
    const newX = touch.clientX - touchStartX.value;
    const newY = touch.clientY - touchStartY.value;
    
    // 限制移动范围
    const container = editorContainer.value;
    const containerRect = container.getBoundingClientRect();
    
    imagePositionX.value = Math.min(Math.max(newX, -imageWidth.value + 100), containerRect.width - 100);
    imagePositionY.value = Math.min(Math.max(newY, -imageHeight.value + 100), containerRect.height - 100);
  } else if (event.touches.length === 2) {
    // 双指缩放
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    const scale = currentDistance / lastTouchDistance.value;
    const newWidth = imageWidth.value * scale;
    const newHeight = imageHeight.value * scale;
    
    // 限制缩放范围
    if (newWidth >= 200 && newWidth <= 2000) {
      imageWidth.value = newWidth;
      imageHeight.value = newHeight;
      lastTouchDistance.value = currentDistance;
      
      // 调整区域位置和大小
      adjustRegionsPosition();
      
      // 缩放后自动检测颜色
      detectColors();
    }
  }
};

// 处理触摸结束
const handleTouchEnd = () => {
  lastTouchDistance.value = 0;
};

// 在range滑块上的交互不应该取消区域选中
const handleRangeInteraction = (event) => {
  event.stopPropagation();
  
  // 延迟计算颜色，而不是实时计算，提高滑动流畅度
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    if (imageUrl.value) {
      detectColors();
    }
  }, 300);
};

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 检测滚动位置
const checkScrollPosition = () => {
  showBackToTop.value = window.scrollY > 1;
};

// 开始分析按钮处理 - 修复功能
const startAnalysis = () => {
  // // 检查是否所有颜色都已检测
  // if (!allColorsDetected.value) {
  //   alert('请先完成所有区域的颜色检测');
  //   return;
  // }
  
  // // 构建颜色数据
  // const colors = {
  //   forehead: detectionRegions.forehead.color,
  //   cheeks: ((color1, color2) => {
  //     // 计算左右脸颊的平均色
  //     const hex1 = color1.replace('#', '');
  //     const hex2 = color2.replace('#', '');
      
  //     const r1 = parseInt(hex1.substring(0, 2), 16);
  //     const g1 = parseInt(hex1.substring(2, 4), 16);
  //     const b1 = parseInt(hex1.substring(4, 6), 16);
      
  //     const r2 = parseInt(hex2.substring(0, 2), 16);
  //     const g2 = parseInt(hex2.substring(2, 4), 16);
  //     const b2 = parseInt(hex2.substring(4, 6), 16);
      
  //     const r = Math.round((r1 + r2) / 2);
  //     const g = Math.round((g1 + g2) / 2);
  //     const b = Math.round((b1 + b2) / 2);
      
  //     return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  //   })(detectionRegions.leftCheek.color, detectionRegions.rightCheek.color),
  //   neck: detectionRegions.neck.color,
  //   lips: detectionRegions.lips.color,
  //   hair: detectionRegions.hair.color,
  //   eyes: '#2F4F4F' // 由于无法准确检测，使用默认深灰色
  // };
  
  // // 保存到会话存储
  // console.log('保存颜色数据:', colors);
  // sessionStorage.setItem('colorSelection', JSON.stringify(colors));
  
  // // 导航到报告页面
  // router.push('/report');
  // 发射事件给父组件
  emit('submitColors');
};

// 监视区域变化自动检测颜色 - 优化节流
let updateTimer = null;
watch(
  () => [...Object.values(detectionRegions).map(r => [r.width, r.height, r.x, r.y])],
  () => {
    // 仅在未拖动状态下启动定时器
    if (!isDragging.value && !isImageDragging.value) {
      // 清除之前的定时器
      if (updateTimer) clearTimeout(updateTimer);
      
      // 设置延迟更新，减少频繁计算
      updateTimer = setTimeout(() => {
        // 只在图片加载后执行检测
        if (imageUrl.value) {
          detectColors();
        }
      }, 500); // 增加到500ms延迟，提高响应速度
    }
  },
  { deep: true }
);
</script>

<style scoped>
.photo-detection-container {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 增强iOS的滚动体验 */
}

.photo-container {
  aspect-ratio: 3/4;
  position: relative;
  overflow: hidden;
}

.fixed-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.image-container {
  position: absolute;
  cursor: move;
  transition: transform 0.1s ease-out;
}

.image-container.dragging {
  transition: none;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detection-region {
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detection-region:hover {
  border-color: #00aaff !important;
}

.detection-region.active {
  border-color: #00aaff !important;
  box-shadow: 0 0 0 2px rgba(0, 170, 255, 0.3);
}

.region-label {
  position: absolute;
  left: 50%;
  bottom: -25px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
}

.zoom-tip {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  pointer-events: none;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

/* 强化检测按钮的可见性 */
.detect-button {
  position: relative;
  z-index: 5;
}

/* 回到顶部按钮样式 */
.back-to-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.back-to-top-btn:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .photo-container {
    aspect-ratio: 1;
  }
  
  .region-label {
    font-size: 10px;
    bottom: -20px;
    padding: 1px 6px;
  }
  
  .detection-region {
    border-width: 1.5px;
  }
  
  /* 确保检测按钮在移动设备上足够大和明显 */
  .detect-button {
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem 0;
  }
  
  /* 移动设备上的回到顶部按钮 */
  .back-to-top-btn {
    width: 40px;
    height: 40px;
    bottom: 20px;
    right: 20px;
  }
}
</style> 