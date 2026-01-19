import type { DayItinerary } from '../hooks/useItineraryParser'
import RouteMap, { Location as MapLocation } from './RouteMap'
import './DayCard.css'

interface DayCardProps {
	day: DayItinerary
	index: number
}

export default function DayCard({ day, index }: DayCardProps) {
	const title = day.day || `第 ${index + 1} 天`

	// 计算每日总花销
	const totalCost =
		day.dailyCost ||
		day.locations.reduce((sum, loc) => {
			const costMatch = loc.cost?.match(/\d+/)
			const costValue = costMatch ? parseInt(costMatch[0]) : 0
			return sum + costValue
		}, 0)

	return (
		<div className='day-card'>
			<div className='day-header'>
				<div className='day-badge'>{index + 1}</div>
				<div className='day-title-section'>
					<h3>{title}</h3>
					<div className='day-meta'>
						{day.weather && (
							<span className='weather-tag' title='天气'>
								☀️ {day.weather}
							</span>
						)}
						{totalCost > 0 && (
							<span className='cost-tag' title='预计花销'>
								💰 ¥{totalCost}
							</span>
						)}
					</div>
				</div>
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

							{/* New: Highlights & Food */}
							{(loc.highlights?.length || 0) > 0 && (
								<div className='timeline-extra'>
									<span className='extra-label'>✨ 亮点:</span>
									<div className='extra-tags'>
										{loc.highlights?.map((h, i) => (
											<span key={i} className='highlight-tag'>
												{h}
											</span>
										))}
									</div>
								</div>
							)}

							{(loc.food?.length || 0) > 0 && (
								<div className='timeline-extra'>
									<span className='extra-label'>🍜 推荐:</span>
									<div className='extra-tags'>
										{loc.food?.map((f, i) => (
											<span key={i} className='food-tag'>
												{f}
											</span>
										))}
									</div>
								</div>
							)}

							{/* New: Transportation to Next Stop */}
							{loc.transportation && (
								<div className='timeline-transport'>
									<div className='transport-icon'>↓</div>
									<div className='transport-info'>
										<span className='transport-method'>
											{loc.transportation.method || '前往下一站'}
										</span>
										{loc.transportation.duration && (
											<span className='transport-meta'>
												{loc.transportation.duration}
											</span>
										)}
										{loc.transportation.cost && (
											<span className='transport-meta'>
												{loc.transportation.cost}
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			<div className='day-map-wrapper'>
				<RouteMap
					locations={day.locations as unknown as MapLocation[]}
					height='300px'
					mapId={`day-${index}`}
				/>
			</div>
		</div>
	)
}
