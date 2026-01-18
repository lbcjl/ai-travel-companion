import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChatOpenAI } from '@langchain/openai'
import {
	HumanMessage,
	SystemMessage,
	AIMessage,
} from '@langchain/core/messages'
import { WeatherService } from './weather.service'
import { GaodeService } from './gaode.service'

export interface LangChainMessage {
	role: 'system' | 'user' | 'assistant'
	content: string
}

@Injectable()
export class LangChainService {
	private readonly logger = new Logger(LangChainService.name)
	private readonly chatModel: ChatOpenAI

	// 旅行规划助手的系统提示词
	private readonly systemPrompt = `你是一位专业的旅行规划师助手。你的任务是通过与用户的对话，收集信息并规划行程。

## 🎯 必填信息收集
在开始生成方案前，你**必须**确认以下信息（如果用户没提供，请追问）：
1. **出发地**（非常重要！否则无法规划往返交通）
2. **目的地**（国家/城市）
3. **出行时间**（起止日期或天数）
4. **旅行预算**（人民币总额）

## ⛅ 实时天气参考
{weather_info}

## 📍 真实地点参考数据 (来自高德地图)
{poi_info}
*(请优先使用上述参考数据中的餐厅和酒店，如果不够用，请确保你推荐的其他地点也是真实存在的)*

## 📝 方案生成要求
当你收集到上述信息后，请生成一份**真实、详细**的旅行方案。方案必须包含以下板块：

### 1. 🚄 往返大交通（必须真实）
- **去程**：推荐具体的 1-2 个真实班次（高铁车次或航班号），注明：起止时间、耗时、预估票价。
- **返程**：同上。
- **真实性要求**：必须使用现实存在的车次/航班（如 G123, CA987），禁止臆造。

### 2. 🏨 住宿指南（必须基于真实数据）
- **推荐酒店**：必须提供**真实的酒店名称**（优先从上方参考数据中选择）。
- **选择理由**：基于真实地段分析（例如：“步行 5 分钟可达地铁 1 号线”）。
- **参考价格**：提供淡季/旺季的预估价格范围。

### 3. 📅 每日详细行程（必须用表格）
**必须使用以下表格格式**，每一天一个表格：

#### 第X天行程表

| 序号 | 时间 | 类型 | 名称 | 完整地址 | 停留时长 | 门票/人均 | 说明 | 好玩的 | 好吃的 | 交通(去下一站) |
|------|------|------|------|----------|----------|-----------|------|--------|--------|----------------|
| 1 | 09:00 | 景点 | 清水寺 | 京都市东山区清水1-294 | 120分钟 | ¥400 | 世界文化遗产 | 清水舞台、音羽瀑布 | 抹茶冰淇淋、豆腐料理 | 步行15分钟 |
| 2 | 12:00 | 餐厅 | 菊乃井本店 | 京都市东山区下河原通八坂鸟居前下る512 | 90分钟 | ¥300 | 米其林三星 | 怀石料理体验 | 怀石料理套餐 | 出租车10分钟(¥1000) |

**表格填写要求**：
- **仅包含目的地行程**：表格内**只记录在目的地城市内部**的游玩/餐饮/住宿/市内交通。
- **严禁包含大交通**：**绝对不要**把“从某地出发”、“抵达某机场”、“前往火车站返程”作为表格行！这些请写在“往返大交通”板块。
- **地址必须完整**：用于地图定位，必须包含"城市+区+街道+门牌号"。
- **真实性验证**：所有景点、餐厅必须真实存在，优先使用参考数据。
- **天气适配**：如果提示有雨/雪，请尽量安排室内活动，并在说明中备注。

### 4. 💰 预算明细
- 列出交通（往返+市内）、住宿、餐饮、门票的预估总价。

## 🚫 禁忌
- 严禁臆造不存在的航班号或车次。
- 严禁编造不存在的酒店或虚假地址。
- 如果不确定某个具体数据，请标注“需查询实时数据”，而不是瞎编。`

	constructor(
		private configService: ConfigService,
		private weatherService: WeatherService,
		private gaodeService: GaodeService
	) {
		const apiKey = this.configService.get<string>('QWEN_API_KEY')

		if (!apiKey) {
			throw new Error(
				'未配置 QWEN_API_KEY，请在 .env 文件中设置阿里云通义千问 API Key'
			)
		}

		// 使用 LangChain 的 ChatOpenAI，配置为通义千问端点
		this.chatModel = new ChatOpenAI({
			apiKey,
			model: this.configService.get<string>('QWEN_MODEL') || 'qwen-turbo',
			temperature: 0.7,
			maxTokens: 3000, // 增加 Token 上限以容纳更详细的方案
			configuration: {
				baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
			},
		})

		this.logger.log(`🧠 LangChain 服务已初始化，使用通义千问模型`)
	}

	/**
	 * 使用 LangChain 调用通义千问 API
	 */
	async chat(messages: LangChainMessage[]): Promise<string> {
		try {
			// 1. 简单的意图识别：提取目的地以获取天气和POI
			const lastUserMessage = messages
				.slice()
				.reverse()
				.find((m) => m.role === 'user')?.content

			let weatherInfo = ''
			let poiInfo = ''

			if (lastUserMessage) {
				// 简单的关键词提取
				const cityMatch = lastUserMessage.match(
					/(?:去|玩|游览|到)([\u4e00-\u9fa5]{2,5})/
				)
				const city = cityMatch ? cityMatch[1] : null

				if (city) {
					this.logger.log(
						`检测到目的地: ${city}，正在并发获取天气和高德POI数据...`
					)

					// 并发获取天气和POI数据
					const [weather, pois] = await Promise.all([
						this.weatherService.getWeather(city),
						this.gaodeService.getRecommendedPOIs(city),
					])

					if (weather) {
						weatherInfo = `\n**当前目的地(${city})天气参考**：\n${weather}\n请根据天气情况调整行程安排。`
					}

					if (pois) {
						poiInfo = pois
					}
				}
			}

			// 2. 注入天气和POI信息到 System Prompt
			let finalSystemPrompt = this.systemPrompt.replace(
				'{weather_info}',
				weatherInfo || '（暂无具体天气信息，请按一般季节性气候规划）'
			)

			finalSystemPrompt = finalSystemPrompt.replace(
				'{poi_info}',
				poiInfo ||
					'（暂无第三方推荐数据，请基于你的知识库推荐知名且真实的地点）'
			)

			// 3. 转换消息格式
			const langChainMessages = [
				new SystemMessage(finalSystemPrompt),
				...messages.map((msg) => {
					if (msg.role === 'user') {
						return new HumanMessage(msg.content)
					} else if (msg.role === 'assistant') {
						return new AIMessage(msg.content)
					} else {
						return new SystemMessage(msg.content)
					}
				}),
			]

			this.logger.debug(
				`调用 LangChain ChatModel，消息数: ${langChainMessages.length}`
			)

			// 4. 调用 LangChain
			const response = await this.chatModel.invoke(langChainMessages)

			const text = response.content as string
			this.logger.debug(`LangChain 回复: ${text.substring(0, 100)}...`)

			return text
		} catch (error) {
			this.logger.error('LangChain 调用失败', error)

			if (error.message?.includes('401')) {
				throw new Error('API Key 无效，请检查环境变量配置')
			}
			if (error.message?.includes('429')) {
				throw new Error('API 调用频率超限，请稍后再试')
			}

			throw new Error(`LangChain 调用失败: ${error.message || '未知错误'}`)
		}
	}
}
