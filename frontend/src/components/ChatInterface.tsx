import { useEffect, useRef, useState, useMemo } from 'react'
import { useChat } from '../hooks/useChat'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import Toast from './Toast'
import ItineraryPanel from './ItineraryPanel'
import LoadingModal from './LoadingModal'
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

	// 提取最新的行程内容（来自最后一条 AI 消息）
	const latestItineraryContent = useMemo(() => {
		if (!conversation) return ''
		// 倒序查找最后一条包含表格的 Assistant 消息
		const lastAiMsg = [...conversation.messages]
			.reverse()
			.find(
				(m) =>
					m.role === 'assistant' &&
					(m.content.includes('| 序号 |') || m.content.includes('|--'))
			)
		return lastAiMsg ? lastAiMsg.content : ''
	}, [conversation])

	const handleSendMessage = async (content: string) => {
		try {
			await sendMessage(content)
		} catch (err) {
			console.error('发送消息失败:', err)
		}
	}

	return (
		<div className='app-container'>
			<LoadingModal isOpen={isLoading} />
			{/* 左侧：聊天区域 */}
			<div className='chat-sidebar'>
				<div className='chat-header'>
					<div className='header-content'>
						<div className='header-icon'>✈️</div>
						<div className='header-text'>
							<h1>智能旅游规划</h1>
							<p>AI 旅行助手</p>
						</div>
					</div>
					{conversation && (
						<button onClick={startNewConversation} className='new-chat-button'>
							<svg
								width='16'
								height='16'
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

				<div className='messages-container'>
					{!conversation ? (
						<div className='welcome-message'>
							<div className='welcome-icon'>🗺️</div>
							<h2>开始您的旅程</h2>
							<p>告诉我您的旅行计划，右侧将实时为您生成路线地图</p>
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
							</div>
						</div>
					) : (
						<div className='messages-list'>
							{conversation.messages.map((message) => (
								<MessageBubble key={message.id} message={message} />
							))}
							<div ref={messagesEndRef} />
						</div>
					)}
				</div>

				<div className='chat-input-wrapper'>
					<InputBox
						onSend={handleSendMessage}
						disabled={isLoading}
						placeholder={conversation ? '继续对话...' : '描述您的旅行需求...'}
					/>
				</div>
			</div>

			{/* 右侧：地图面板 */}
			<div className='map-panel'>
				<ItineraryPanel
					content={latestItineraryContent}
					loading={isLoading && !latestItineraryContent}
				/>
			</div>

			{/* 错误提示 */}
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
