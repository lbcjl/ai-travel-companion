import './TravelPlanCard.css'

interface TravelPlanCardProps {
	content: string
}

// 提取旅行计划的关键信息
function extractTravelInfo(content: string) {
	const info: {
		destination?: string
		duration?: string
		budget?: string
		dayCount?: number
	} = {}

	const destMatch = content.match(/目的地[:：]\s*([^\n]+)/)
	if (destMatch) info.destination = destMatch[1].trim()

	const daysMatch = content.match(/(\d+)\s*天/)
	if (daysMatch) info.dayCount = parseInt(daysMatch[1])

	const budgetMatch = content.match(/预算[:：]\s*([^\n]+)/)
	if (budgetMatch) info.budget = budgetMatch[1].trim()

	return info
}

export default function TravelPlanCard({ content }: TravelPlanCardProps) {
	const info = extractTravelInfo(content)

	return (
		<div className='travel-plan-card'>
			<div className='plan-header'>
				<div className='plan-icon'>✅</div>
				<div className='plan-title'>
					<h3>行程规划已生成</h3>
					{info.destination && info.dayCount && (
						<p className='plan-budget'>
							{info.destination} · {info.dayCount}天
							{info.budget && ` · ${info.budget}`}
						</p>
					)}
				</div>
			</div>

			<div className='plan-sections'>
				<div className='plan-section'>
					<div className='section-content'>
						<p className='view-tip'>
							✨
							已为您生成完整的旅行方案，包括往返交通、住宿推荐和每日详细行程。
							<br />
							<strong>👉 请查看右侧地图面板了解详情</strong>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
