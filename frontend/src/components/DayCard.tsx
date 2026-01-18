import type { DayItinerary } from '../hooks/useItineraryParser'
import RouteMap from './RouteMap'
import './DayCard.css'

interface DayCardProps {
	day: DayItinerary
	index: number
}

export default function DayCard({ day, index }: DayCardProps) {
	// 简单的文字处理：将 "Day 1" 或 "第1天" 提取出来
	const title = day.day || `第 ${index + 1} 天`

	return (
		<div className='day-card'>
			<div className='day-header'>
				<div className='day-badge'>{index + 1}</div>
				<h3>{title}</h3>
			</div>

			<div className='day-timeline'>
				{day.locations.map((loc, idx) => (
					<div key={idx} className='timeline-item'>
						<div className='timeline-time'>{loc.time || '待定'}</div>
						<div className='timeline-content'>
							<div className='timeline-title'>
								<span className='loc-name'>{loc.name}</span>
								<span className={`loc-tag ${loc.type || 'attraction'}`}>
									{loc.type === 'restaurant'
										? '美食'
										: loc.type === 'hotel'
											? '住宿'
											: '景点'}
								</span>
							</div>
							<div className='timeline-desc'>
								{loc.description || loc.address}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className='day-map-wrapper'>
				<RouteMap
					locations={day.locations}
					height='300px'
					mapId={`day-${index}`}
				/>
			</div>
		</div>
	)
}
