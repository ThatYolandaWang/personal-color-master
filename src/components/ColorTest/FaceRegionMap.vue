<template>
  <div class="face-region-map">
    <div class="face-image-container">
      <img src="@/assets/face.png" alt="面部区域图" class="face-image" />
      
      <!-- 前额区域标注 -->
      <div class="region-label forehead">
        <span class="label-text">前额</span>
        <div class="guide-line"></div>
      </div>
      
      <!-- 脸颊区域标注 -->
      <div class="region-label cheeks">
        <span class="label-text">脸颊</span>
        <div class="guide-line"></div>
      </div>
      
      <!-- 颈部区域标注 -->
      <div class="region-label neck">
        <span class="label-text">颈部</span>
        <div class="guide-line"></div>
      </div>
      
      <!-- 瞳色区域标注 -->
      <div class="region-label eyes">
        <span class="label-text">瞳色</span>
        <div class="guide-line"></div>
      </div>
      
      <!-- 唇色区域标注 -->
      <div class="region-label lips">
        <span class="label-text">唇色</span>
        <div class="guide-line"></div>
      </div>
      
      <!-- 发色区域标注 -->
      <div class="region-label hair">
        <span class="label-text">发色</span>
        <div class="guide-line"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.face-region-map {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
}

.face-image-container {
  position: relative;
  width: 100%;
  padding-top: 125%; /* 保持4:5的宽高比 */
}

.face-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.region-label {
  position: absolute;
  display: flex;
  align-items: center;
  z-index: 10;
  transition: all 0.3s ease;
}

.label-text {
  color: var(--color-text);
  background-color: var(--color-surface);
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.guide-line {
  height: 1px;
  background-color: var(--color-border);
  flex: 1;
  transition: all 0.3s ease;
}

.region-label:hover .guide-line {
  height: 2px;
  background-color: var(--color-primary);
}

/* 各区域位置 */
.forehead {
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column;
}

.forehead .guide-line {
  width: 1px;
  height: 30px;
  margin-top: 5px;
}

.cheeks {
  top: 40%;
  right: 5%;
  width: 80px;
}

.cheeks .guide-line {
  margin-right: 5px;
}

.neck {
  bottom: 25%;
  right: 5%;
  width: 80px;
}

.neck .guide-line {
  margin-right: 5px;
}

.eyes {
  top: 40%;
  left: 5%;
  width: 80px;
  flex-direction: row-reverse;
}

.eyes .guide-line {
  margin-left: 5px;
}

.lips {
  bottom: 35%;
  left: 5%;
  width: 80px;
  flex-direction: row-reverse;
}

.lips .guide-line {
  margin-left: 5px;
}

.hair {
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column;
}

.hair .guide-line {
  width: 1px;
  height: 20px;
  margin-bottom: 5px;
}

/* 暗色模式适配 */
:deep(.dark-mode) .label-text {
  background-color: var(--color-surface);
}
</style> 