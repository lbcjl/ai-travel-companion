import { useEffect } from 'react'
import './Toast.css'

interface ToastProps {
	message: string
	type?: 'error' | 'success' | 'info'
	duration?: number
	onClose?: () => void
}

export default function Toast({
	message,
	type = 'error',
	duration = 3000,
	onClose,
}: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose?.()
		}, duration)

		return () => clearTimeout(timer)
	}, [duration, onClose])

	return (
		<div className={`toast toast-${type}`}>
			<div className='toast-icon'>
				{type === 'error' && (
					<svg
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
					>
						<circle cx='12' cy='12' r='10' />
						<path d='M12 8v4M12 16h.01' />
					</svg>
				)}
				{type === 'success' && (
					<svg
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
					>
						<path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
						<polyline points='22 4 12 14.01 9 11.01' />
					</svg>
				)}
			</div>
			<span className='toast-message'>{message}</span>
		</div>
	)
}
