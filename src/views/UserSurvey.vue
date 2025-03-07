<template>
  <div class="user-survey">
    <div class="survey-container">
      <h1>个人信息收集</h1>
      <p class="description">请填写以下信息，帮助我们为您提供更精准的色彩分析。</p>
      
      <form @submit.prevent="submitForm" class="survey-form">
        <div class="form-group">
          <label for="nickname">昵称</label>
          <input 
            type="text" 
            id="nickname" 
            v-model="userInfo.nickname" 
            required
            placeholder="请输入您的昵称"
          >
        </div>
        
        <div class="form-group">
          <label>性别</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="userInfo.gender" value="女" checked>
              <span>女</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="userInfo.gender" value="男">
              <span>男</span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label for="age">年龄段</label>
          <select id="age" v-model="userInfo.age" required>
            <option value="">请选择年龄段</option>
            <option value="18岁以下">18岁以下</option>
            <option value="18-25岁">18-25岁</option>
            <option value="26-35岁">26-35岁</option>
            <option value="36-45岁">36-45岁</option>
            <option value="46岁以上">46岁以上</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="occupation">职业</label>
          <select id="occupation" v-model="userInfo.occupation">
            <option value="">请选择职业</option>
            <option value="学生">学生</option>
            <option value="上班族">上班族</option>
            <option value="自由职业">自由职业</option>
            <option value="家庭主妇">家庭主妇</option>
            <option value="其他">其他</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="season">当前季节</label>
          <select id="season" v-model="userInfo.season" required>
            <option value="">请选择当前季节</option>
            <option value="春季">春季</option>
            <option value="夏季">夏季</option>
            <option value="秋季">秋季</option>
            <option value="冬季">冬季</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn primary">开始测试</button>
        </div>
      </form>
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
  season: ''
});

// 提交表单
const submitForm = () => {
  // 保存用户信息到 sessionStorage
  sessionStorage.setItem('userInfo', JSON.stringify(userInfo.value));
  
  // 跳转到色彩测试页面
  router.push('/color-test');
};
</script>

<style scoped>
.user-survey {
  width: 100%;
  max-width: var(--content-max-width);
  padding: 2rem;
}

.survey-container {
  background-color: var(--color-surface);
  padding: 3rem 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: var(--color-text);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.description {
  color: var(--color-text);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
  opacity: 0.9;
}

.survey-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: var(--color-text);
}

input[type="text"],
select {
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 1rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.btn {
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  cursor: pointer;
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
  .user-survey {
    padding: 1rem;
  }
  
  .survey-container {
    padding: 2rem 1rem;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  .description {
    font-size: 1rem;
  }
}
</style> 