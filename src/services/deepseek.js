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
  
  return `请根据以下用户信息和色彩检测数据，生成一份个人色彩分析报告。
输出必须严格按照以下 JSON 格式：

{
  "colorType": "春/夏/秋/冬季型及子分类",
  "analysisReason": "色彩类型判定的依据和原因",
  "userProfile": {
    "summary": "用户色彩特征总结"
  },
  "clothing": {
    "recommended": ["推荐色彩1", "推荐色彩2", "..."],
    "styles": ["适合风格1", "适合风格2", "..."],
    "examples": ["具体单品描述1", "具体单品描述2", "..."]
  },
  "makeup": {
    "foundation": "适合的粉底色号范围",
    "lipstick": ["适合的唇色1", "适合的唇色2", "..."],
    "eyeshadow": ["适合的眼影色1", "适合的眼影色2", "..."],
    "blush": ["适合的腮红色1", "适合的腮红色2", "..."]
  },
  "hairColor": {
    "recommended": ["推荐发色1", "推荐发色2", "..."],
    "avoid": ["不推荐发色1", "不推荐发色2", "..."]
  },
  "avoidZone": {
    "clothing": ["避免的服装色彩1", "避免的服装色彩2", "..."],
    "makeup": ["避免的妆容色彩1", "避免的妆容色彩2", "..."],
    "styles": ["避免的风格1", "避免的风格2", "..."]
  },
  "colorCards": {
    "primary": ["主要配色代码1", "主要配色代码2", "..."],
    "secondary": ["次要配色代码1", "次要配色代码2", "..."],
    "accent": ["点缀配色代码1", "点缀配色代码2", "..."]
  },
  "celebrities": ["适合该色彩类型的明星1", "明星2", "明星3"]
}

用户信息：
姓名：${nickname || '用户'}
性别：${gender}
年龄：${age}
职业：${occupation || '未知'}

色彩检测数据：
前额肤色：${colors.forehead}，色调：${foreheadAnalysis.tone}，明度：${foreheadAnalysis.brightness}
脸颊肤色：${colors.cheeks}，色调：${cheeksAnalysis.tone}，明度：${cheeksAnalysis.brightness}
颈部肤色：${colors.neck}，色调：${neckAnalysis.tone}，明度：${neckAnalysis.brightness}
唇部颜色：${colors.lips}，色调：${lipsAnalysis.tone}
发色：${colors.hair}，色调：${hairAnalysis.tone}，明度：${hairAnalysis.brightness}
眼睛颜色：${colors.eyes}，色调：${eyesAnalysis.tone}

当前季节是${season}，请确保推荐内容适合当前季节。
请提供专业、个性化的色彩分析和建议，包括详细的服装搭配、妆容和发色建议，以及应该避免的色彩。
注意：颜色推荐必须包含具体的色彩名称和对应的色彩代码（十六进制格式，如#FF5733）。
对于明星示例，请优先选择中国或亚洲明星。
务必以有效的JSON格式返回，不要包含任何额外的说明或注释。`
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
    const content = data.choices[0].message.content
    
    // 尝试解析JSON响应
    try {
      // 去除可能的代码标记（如```json和```）
      const cleanContent = content.replace(/```json|```/g, '').trim()
      const jsonResult = JSON.parse(cleanContent)
      return jsonResult
    } catch (jsonError) {
      console.warn('无法解析JSON响应，返回原始文本', jsonError)
      return content // 如果解析失败，返回原始文本
    }
  } catch (error) {
    console.error('DeepSeek API调用错误:', error)
    if (error.name === 'AbortError') {
      throw new Error('分析请求超时，请稍后重试')
    }
    throw error
  }
}

export { analyzeColors } 