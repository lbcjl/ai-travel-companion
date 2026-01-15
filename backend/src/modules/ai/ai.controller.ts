import { Controller, Post, Body, Res } from '@nestjs/common'
import type { Response } from 'express'
import { AiService } from './ai.service'

interface ChatRequestDto {
	messages: Array<{
		role: 'user' | 'assistant' | 'system'
		content: string
	}>
	temperature?: number
	maxTokens?: number
}

@Controller('ai')
export class AiController {
	constructor(private readonly aiService: AiService) {}

	@Post('chat')
	async chat(@Body() request: ChatRequestDto) {
		const systemPrompt = this.aiService.getTravelPlannerSystemPrompt()

		const messagesWithSystem = [
			{ role: 'system' as const, content: systemPrompt },
			...request.messages,
		]

		const response = await this.aiService.chat({
			messages: messagesWithSystem,
			temperature: request.temperature,
			maxTokens: request.maxTokens,
		})

		return {
			message: response,
			timestamp: new Date().toISOString(),
		}
	}

	@Post('chat/stream')
	async streamChat(@Body() request: ChatRequestDto, @Res() res: Response) {
		// 设置 SSE 响应头
		res.setHeader('Content-Type', 'text/event-stream')
		res.setHeader('Cache-Control', 'no-cache')
		res.setHeader('Connection', 'keep-alive')

		const systemPrompt = this.aiService.getTravelPlannerSystemPrompt()

		const messagesWithSystem = [
			{ role: 'system' as const, content: systemPrompt },
			...request.messages,
		]

		// 调用流式 API
		this.aiService.chatStream({
			messages: messagesWithSystem,
			temperature: request.temperature,
			maxTokens: request.maxTokens,
			onChunk: (chunk: string) => {
				res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`)
			},
			onComplete: () => {
				res.write(`data: ${JSON.stringify({ chunk: '', done: true })}\n\n`)
				res.end()
			},
			onError: (error: Error) => {
				res.write(
					`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`
				)
				res.end()
			},
		})
	}
}
