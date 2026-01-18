import './LoadingModal.css'

interface LoadingModalProps {
	isOpen: boolean
}

export default function LoadingModal({ isOpen }: LoadingModalProps) {
	if (!isOpen) return null

	return (
		<div className='loading-modal-overlay'>
			<div className='loading-modal-content'>
				<div className='plane-animation'>
					<div className='plane'>✈️</div>
					<div className='cloud cloud-1'>☁️</div>
					<div className='cloud cloud-2'>☁️</div>
				</div>
				<h3>正在为您规划行程...</h3>
				<p>AI 正在分析最佳路线与景点</p>
			</div>
		</div>
	)
}
