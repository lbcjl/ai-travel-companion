import { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import Toast from './Toast'
import './ChatInterface.css'

export default function ChatInterface() {
	const { conversation, isLoading, error, sendMessage, startNewConversation } =
		useChat()
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const [showToast, setShowToast] = useState(false)

	// 自动滚动到底部
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [conversation?.messages])

	// 错误提示 - 显示toast
	useEffect(() => {
		if (error) {
			setShowToast(true)
		}
	}, [error])

	const handleSendMessage = async (content: string) => {
		try {
			await sendMessage(content)
		} catch (err) {
			console.error('发送消息失败:', err)
		}
	}

	return (
		<div className='chat-interface'>
			{/* 顶部标题栏 */}
			<div className='chat-header'>
				<div className='header-content'>
					<div className='header-icon'>✈️</div>
					<div className='header-text'>
						<h1>智能旅游规划</h1>
						<p>AI 旅行助手，为您定制专属旅行方案</p>
					</div>
				</div>
				{conversation && (
					<button onClick={startNewConversation} className='new-chat-button'>
						<svg
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
						>
							<path d='M12 5v14M5 12h14' />
						</svg>
						新对话
					</button>
				)}
			</div>

			{/* 消息列表 */}
			<div className='messages-container'>
				{!conversation ? (
					<div className='welcome-message'>
						<div className='welcome-icon'>🗺️</div>
						<h2>开始您的旅程</h2>
						<p>告诉我您的旅行计划，我将为您生成详细的旅行方案</p>
						<div className='quick-starts'>
							<button
								onClick={() => handleSendMessage('我想去日本京都旅游5天')}
								className='quick-start-btn'
							>
								🇯🇵 京都5日游
							</button>
							<button
								onClick={() =>
									handleSendMessage('帮我规划上海周末游，预算3000元')
								}
								className='quick-start-btn'
							>
								🏙️ 上海周末游
							</button>
							<button
								onClick={() =>
									handleSendMessage('家庭游，带孩子去成都，喜欢美食和自然风光')
								}
								className='quick-start-btn'
							>
								🐼 成都亲子游
							</button>
						</div>
					</div>
				) : (
					<div className='messages-list'>
						{conversation.messages.map((message) => (
							<MessageBubble key={message.id} message={message} />
						))}
						{isLoading && (
							<div className='typing-indicator'>
								<div className='avatar ai-avatar'>
									<svg
										width='24'
										height='24'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
									>
										<path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
									</svg>
								</div>
								<div className='typing-dots'>
									<span></span>
									<span></span>
									<span></span>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* 输入框 */}
			<div className='chat-input'>
				<InputBox
					onSend={handleSendMessage}
					disabled={isLoading}
					placeholder={conversation ? '继续对话...' : '描述您的旅行需求...'}
				/>
			</div>

			{/* 错误提示Toast - 只在有错误时显示 */}
			{showToast && error && (
				<Toast
					message={error}
					type='error'
					onClose={() => setShowToast(false)}
				/>
			)}
		</div>
	)
}
