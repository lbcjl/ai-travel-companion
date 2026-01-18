import {
	Controller,
	Get,
	Post,
	Delete,
	Body,
	Param,
	HttpCode,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import { ChatService } from './chat.service'
import { SendMessageDto } from './dto/send-message.dto'

@Controller('chat')
export class ChatController {
	private readonly logger = new Logger(ChatController.name)

	constructor(private readonly chatService: ChatService) {}

	/**
	 * 发送消息
	 * POST /api/chat/message
	 */
	@Post('message')
	@HttpCode(HttpStatus.OK)
	async sendMessage(@Body() dto: SendMessageDto) {
		this.logger.log(
			`收到消息: 会话=${dto.conversationId || '新会话'}, 内容="${dto.content.substring(0, 50)}..."`
		)

		const result = await this.chatService.sendMessage(
			dto.conversationId || null,
			dto.content
		)

		return {
			conversationId: result.conversation.id,
			message: result.assistantMessage,
			conversation: result.conversation,
		}
	}

	/**
	 * 获取所有会话列表
	 * GET /api/chat/conversations
	 */
	@Get('conversations')
	async getConversations() {
		return this.chatService.getConversations()
	}

	/**
	 * 获取单个会话详情
	 * GET /api/chat/:id
	 */
	@Get(':id')
	async getConversation(@Param('id') id: string) {
		return this.chatService.getConversation(id)
	}

	/**
	 * 删除会话
	 * DELETE /api/chat/:id
	 */
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteConversation(@Param('id') id: string) {
		await this.chatService.deleteConversation(id)
	}
}
