import DayCard from './DayCard'
import { useItineraryParser } from '../hooks/useItineraryParser'
import ShareControls from './ShareControls'
import './ItineraryPanel.css'

interface ItineraryPanelProps {
	content: string
	loading?: boolean
}

export default function ItineraryPanel({
	content,
	loading = false,
}: ItineraryPanelProps) {
	const { days, loading: parsing } = useItineraryParser(content)

	const hasContent = days.length > 0
	// ... (keep logs if needed, but for brevity I omit them here or keep unchanged)

	return (
		<div className='itinerary-panel'>
			<div className='panel-header'>
				<div className='panel-title'>
					<span className='icon'>🗺️</span>
					<h2>行程安排</h2>
					{hasContent && (
						<span className='day-count-badge'>{days.length}天</span>
					)}
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					{(parsing || loading) && (
						<span className='status-tag'>正在规划路线...</span>
					)}
					{hasContent && <ShareControls targetId='itinerary-capture-area' />}
				</div>
			</div>

			<div className='panel-content card-list-view'>
				{hasContent ? (
					<div className='cards-container' id='itinerary-capture-area'>
						{days.map((day, index) => (
							<DayCard key={index} day={day} index={index} />
						))}
					</div>
				) : (
					// empty state
					<div className='empty-state'>
						<div className='empty-icon'>🌏</div>
						<h3>等待生成行程</h3>
						<p>在左侧与 AI 对话，生成的每天行程卡片将显示在这里。</p>
					</div>
				)}
			</div>
		</div>
	)
}
