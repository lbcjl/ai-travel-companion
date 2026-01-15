import { useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui'

interface ChatInputProps {
	onSend: (message: string) => void
	disabled?: boolean
	placeholder?: string
}

export function ChatInput({
	onSend,
	disabled = false,
	placeholder = '输入你的旅行想法...',
}: ChatInputProps) {
	const [message, setMessage] = useState('')

	const handleSend = () => {
		const trimmed = message.trim()
		if (!trimmed || disabled) return

		onSend(trimmed)
		setMessage('')
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Enter 发送，Shift+Enter 换行
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	return (
		<div className='border-t border-neutral-200 p-4 bg-white'>
			<div className='flex gap-3 items-end'>
				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					rows={3}
					className='flex-1 resize-none rounded-lg border-2 border-neutral-200 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
				/>

				<Button
					onClick={handleSend}
					disabled={disabled || !message.trim()}
					variant='primary'
					className='px-6 py-3 h-[60px]'
				>
					<Send className='w-5 h-5' />
				</Button>
			</div>

			<p className='text-xs text-neutral-400 mt-2'>
				按 Enter 发送，Shift + Enter 换行
			</p>
		</div>
	)
}
