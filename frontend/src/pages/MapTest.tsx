import { useState } from 'react'
import RouteMap from '../components/RouteMap'
import { mapApi, Location, GeoCodeResult } from '../services/mapApi'
import './MapTest.css'

export default function MapTest() {
	const [locations, setLocations] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// 测试数据 - 使用北京的地址，并添加详细信息
	const testLocationsWithDetails: any[] = [
		{
			name: '故宫博物院',
			address: '北京市东城区景山前街4号',
			highlights: [
				'世界文化遗产',
				'中国明清两代的皇家宫殿',
				'珍贵文物约180万件',
			],
			food: ['故宫周边小吃街：豆汁、炒肝', '景山公园附近：老北京小吃'],
			transportation: {
				method: '地铁1号线转2号线',
				duration: '约20分钟',
				cost: '¥5',
			},
		},
		{
			name: '全聚德烤鸭店(前门店)',
			address: '北京市东城区前门大街30号',
			highlights: ['百年老字号', '烤鸭皮酥肉嫩', '独家秘制调料'],
			food: ['招牌烤鸭', '芥末鸭掌', '干烧四鲜'],
			transportation: {
				method: '步行',
				duration: '约10分钟',
				cost: '免费',
			},
		},
		{
			name: '天安门广场',
			address: '北京市东城区长安街',
			highlights: ['世界最大的城市广场', '升旗仪式（早晨）', '人民英雄纪念碑'],
			food: ['前门大街：老北京炸酱面', '大栅栏：糖葫芦、驴打滚'],
		},
	]

	const handleTestMap = async () => {
		setLoading(true)
		setError(null)

		try {
			// 先获取经纬度
			const locationsToGeocode = testLocationsWithDetails.map((loc) => ({
				name: loc.name,
				address: loc.address,
			}))

			const result = await mapApi.generateMap(locationsToGeocode)
			console.log('地图数据:', result)

			// 合并地理编码结果和详细信息
			const locationsWithMeta = result.locations.map((loc, index) => ({
				...loc,
				order: index + 1,
				type: index === 1 ? 'restaurant' : ('attraction' as any),
				time: index === 0 ? '09:00' : index === 1 ? '12:00' : '14:30',
				duration: index === 0 ? '120分钟' : index === 1 ? '90分钟' : '60分钟',
				cost: index === 0 ? '¥60' : index === 1 ? '¥280（人均）' : '免费',
				description: testLocationsWithDetails[index]?.name || '',
				highlights: testLocationsWithDetails[index]?.highlights || [],
				food: testLocationsWithDetails[index]?.food || [],
				transportation: testLocationsWithDetails[index]?.transportation,
			}))

			setLocations(locationsWithMeta)
		} catch (err: any) {
			setError(err.message || '加载地图失败')
			console.error('地图加载错误:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleTestGeocode = async () => {
		setLoading(true)
		setError(null)

		try {
			const result = await mapApi.geocode('北京市东城区景山前街4号')
			console.log('地理编码结果:', result)

			if (result) {
				setLocations([
					{
						...result,
						order: 1,
						type: 'attraction' as any,
						time: '09:00',
						duration: '120分钟',
						cost: '¥60',
						description: '世界文化遗产，中国明清两代的皇家宫殿',
						highlights: [
							'世界文化遗产',
							'中国明清两代的皇家宫殿',
							'珍贵文物约180万件',
						],
						food: ['故宫周边小吃街：豆汁、炒肝', '景山公园附近：老北京小吃'],
					},
				])
			}
		} catch (err: any) {
			setError(err.message || '地理编码失败')
			console.error('地理编码错误:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='map-test-container'>
			<div className='map-test-header'>
				<h1>🗺️ 高德地图功能测试</h1>
				<p>测试地理编码和地图显示功能（北京景点示例 + 详细信息）</p>
			</div>

			<div className='test-controls'>
				<button
					onClick={handleTestMap}
					disabled={loading}
					className='test-button primary'
				>
					{loading ? '加载中...' : '📍 测试详细信息地图（北京3景点）'}
				</button>

				<button
					onClick={handleTestGeocode}
					disabled={loading}
					className='test-button secondary'
				>
					{loading ? '加载中...' : '🔍 测试单个地点（故宫）'}
				</button>

				<button
					onClick={() => setLocations([])}
					disabled={loading}
					className='test-button danger'
				>
					🗑️ 清空地图
				</button>
			</div>

			{error && (
				<div className='test-error'>
					<p>❌ {error}</p>
				</div>
			)}

			{locations.length > 0 && (
				<div className='test-results'>
					<h2>地图显示 ({locations.length} 个位置)</h2>
					<p
						style={{
							textAlign: 'center',
							color: 'var(--color-text-secondary)',
							marginBottom: '16px',
						}}
					>
						💡 点击地图上的标记查看详细信息（好玩的、好吃的、交通）
					</p>
					<RouteMap locations={locations} height='600px' />

					<div className='locations-list'>
						<h3>位置列表：</h3>
						{locations.map((loc, index) => (
							<div key={index} className='location-item'>
								<span className='location-order'>{loc.order || index + 1}</span>
								<div className='location-details'>
									<strong>{loc.name}</strong>
									<p>{loc.address}</p>
									<small>
										坐标: {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
									</small>
									{loc.highlights && loc.highlights.length > 0 && (
										<p style={{ marginTop: '4px', fontSize: '0.85rem' }}>
											✨ {loc.highlights.join(' • ')}
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{locations.length === 0 && !loading && !error && (
				<div className='test-placeholder'>
					<p>👆 点击上方按钮开始测试</p>
					<p
						style={{
							fontSize: '0.9rem',
							color: 'var(--color-text-secondary)',
							marginTop: '8px',
						}}
					>
						注意：高德地图主要服务中国地区，使用北京景点测试
					</p>
				</div>
			)}
		</div>
	)
}
