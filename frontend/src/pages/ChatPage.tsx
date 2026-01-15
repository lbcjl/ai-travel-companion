import { ChatBox, ChatInput } from '@/components/chat'
import { useChatStore } from '@/store/chatStore'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function ChatPage() {
	const navigate = useNavigate()
	const location = useLocation()
	const { messages, isLoading, sendMessage, clearMessages } = useChatStore()

	// 接收从 Landing Page 传递的初始消息
	useEffect(() => {
		const state = location.state as { initialMessage?: string } | null
		if (state?.initialMessage && messages.length === 0) {
			// 自动发送初始消息
			sendMessage(state.initialMessage)
			// 清除 state，避免刷新时重复发送
			window.history.replaceState({}, document.title)
		}
	}, [location.state, messages.length, sendMessage])

	return (
		<div className='min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100'>
			{/* Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className='bg-white shadow-sm border-b border-neutral-200 px-4 py-4 flex items-center justify-between'
			>
				<div className='flex items-center gap-3'>
					<button
						onClick={() => navigate('/')}
						className='p-2 hover:bg-neutral-100 rounded-lg transition-colors'
					>
						<ArrowLeft className='w-5 h-5 text-neutral-600' />
					</button>

					<div>
						<h1 className='text-xl font-bold text-gradient'>TravelGenie</h1>
						<p className='text-xs text-neutral-500'>AI 旅行规划助手</p>
					</div>
				</div>

				{messages.length > 0 && (
					<button
						onClick={clearMessages}
						className='p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600'
						title='清空对话'
					>
						<Trash2 className='w-5 h-5' />
					</button>
				)}
			</motion.header>

			{/* Chat Container */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
				className='flex-1 flex flex-col max-w-4xl w-full mx-auto bg-white shadow-lg my-4 rounded-2xl overflow-hidden'
			>
				<ChatBox messages={messages} isLoading={isLoading} />
				<ChatInput onSend={sendMessage} disabled={isLoading} />
			</motion.div>
		</div>
	)
}
