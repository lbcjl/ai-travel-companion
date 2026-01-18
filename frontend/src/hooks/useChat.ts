import { useState } from 'react'
import type { Conversation, Message } from '../types'
import { chatApi } from '../services/api'

export function useChat() {
	const [conversation, setConversation] = useState<Conversation | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const sendMessage = async (content: string) => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await chatApi.sendMessage({
				conversationId: conversation?.id,
				content,
			})

			setConversation(response.conversation)
			return response.message
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : '发送消息失败'
			setError(errorMessage)
			throw err
		} finally {
			setIsLoading(false)
		}
	}

	const startNewConversation = () => {
		setConversation(null)
		setError(null)
	}

	return {
		conversation,
		isLoading,
		error,
		sendMessage,
		startNewConversation,
	}
}
