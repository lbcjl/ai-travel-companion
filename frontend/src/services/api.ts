import axios from 'axios'
import type { Conversation, Message } from '../types'

const api = axios.create({
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json',
	},
})

export interface SendMessageRequest {
	conversationId?: string
	content: string
}

export interface SendMessageResponse {
	conversationId: string
	message: string
	conversation: Conversation
}

export const chatApi = {
	// 发送消息
	async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
		const response = await api.post<SendMessageResponse>('/chat/message', data)
		return response.data
	},

	// 获取所有会话
	async getConversations(): Promise<Conversation[]> {
		const response = await api.get<Conversation[]>('/chat/conversations')
		return response.data
	},

	// 获取单个会话
	async getConversation(id: string): Promise<Conversation> {
		const response = await api.get<Conversation>(`/chat/${id}`)
		return response.data
	},

	// 删除会话
	async deleteConversation(id: string): Promise<void> {
		await api.delete(`/chat/${id}`)
	},
}
