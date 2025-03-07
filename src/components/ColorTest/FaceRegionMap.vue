<template>
  <div class="face-region-map">
    <svg viewBox="0 0 400 500" class="face-svg">
      <!-- 面部轮廓 -->
      <path d="M200,50 C300,50 350,150 350,250 C350,350 300,450 200,450 C100,450 50,350 50,250 C50,150 100,50 200,50" 
            fill="none" 
            stroke="var(--color-border)" 
            stroke-width="2"/>
      
      <!-- 前额区域 -->
      <path d="M120,120 C160,80 240,80 280,120" 
            fill="none" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5"/>
      <text x="200" y="100" text-anchor="middle" class="region-label">前额</text>
      <line x1="280" y1="100" x2="380" y2="80" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5" 
            class="guide-line"/>
      
      <!-- 脸颊区域 -->
      <path d="M120,200 C160,180 240,180 280,200" 
            fill="none" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5"/>
      <text x="320" y="200" text-anchor="start" class="region-label">脸颊</text>
      <line x1="300" y1="200" x2="380" y2="200" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5" 
            class="guide-line"/>
      
      <!-- 颈部区域 -->
      <path d="M150,350 C180,370 220,370 250,350" 
            fill="none" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5"/>
      <text x="320" y="350" text-anchor="start" class="region-label">颈部</text>
      <line x1="250" y1="350" x2="380" y2="350" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5" 
            class="guide-line"/>
      
      <!-- 眼睛区域 -->
      <ellipse cx="150" cy="180" rx="20" ry="10" 
               fill="none" 
               stroke="var(--color-border)"/>
      <ellipse cx="250" cy="180" rx="20" ry="10" 
               fill="none" 
               stroke="var(--color-border)"/>
      <text x="80" y="180" text-anchor="end" class="region-label">瞳色</text>
      <line x1="100" y1="180" x2="20" y2="180" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5" 
            class="guide-line"/>
      
      <!-- 嘴唇区域 -->
      <path d="M170,280 C200,290 230,280 230,280 C230,290 200,300 170,290 Z" 
            fill="none" 
            stroke="var(--color-border)"/>
      <text x="80" y="280" text-anchor="end" class="region-label">唇色</text>
      <line x1="100" y1="280" x2="20" y2="280" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5" 
            class="guide-line"/>
      
      <!-- 发际线 -->
      <path d="M100,120 C150,50 250,50 300,120" 
            fill="none" 
            stroke="var(--color-border)" 
            stroke-dasharray="5,5"/>
      <text x="200" y="30" text-anchor="middle" class="region-label">发色</text>
    </svg>
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

.face-svg {
  width: 100%;
  height: auto;
}

.region-label {
  fill: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}

.guide-line {
  transition: all 0.3s ease;
}

/* 悬停效果 */
.region-label:hover + .guide-line,
.guide-line:hover {
  stroke: var(--color-primary);
  stroke-width: 2;
}
</style> 