import { create } from 'zustand'
import axios from 'axios'

export interface Message {
	id: string
	role: 'user' | 'assistant' | 'system'
	content: string
	timestamp: Date
}

interface ChatState {
	messages: Message[]
	isLoading: boolean
	error: string | null

	// Actions
	addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
	sendMessage: (content: string) => Promise<void>
	clearMessages: () => void
	setError: (error: string | null) => void
}

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const useChatStore = create<ChatState>((set, get) => ({
	messages: [],
	isLoading: false,
	error: null,

	addMessage: (message) => {
		const newMessage: Message = {
			...message,
			id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			timestamp: new Date(),
		}

		set((state) => ({
			messages: [...state.messages, newMessage],
		}))
	},

	sendMessage: async (content) => {
		const { addMessage, messages } = get()

		// 添加用户消息
		addMessage({ role: 'user', content })

		// 设置加载状态
		set({ isLoading: true, error: null })

		// 创建一个临时的 AI 消息用于流式更新
		const aiMessageId = `msg_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`
		let aiMessageContent = ''

		// 先添加一个空的 AI 消息
		set((state) => ({
			messages: [
				...state.messages,
				{
					id: aiMessageId,
					role: 'assistant' as const,
					content: '',
					timestamp: new Date(),
				},
			],
		}))

		try {
			// 构建消息历史（最近 10 条）
			const recentMessages = messages.slice(-10).map((msg) => ({
				role: msg.role,
				content: msg.content,
			}))

			// 使用 fetch 实现流式接收（SSE）
			const response = await fetch('/api/ai/chat/stream', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [...recentMessages, { role: 'user', content }],
				}),
			})

			if (!response.ok) {
				throw new Error('Stream request failed')
			}

			const reader = response.body?.getReader()
			const decoder = new TextDecoder()

			if (reader) {
				while (true) {
					const { done, value } = await reader.read()
					if (done) break

					const chunk = decoder.decode(value)
					const lines = chunk.split('\n')

					for (const line of lines) {
						if (line.startsWith('data:')) {
							try {
								const data = JSON.parse(line.slice(5))
								if (data.chunk && !data.done) {
									aiMessageContent += data.chunk
									// 更新 AI 消息内容
									set((state) => ({
										messages: state.messages.map((msg) =>
											msg.id === aiMessageId
												? { ...msg, content: aiMessageContent }
												: msg
										),
									}))
								}
							} catch (e) {
								// 忽略解析错误
							}
						}
					}
				}
			}

			set({ isLoading: false })
		} catch (error: any) {
			console.error('AI API Error:', error)

			const errorMessage =
				error.response?.data?.message || error.message || '网络错误，请稍后重试'

			set({
				isLoading: false,
				error: errorMessage,
			})

			// 更新错误消息
			set((state) => ({
				messages: state.messages.map((msg) =>
					msg.id === aiMessageId
						? { ...msg, content: `❌ 抱歉，出现了错误：${errorMessage}` }
						: msg
				),
			}))
		}
	},

	clearMessages: () => {
		set({ messages: [], error: null })
	},

	setError: (error) => {
		set({ error })
	},
}))
