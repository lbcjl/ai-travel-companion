import { cn } from '@/utils/cn'
import { User, Bot } from 'lucide-react'
import { motion } from 'framer-motion'

export interface MessageBubbleProps {
	role: 'user' | 'assistant'
	content: string
	timestamp?: Date
}

export function MessageBubble({
	role,
	content,
	timestamp,
}: MessageBubbleProps) {
	const isUser = role === 'user'

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={cn(
				'flex gap-3 mb-4',
				isUser ? 'justify-end' : 'justify-start'
			)}
		>
			{!isUser && (
				<div className='flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white'>
					<Bot className='w-5 h-5' />
				</div>
			)}

			<div
				className={cn(
					'max-w-[70%] rounded-2xl px-4 py-3',
					isUser
						? 'bg-primary-500 text-white'
						: 'bg-white shadow-md text-neutral-800'
				)}
			>
				<p className='text-sm md:text-base whitespace-pre-wrap break-words'>
					{content}
				</p>

				{timestamp && (
					<p
						className={cn(
							'text-xs mt-2',
							isUser ? 'text-primary-100' : 'text-neutral-400'
						)}
					>
						{timestamp.toLocaleTimeString('zh-CN', {
							hour: '2-digit',
							minute: '2-digit',
						})}
					</p>
				)}
			</div>

			{isUser && (
				<div className='flex-shrink-0 w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center text-white'>
					<User className='w-5 h-5' />
				</div>
			)}
		</motion.div>
	)
}
