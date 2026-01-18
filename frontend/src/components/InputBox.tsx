import { useState, KeyboardEvent } from 'react'
import './InputBox.css'

interface InputBoxProps {
	onSend: (message: string) => void
	disabled?: boolean
	placeholder?: string
}

export default function InputBox({
	onSend,
	disabled,
	placeholder = '描述您的旅行需求...',
}: InputBoxProps) {
	const [input, setInput] = useState('')

	const handleSend = () => {
		const trimmed = input.trim()
		if (trimmed && !disabled) {
			onSend(trimmed)
			setInput('')
		}
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	return (
		<div className='input-box'>
			<textarea
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				rows={1}
				className='input-textarea'
			/>
			<button
				onClick={handleSend}
				disabled={!input.trim() || disabled}
				className='send-button'
				aria-label='发送消息'
			>
				{disabled ? (
					<span className='loading-spinner' />
				) : (
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
					>
						<path d='M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' />
					</svg>
				)}
			</button>
		</div>
	)
}
