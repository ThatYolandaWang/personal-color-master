// DeepSeek API服务
import.meta.env.MODE === 'development' 
  ? console.log('DeepSeek API 开发环境') 
  : console.log('DeepSeek API 生产环境')

// 从环境变量获取配置
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const API_BASE_URL = import.meta.env.VITE_DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1'

// 检查API密钥是否存在
if (!API_KEY) {
  console.error('未找到DeepSeek API密钥，请确保在.env文件中设置了VITE_DEEPSEEK_API_KEY')
}

// 将RGB颜色转换为色调和明度描述
function analyzeColor(rgb) {
  const r = parseInt(rgb.slice(1, 3), 16)
  const g = parseInt(rgb.slice(3, 5), 16)
  const b = parseInt(rgb.slice(5, 7), 16)
  
  // 计算HSL
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 510 // 除以510是为了得到0-1的值
  
  let h, s
  if (max === min) {
    h = 0
  } else if (max === r) {
    h = 60 * ((g - b) / (max - min))
  } else if (max === g) {
    h = 60 * (2 + (b - r) / (max - min))
  } else {
    h = 60 * (4 + (r - g) / (max - min))
  }
  
  if (h < 0) h += 360
  
  if (max === min) {
    s = 0
  } else if (l <= 0.5) {
    s = (max - min) / (max + min)
  } else {
    s = (max - min) / (510 - max - min)
  }
  
  // 确定色调
  let tone
  if (s < 0.1) {
    tone = '中性'
  } else if (h >= 330 || h < 30) {
    tone = '暖'
  } else if (h >= 30 && h < 180) {
    tone = '暖'
  } else {
    tone = '冷'
  }
  
  // 确定明度
  let brightness
  if (l > 0.6) {
    brightness = '高'
  } else if (l > 0.3) {
    brightness = '中'
  } else {
    brightness = '低'
  }
  
  return { tone, brightness }
}

// 生成分析提示词
function generatePrompt(colors) {
  // 从sessionStorage获取用户信息
  let userInfo = {}
  try {
    const storedUserInfo = sessionStorage.getItem('userInfo')
    if (storedUserInfo) {
      userInfo = JSON.parse(storedUserInfo)
    }
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
  
  const { nickname = '', age = '26-35岁', gender = '女', occupation = '' } = userInfo
  
  // 根据当前日期自动判断季节
  const currentMonth = new Date().getMonth() + 1 // getMonth返回0-11
  const season = currentMonth >= 3 && currentMonth <= 5 ? '春季' :
                currentMonth >= 6 && currentMonth <= 8 ? '夏季' :
                currentMonth >= 9 && currentMonth <= 11 ? '秋季' : '冬季'
  
  // 分析每个颜色的色调和明度
  const foreheadAnalysis = analyzeColor(colors.forehead)
  const cheeksAnalysis = analyzeColor(colors.cheeks)
  const neckAnalysis = analyzeColor(colors.neck)
  const hairAnalysis = analyzeColor(colors.hair)
  const eyesAnalysis = analyzeColor(colors.eyes)
  const lipsAnalysis = analyzeColor(colors.lips)
  
  let promptPrefix = `我是${age}的中国${gender}`
  if (occupation) {
    promptPrefix += `，职业是${occupation}`
  }
  if (nickname) {
    promptPrefix += `，我的昵称是${nickname}`
  }
  
  return `${promptPrefix}，以下是我的面部色彩分析数据：

1. 皮肤特征：
    - 前额色值：${colors.forehead}，色调：${foreheadAnalysis.tone}，明度：${foreheadAnalysis.brightness}
    - 脸颊色值：${colors.cheeks}，色调：${cheeksAnalysis.tone}，明度：${cheeksAnalysis.brightness}
    - 颈部色值：${colors.neck}，色调：${neckAnalysis.tone}，明度：${neckAnalysis.brightness}
2. 自然发色：${colors.hair}，色调：${hairAnalysis.tone}，明度：${hairAnalysis.brightness}
3. 瞳孔颜色：${colors.eyes}，色调：${eyesAnalysis.tone}
4. 唇色：${colors.lips}，色调：${lipsAnalysis.tone}

请根据专业四季色彩理论分析我属于哪个季型（春夏秋冬）或细分季型（如春夏、夏秋等），并详细解释原因。

请提供以下建议：
1. 现在是${season}，请给我5种最适合的服装颜色搭配方案，并列举3位使用此色系的明星穿搭示例
2. 请推荐3-5种最适合我的饰品颜色和材质
3. 请给我详细的妆容建议，包括：底妆色号范围、腮红色系、眼影色系、口红色系，并尽量推荐具体产品
4. 请列出5种我应该避免的颜色，并解释原因`
}

// 调用DeepSeek API
async function analyzeColors(colors) {
  if (!API_KEY) {
    throw new Error('缺少API密钥，无法进行分析')
  }
  
  try {
    const prompt = generatePrompt(colors)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 50000) // 50秒超时
    
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API调用失败: ${response.status} ${errorData.error?.message || ''}`)
    }
    
    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('DeepSeek API调用错误:', error)
    if (error.name === 'AbortError') {
      throw new Error('分析请求超时，请稍后重试')
    }
    throw error
  }
}

export { analyzeColors } 