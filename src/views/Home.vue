<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <div class="content">
      <h1>个人色彩测试系统</h1>
      <p class="description">欢迎使用个人色彩测试系统，通过我们的测试可以帮助您找到最适合的色彩方案。</p>
      <div class="actions">
        <router-link to="/color-test" class="btn primary">开始测试</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  width: 100%;
  max-width: var(--content-max-width);
  padding: 2rem;
  text-align: center;
}

.content {
  background-color: var(--color-surface);
  padding: 3rem 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

h1 {
  color: var(--color-text);
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
}

.description {
  color: var(--color-text);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.9;
}

.actions {
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.btn.primary {
  background-color: var(--color-primary);
  color: var(--color-surface);
}

.btn.primary:hover {
  background-color: var(--color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .content {
    padding: 2rem 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .description {
    font-size: 1rem;
    padding: 0 1rem;
  }
}
</style> 