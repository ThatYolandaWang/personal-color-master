<!-- src/views/Report.vue -->
<template>
    <div class="report">
      <div class="report-container">
        <div class="report-content" ref="reportContent">
          <!-- 报告内容 -->
          <h1>个人色彩分析报告</h1>
          <div class="analysis-result">
            <!-- 这里展示AI分析结果 -->
          </div>
        </div>
        
        <div class="report-actions">
          <div class="size-selection">
            <label>选择尺寸:</label>
            <select v-model="selectedSize">
              <option value="9:16">9:16 (适合手机)</option>
              <option value="3:4">3:4</option>
              <option value="1:1">1:1 (方形)</option>
            </select>
          </div>
          
          <div class="share-buttons">
            <button @click="downloadReport">保存到本地</button>
            <button @click="shareToWechat">分享到朋友圈</button>
            <button @click="shareToXiaohongshu">分享到小红书</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import html2canvas from 'html2canvas'
  
  export default {
    name: 'Report',
    data() {
      return {
        selectedSize: '9:16',
        reportData: null
      }
    },
    methods: {
      async downloadReport() {
        try {
          const element = this.$refs.reportContent
          const canvas = await html2canvas(element)
          const link = document.createElement('a')
          link.download = '个人色彩分析报告.png'
          link.href = canvas.toDataURL()
          link.click()
        } catch (error) {
          console.error('导出报告失败:', error)
          alert('导出失败，请重试')
        }
      },
      shareToWechat() {
        // 实现微信分享功能
      },
      shareToXiaohongshu() {
        // 实现小红书分享功能
      }
    }
  }
  </script>
  
  <style scoped>
  .report {
    padding: 20px;
  }
  
  .report-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .report-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
  
  .report-actions {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .size-selection {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .share-buttons {
    display: flex;
    gap: 10px;
  }
  
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: #4CAF50;
    color: white;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  select {
    padding: 5px;
    border-radius: 4px;
  }
  </style>