import { useMemo } from 'react'
import { parseMarkdownTable } from '../utils/itineraryParser'
import './ItinerarySummaryCard.css'

interface ItinerarySummaryCardProps {
	content: string
}

export default function ItinerarySummaryCard({
	content,
}: ItinerarySummaryCardProps) {
	// Parse the content purely for stats display
	const { days, totalCost, locationCount } = useMemo(() => {
		const parsedDays = parseMarkdownTable(content)
		let cost = 0
		let count = 0

		parsedDays.forEach((day) => {
			count += day.locations.length
			// Try to aggregate daily costs if available, or individual spots
			if (day.dailyCost) {
				cost += day.dailyCost
			} else {
				day.locations.forEach((loc) => {
					const costMatch = loc.cost?.match(/\d+/)
					if (costMatch) cost += parseInt(costMatch[0])
				})
			}
		})

		return {
			days: parsedDays.length,
			totalCost: cost,
			locationCount: count,
		}
	}, [content])

	if (days === 0) return null

	return (
		<div className='itinerary-summary-card glass-panel'>
			<div className='card-content'>
				<div className='card-icon'>✈️</div>
				<div className='card-info'>
					<h3>{days} 天旅行规划</h3>
					<div className='card-stats'>
						{totalCost > 0 && (
							<span className='stat-tag'>💰 约 ¥{totalCost}</span>
						)}
						<span className='stat-tag'>📍 {locationCount} 个地点</span>
					</div>
				</div>
				<div className='card-actions'>
					<button className='toggle-btn router-link'>查看右侧详情 →</button>
				</div>
			</div>
			<div className='card-tip'>地图与详细行程已在右侧面板准备就绪</div>
		</div>
	)
}
