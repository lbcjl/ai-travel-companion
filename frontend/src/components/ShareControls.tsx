import React, { useState } from 'react'
import { exportToPDF, exportToPoster } from '../utils/exportUtils'
import './ShareControls.css'

interface ShareControlsProps {
	targetId: string
	title?: string
}

const ShareControls: React.FC<ShareControlsProps> = ({
	targetId,
	title = '我的旅行计划',
}) => {
	const [isExporting, setIsExporting] = useState(false)

	const handlePDF = async () => {
		setIsExporting(true)
		await exportToPDF(targetId, title)
		setIsExporting(false)
	}

	const handlePoster = async () => {
		setIsExporting(true)
		await exportToPoster(targetId, title)
		setIsExporting(false)
	}

	return (
		<div className='share-controls'>
			<button
				className='share-btn'
				onClick={handlePDF}
				disabled={isExporting}
				title='导出 PDF'
			>
				{isExporting ? '...' : '📄'}
			</button>
			<button
				className='share-btn'
				onClick={handlePoster}
				disabled={isExporting}
				title='生成海报'
			>
				{isExporting ? '...' : '🖼️'}
			</button>
		</div>
	)
}

export default ShareControls
