import { useEffect, useRef } from 'react'
import { MessageBubble, MessageBubbleProps } from './MessageBubble'
import { Loader2 } from 'lucide-react'

interface Message extends MessageBubbleProps {
	id: string
}

interface ChatBoxProps {
	messages: Message[]
	isLoading?: boolean
}

export function ChatBox({ messages, isLoading }: ChatBoxProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// 自动滚动到最新消息
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages, isLoading])

	return (
		<div className='flex-1 overflow-y-auto p-6 space-y-4'>
			{messages.length === 0 && !isLoading && (
				<div className='h-full flex flex-col items-center justify-center text-neutral-400'>
					<p className='text-lg mb-2'>👋 你好！我是 TravelGenie</p>
					<p className='text-sm'>告诉我你的旅行计划，我来帮你规划吧！</p>
				</div>
			)}

			{messages.map((message) => (
				<MessageBubble
					key={message.id}
					role={message.role}
					content={message.content}
					timestamp={message.timestamp}
				/>
			))}

			{isLoading && (
				<div className='flex gap-3 mb-4'>
					<div className='flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white'>
						<Loader2 className='w-5 h-5 animate-spin' />
					</div>
					<div className='bg-white shadow-md rounded-2xl px-4 py-3'>
						<div className='flex gap-2'>
							<span
								className='w-2 h-2 bg-neutral-400 rounded-full animate-bounce'
								style={{ animationDelay: '0ms' }}
							></span>
							<span
								className='w-2 h-2 bg-neutral-400 rounded-full animate-bounce'
								style={{ animationDelay: '150ms' }}
							></span>
							<span
								className='w-2 h-2 bg-neutral-400 rounded-full animate-bounce'
								style={{ animationDelay: '300ms' }}
							></span>
						</div>
					</div>
				</div>
			)}

			<div ref={messagesEndRef} />
		</div>
	)
}
