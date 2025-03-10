<!-- src/views/Home.vue -->
<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8">
        <div class="p-4 p-md-5 text-center">
          <img src="@/assets/logo.png" alt="个人色彩管家" class="img-fluid mb-4" style="max-width: 200px;">
          <h1 class="display-4 mb-4">个人色彩管家</h1>
          <p class="lead mb-5">欢迎使用个人色彩管家，通过我们的测试可以帮助您找到最适合的色彩方案。</p>
          <div class="d-grid gap-2 col-6 mx-auto">
            <router-link to="/user-survey" class="btn btn-primary btn-lg">
              开始测试
              <i class="bi bi-arrow-right ms-2"></i>
            </router-link>
          </div>
        </div>
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
/* 移除所有自定义样式，完全使用Bootstrap类 */
</style> 