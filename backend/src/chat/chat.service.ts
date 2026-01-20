import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Conversation } from '../entities/conversation.entity'
import { Message } from '../entities/message.entity'
import { LangChainService, LangChainMessage } from './langchain.service'

@Injectable()
export class ChatService {
	private readonly logger = new Logger(ChatService.name)

	constructor(
		@InjectRepository(Conversation)
		private conversationRepo: Repository<Conversation>,
		@InjectRepository(Message)
		private messageRepo: Repository<Message>,
		private langChainService: LangChainService,
	) {}

	/**
	 * 发送消息并获取 AI 回复 (流式)
	 */
	async sendMessageStream(
		conversationId: string | null,
		content: string, // Changed from userMessage to content logic
		user: any = null,
		timezone: string = 'Asia/Shanghai',
	): Promise<{
		stream: AsyncGenerator<string>
		conversationId: string
		onComplete: (fullContent: string) => Promise<void>
	}> {
		if (!content) {
			throw new Error('Content cannot be empty')
		}

		let conversation: Conversation

		// 如果没有指定会话，创建新会话
		if (!conversationId) {
			conversation = this.conversationRepo.create({
				title: content.substring(0, 20) + '...',
				userId: user ? user.id : null,
			})
			conversation = await this.conversationRepo.save(conversation)
			conversation.messages = [] // Initialize messages for new conversation
			this.logger.log(
				`创建新会话: ${conversation.id}, User: ${user ? user.email : 'Guest'}`,
			)
		} else {
			// 加载现有会话
			const foundConversation = await this.conversationRepo.findOne({
				where: { id: conversationId },
				relations: ['messages'],
			})

			if (!foundConversation) {
				throw new NotFoundException(`会话 ${conversationId} 不存在`)
			}
			conversation = foundConversation
		}

		// 保存用户消息
		const userMessage = this.messageRepo.create({
			conversation: conversation,
			role: 'user',
			content: content,
		})
		await this.messageRepo.save(userMessage)

		// 构建对话历史
		const historyMessages: LangChainMessage[] = conversation.messages.map(
			(msg) => ({
				role: msg.role as 'user' | 'assistant' | 'system',
				content: msg.content,
			}),
		)

		// 添加当前用户消息
		historyMessages.push({ role: 'user', content: content })

		// 调用 LangChain 流式接口
		this.logger.log(`调用 LangChain Stream API，会话: ${conversation.id}`)
		const stream = this.langChainService.chatStream(
			historyMessages,
			user,
			timezone,
		)

		return {
			stream,
			conversationId: conversation.id,
			onComplete: async (fullContent: string) => {
				// 保存 AI 回复
				const assistantMessage = this.messageRepo.create({
					conversation: conversation,
					role: 'assistant',
					content: fullContent,
				})
				await this.messageRepo.save(assistantMessage)
				// Update conversation's updatedAt field
				await this.conversationRepo.update(conversation.id, {
					updatedAt: new Date(),
				})
				this.logger.log(
					`流式响应完成，已保存完整消息。长度: ${fullContent.length}`,
				)
			},
		}
	}

	/**
	 * 发送消息并获取 AI 回复 (普通模式 - 保留兼容)
	 */
	async sendMessage(
		conversationId: string | null,
		content: string,
		user: any = null,
		timezone: string = 'Asia/Shanghai',
	): Promise<{ conversation: Conversation; assistantMessage: Message }> {
		if (!content) {
			throw new Error('Content cannot be empty')
		}

		let conversation: Conversation

		// 如果没有指定会话，创建新会话
		if (!conversationId) {
			conversation = this.conversationRepo.create({
				title: content.substring(0, 20) + '...',
				userId: user ? user.id : null,
			})
			conversation = await this.conversationRepo.save(conversation)
			conversation.messages = [] // Initialize messages for new conversation
			this.logger.log(
				`创建新会话: ${conversation.id}, User: ${user ? user.email : 'Guest'}`,
			)
		} else {
			// 加载现有会话
			const foundConversation = await this.conversationRepo.findOne({
				where: { id: conversationId },
				relations: ['messages'],
			})

			if (!foundConversation) {
				throw new NotFoundException(`会话 ${conversationId} 不存在`)
			}
			conversation = foundConversation
		}

		// 保存用户消息
		const userMessage = this.messageRepo.create({
			conversation: conversation,
			role: 'user',
			content: content,
		})
		await this.messageRepo.save(userMessage)

		// 构建对话历史
		const historyMessages: LangChainMessage[] = conversation.messages.map(
			(msg) => ({
				role: msg.role as 'user' | 'assistant' | 'system',
				content: msg.content,
			}),
		)

		// 添加当前用户消息
		historyMessages.push({ role: 'user', content: content })

		// 调用 LangChain
		this.logger.log(`调用 LangChain API，会话: ${conversation.id}`)
		const assistantReply = await this.langChainService.chat(
			historyMessages,
			user,
			timezone,
		)

		// 保存 AI 回复
		const assistantMessage = this.messageRepo.create({
			conversation: conversation,
			role: 'assistant',
			content: assistantReply,
		})
		await this.messageRepo.save(assistantMessage)

		// 重新加载会话（包含最新消息）
		const updatedConversation = await this.conversationRepo.findOne({
			where: { id: conversation.id },
			relations: ['messages'],
		})

		return {
			conversation: updatedConversation!,
			assistantMessage: assistantMessage,
		}
	}

	/**
	 * 获取所有会话列表 (仅返回属于当前用户的会话)
	 */
	async getConversations(userId: string | null): Promise<Conversation[]> {
		// 如果是 Guest (userId null)，目前策略是看不到任何历史（或只能看到本地存储的 ids，这里后端简单返回空）
		// 或者后期可以支持根据 deviceId 查
		if (!userId) {
			return []
		}

		return this.conversationRepo.find({
			where: { userId },
			relations: ['messages'],
			order: { updatedAt: 'DESC' },
		})
	}

	/**
	 * 获取单个会话详情
	 */
	async getConversation(
		id: string,
		userId: string | null = null,
	): Promise<Conversation> {
		const conversation = await this.conversationRepo.findOne({
			where: { id },
			relations: ['messages'],
		})

		if (conversation && conversation.userId && conversation.userId !== userId) {
			throw new NotFoundException(`会话 ${id} 不存在或无权访问`)
		}

		if (!conversation) {
			throw new NotFoundException(`会话 ${id} 不存在`)
		}

		return conversation
	}

	/**
	 * 删除会话
	 */
	async deleteConversation(
		id: string,
		userId: string | null = null,
	): Promise<void> {
		// 先检查是否存在且归属
		const conversation = await this.conversationRepo.findOne({ where: { id } })
		if (!conversation) {
			throw new NotFoundException(`会话 ${id} 不存在`)
		}
		if (conversation.userId && conversation.userId !== userId) {
			throw new NotFoundException(`会话 ${id} 不存在或无权操作`)
		}

		const result = await this.conversationRepo.delete(id)
		if (result.affected === 0) {
			throw new NotFoundException(`会话 ${id} 不存在`)
		}
		this.logger.log(`删除会话: ${id}`)
	}

	/**
	 * 清空所有会话
	 */
	async clearAllConversations(): Promise<void> {
		await this.conversationRepo.clear()
		this.logger.log('已清空所有会话')
	}

	/**
	 * 根据用户消息生成会话标题
	 */
	private generateTitle(message: string): string {
		// 简单截取前30个字符作为标题
		const maxLength = 30
		if (message.length <= maxLength) {
			return message
		}
		return message.substring(0, maxLength) + '...'
	}
}
