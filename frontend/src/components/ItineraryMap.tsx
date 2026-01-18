import { useState, useEffect } from 'react'
import RouteMap from './RouteMap'
import { useItineraryParser } from '../hooks/useItineraryParser'
import './ItineraryMap.css'

interface ItineraryMapProps {
	content: string
}

export default function ItineraryMap({ content }: ItineraryMapProps) {
	const { days, loading } = useItineraryParser(content)
	const [activeDayIndex, setActiveDayIndex] = useState(0)

	// 当解析数据更新且当前选中的天数失效时，重置为第一天
	useEffect(() => {
		if (days.length > 0 && activeDayIndex >= days.length) {
			setActiveDayIndex(0)
		}
	}, [days, activeDayIndex])

	if (days.length === 0 && !loading) return null

	const currentLocations = days.length > 0 ? days[activeDayIndex].locations : []

	return (
		<div className='itinerary-map-container'>
			<div className='itinerary-map-header'>
				<div className='map-title'>
					<span className='icon'>🗺️</span>
					{days.length > 1 ? '行程路线图' : '路线地图'}
				</div>
				{loading && <span className='map-status'>正在为您生成路线地图...</span>}
			</div>

			{days.length > 1 && (
				<div className='itinerary-day-tabs'>
					{days.map((day, index) => (
						<button
							key={index}
							className={`day-tab ${activeDayIndex === index ? 'active' : ''}`}
							onClick={() => setActiveDayIndex(index)}
						>
							{day.day}
						</button>
					))}
					{/* 可选：添加总览按钮 */}
					{/* <button className={`day-tab ${activeDayIndex === -1 ? 'active' : ''}`} onClick={() => setActiveDayIndex(-1)}>总览</button> */}
				</div>
			)}

			<div className='map-wrapper'>
				<RouteMap locations={currentLocations} />
			</div>
		</div>
	)
}
