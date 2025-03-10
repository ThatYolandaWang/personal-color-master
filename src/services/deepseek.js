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
  
  return `请根据以下用户色彩检测数据，生成一份专业的个人色彩分析报告。
要求完全按照具有专业色彩顾问级别的标准来分析，输出必须严格按照以下 JSON 格式：

{
  "colorType": "具体的色彩季型名称，例如：明亮冬季、柔和夏季、清新春季、深沉秋季等",
  "analysisReason": "详细解释为何用户属于这个色彩季型，包括肤色、发色、眼睛颜色的专业分析",
  "userProfile": {
    "summary": "对用户色彩特征的整体描述，以及这种特征适合的整体风格方向"
  },
  "colorCards": {
    "primary": ["主要色彩名称 #十六进制色码", "例如：宝蓝色 #0000CD", "至少6种颜色"],
    "secondary": ["次要色彩名称 #十六进制色码", "例如：玫红色 #FF00FF", "至少6种颜色"],
    "accent": ["点缀色彩名称 #十六进制色码", "例如：翡翠绿 #00C957", "至少3种颜色"]
  },
  "clothing": {
    "recommended": ["推荐服装色彩名称 #十六进制色码", "例如：正红色 #FF0000", "至少8种颜色"],
    "styles": ["适合的服装风格描述1", "适合的服装风格描述2", "至少8种风格描述"],
    "examples": ["具体服装单品示例1", "具体服装单品示例2", "至少4个示例"]
  },
  "makeup": {
    "foundation": ["适合的粉底色号名称 #十六进制色码", "至少4种色号"],
    "contour": "修容相关专业建议，50-100个字的详细描述",
    "eyeGuidance": "眼部妆容整体指导原则，50-100个字的专业建议",
    "eyeshadow": ["推荐眼影色彩名称 #十六进制色码", "例如：深紫色 #800080", "至少6种颜色"],
    "eyeliner": ["推荐眼线色彩名称 #十六进制色码", "例如：深灰色 #555555", "至少3种颜色"],
    "lipCheekGuidance": "唇部和腮红整体指导原则，50-100个字的专业建议",
    "lipstick": ["推荐唇膏色彩名称 #十六进制色码", "例如：樱桃红 #D2042D", "至少6种颜色"],
    "blush": ["推荐腮红色彩名称 #十六进制色码", "例如：珊瑚色 #FF7F50", "至少4种颜色"]
  },
  "hairColor": {
    "recommended": ["推荐发色名称 #十六进制色码", "例如：冷黑色 #010101", "至少6种颜色"],
    "avoid": ["应避免的发色名称 #十六进制色码", "例如：金黄色 #FFDF00", "至少4种颜色"]
  },
  "avoidZone": {
    "clothing": ["避免的服装色彩名称 #十六进制色码", "例如：橄榄绿 #808000", "至少6种颜色"],
    "makeup": ["避免的妆容色彩名称 #十六进制色码", "例如：橙棕色 #CC7722", "至少4种颜色"],
    "styles": ["避免的风格描述1", "避免的风格描述2", "至少4种风格描述"]
  },
  "celebrities": ["适合该色彩类型的明星示例1", "明星示例2", "至少3个明星"]
}

用户检测的色彩数据如下：
前额肤色：${colors.forehead}
脸颊肤色：${colors.cheeks}
颈部肤色：${colors.neck}
唇部颜色：${colors.lips}
发色：${colors.hair}
眼睛颜色：${colors.eyes}

分析要求：
1. 所有颜色必须包含准确的颜色名称和对应的十六进制色码（例如：宝蓝色 #0000CD）
2. 分析标准要符合专业色彩理论，色彩季型判定要精确
3. 所有建议应具体、可操作，避免模糊表述
4. 所有文字描述应该简洁专业，符合色彩顾问的表达方式
5. 推荐的颜色和风格必须与用户的色彩季型高度匹配
6. 确保生成的数据完全符合上述JSON格式，不要含有多余注释

请完全按照上述要求生成一份高质量的专业色彩分析报告。`;
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