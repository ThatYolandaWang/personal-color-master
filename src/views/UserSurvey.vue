<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
          <div class="p-4">
            <h1 class="display-5 text-center mb-3">个人信息收集</h1>
            <p class="lead text-center mb-4">请填写以下信息，帮助我们为您提供更精准的色彩分析。</p>
            
            <form @submit.prevent="submitForm">
              <div class="mb-4">
                <label for="nickname" class="form-label">昵称</label>
                <input 
                  type="text" 
                  class="form-control form-control-lg"
                  id="nickname" 
                  v-model="userInfo.nickname" 
                  required
                  placeholder="请输入您的昵称"
                >
              </div>
              
              <div class="mb-4">
                <label class="form-label d-block">性别</label>
                <div class="btn-group" role="group">
                  <input type="radio" class="btn-check" name="gender" id="female" v-model="userInfo.gender" value="女" checked>
                  <label class="btn btn-outline-primary" for="female">女</label>
                  
                  <input type="radio" class="btn-check" name="gender" id="male" v-model="userInfo.gender" value="男">
                  <label class="btn btn-outline-primary" for="male">男</label>
                </div>
              </div>
              
              <div class="mb-4">
                <label for="age" class="form-label">年龄段</label>
                <select 
                  id="age" 
                  class="form-select form-select-lg"
                  v-model="userInfo.age" 
                  required
                >
                  <option value="">请选择年龄段</option>
                  <option value="18岁以下">18岁以下</option>
                  <option value="18-25岁">18-25岁</option>
                  <option value="26-35岁">26-35岁</option>
                  <option value="36-45岁">36-45岁</option>
                  <option value="46岁以上">46岁以上</option>
                </select>
              </div>
              
              <div class="mb-4">
                <label for="occupation" class="form-label">职业</label>
                <select 
                  id="occupation" 
                  class="form-select form-select-lg"
                  v-model="userInfo.occupation"
                >
                  <option value="">请选择职业</option>
                  <option value="学生">学生</option>
                  <option value="上班族">上班族</option>
                  <option value="自由职业">自由职业</option>
                  <option value="家庭主妇">家庭主妇</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              
              <div class="d-grid gap-2 col-8 mx-auto">
                <button type="submit" class="btn btn-primary btn-lg">
                  开始测试
                  <i class="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </form>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 默认预设值，女性用户
const userInfo = ref({
  nickname: '',
  gender: '女',
  age: '',
  occupation: '',
});

// 提交表单
const submitForm = () => {
  // 保存用户信息到 sessionStorage
  sessionStorage.setItem('userInfo', JSON.stringify(userInfo.value));
  
  // 跳转到色彩测试页面，并自动选择照片检测模式
  router.push('/color-test?mode=auto');
};
</script>

<style scoped>
/* 移除所有自定义样式，完全使用Bootstrap类 */
</style> 