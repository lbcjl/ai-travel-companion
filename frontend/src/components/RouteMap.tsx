import { useEffect, useRef, useState } from 'react'
import './RouteMap.css'

export interface Location {
	order?: number
	name: string
	address: string
	lat: number
	lng: number
	type?: 'attraction' | 'restaurant' | 'hotel'
	time?: string
	duration?: string // 停留时长，如 "120分钟"
	cost?: string // 费用，如 "¥400"
	description?: string // 景点介绍/说明
	highlights?: string[] // 亮点/特色（好玩的）
	food?: string[] // 美食推荐（好吃的）
	transportation?: {
		// 去下一个点的交通
		nextLocation?: string
		method?: string // 交通方式，如 "地铁2号线"
		duration?: string // 时长，如 "15分钟"
		cost?: string // 费用，如 "¥3"
	}
}

interface RouteMapProps {
	locations: Location[]
	height?: string
}

// 高德地图API Key和安全密钥（从环境变量读取）
const AMAP_KEY = import.meta.env.VITE_AMAP_JS_API_KEY || ''
const AMAP_SECURITY_KEY = import.meta.env.VITE_AMAP_SECURITY_KEY || ''

export default function RouteMap({
	locations,
	height = '500px',
}: RouteMapProps) {
	const mapContainer = useRef<HTMLDivElement>(null)
	const [mapLoaded, setMapLoaded] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!AMAP_KEY) {
			setError('未配置高德地图API Key，请在 .env 中设置 VITE_AMAP_JS_API_KEY')
			return
		}

		// 如果配置了安全密钥，设置全局变量（必须在加载SDK之前设置）
		if (AMAP_SECURITY_KEY) {
			;(window as any)._AMapSecurityConfig = {
				securityJsCode: AMAP_SECURITY_KEY,
			}
		}

		// 加载高德地图SDK和插件
		const loadAmapScript = () => {
			return new Promise<void>((resolve, reject) => {
				if ((window as any).AMap && (window as any).AMap.Driving) {
					resolve()
					return
				}

				const script = document.createElement('script')
				// 添加 plugin=AMap.Driving 参数加载驾车规划插件
				script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Driving`
				script.async = true
				script.onload = () => {
					if ((window as any).AMap) {
						resolve()
					} else {
						reject(new Error('高德地图SDK加载失败'))
					}
				}
				script.onerror = () =>
					reject(new Error('高德地图SDK加载失败，请检查网络连接'))
				document.head.appendChild(script)
			})
		}

		loadAmapScript()
			.then(() => {
				setMapLoaded(true)
				setError(null)
			})
			.catch((err) => {
				setError(err.message)
				console.error('高德地图加载失败:', err)
			})
	}, [])

	useEffect(() => {
		if (!mapLoaded || !mapContainer.current || locations.length === 0) {
			return
		}

		const AMap = (window as any).AMap
		if (!AMap) {
			setError('高德地图SDK未加载')
			return
		}

		let map: any = null
		let driving: any = null

		try {
			// 创建地图实例
			map = new AMap.Map(mapContainer.current, {
				zoom: 13,
				center: [locations[0].lng, locations[0].lat],
				viewMode: '3D',
				mapStyle: 'amap://styles/whitesmoke', // 使用浅色地图样式
			})

			// 添加自定义标记
			locations.forEach((location, index) => {
				const markerContent = document.createElement('div')
				markerContent.className = 'custom-marker'
				markerContent.innerHTML = `
          <div class="marker-number">${location.order || index + 1}</div>
          <div class="marker-pin"></div>
        `

				const marker = new AMap.Marker({
					position: [location.lng, location.lat],
					content: markerContent,
					anchor: 'bottom-center', // 底部中心对准坐标点
					zIndex: 100 + index, // 确保标记在路线上方
				})

				const infoContent = generateInfoWindowContent(
					location,
					index,
					locations
				)
				const infoWindow = new AMap.InfoWindow({
					content: infoContent,
					offset: new AMap.Pixel(0, -30),
				})

				marker.on('click', () => {
					infoWindow.open(map, marker.getPosition())
				})

				map.add(marker)
			})

			// 绘制真实道路路线
			if (locations.length > 1) {
				// 创建驾车路线规划实例
				driving = new AMap.Driving({
					map: map,
					hideMarkers: true, // 隐藏默认标记，使用我们的自定义标记
					showTraffic: false, // 不显示路况
					autoFitView: true, // 自动缩放
				})

				// 构造起点、终点和途经点
				const start = new AMap.LngLat(locations[0].lng, locations[0].lat)
				const end = new AMap.LngLat(
					locations[locations.length - 1].lng,
					locations[locations.length - 1].lat
				)

				// 途经点（中间的所有点）
				const waypoints = locations
					.slice(1, -1)
					.map((loc) => new AMap.LngLat(loc.lng, loc.lat))

				// 搜索路线
				driving.search(
					start,
					end,
					{ waypoints },
					(status: string, result: any) => {
						if (status === 'complete') {
							console.log('真实路线规划成功')
						} else {
							console.error('路线规划失败:', result)
							// 失败时降级为直线
							fallbackToPolyline(map, locations)
						}
					}
				)
			} else {
				map.setFitView()
			}
		} catch (err: any) {
			console.error('地图初始化错误:', err)
			// setError(`地图初始化失败: ${err.message}`);
		}

		return () => {
			if (driving) {
				driving.clear()
			}
			if (map) {
				try {
					map.destroy()
				} catch (e) {
					console.error('地图销毁错误:', e)
				}
			}
		}
	}, [mapLoaded, locations])

	// 降级方案：直线Polyline
	const fallbackToPolyline = (map: any, locs: Location[]) => {
		const AMap = (window as any).AMap
		const path = locs.map((loc) => [loc.lng, loc.lat])
		const polyline = new AMap.Polyline({
			path: path,
			strokeColor: '#3366FF',
			strokeWeight: 6,
			strokeOpacity: 0.9,
			isOutline: true,
			outlineColor: 'white',
			borderWeight: 2,
			lineJoin: 'round',
			lineCap: 'round',
			zIndex: 50,
			showDir: true,
		})
		map.add(polyline)
		map.setFitView()
	}

	// 生成信息窗口内容
	const generateInfoWindowContent = (
		location: Location,
		index: number,
		allLocations: Location[]
	) => {
		const nextLocation =
			index < allLocations.length - 1 ? allLocations[index + 1] : null

		return `
      <div class="amap-info-window">
        <div class="info-header">
          <span class="info-badge">${location.order || index + 1}</span>
          <h3>${location.name}</h3>
          <span class="info-type">${getTypeName(location.type)}</span>
        </div>
        
        ${
					location.time
						? `
          <div class="info-row">
            <span class="info-icon">⏰</span>
            <span><strong>时间：</strong>${location.time}${location.duration ? ` (${location.duration})` : ''}</span>
          </div>
        `
						: ''
				}
        
        <div class="info-row">
          <span class="info-icon">📍</span>
          <span><strong>地址：</strong>${location.address}</span>
        </div>
        
        ${
					location.cost
						? `
          <div class="info-row">
            <span class="info-icon">💰</span>
            <span><strong>费用：</strong>${location.cost}</span>
          </div>
        `
						: ''
				}
        
        ${
					location.description
						? `
          <div class="info-section">
            <div class="info-section-title">📝 说明</div>
            <p>${location.description}</p>
          </div>
        `
						: ''
				}
        
        ${
					location.highlights && location.highlights.length > 0
						? `
          <div class="info-section">
            <div class="info-section-title">✨ 好玩的</div>
            <ul class="info-list">
              ${location.highlights.map((h) => `<li>${h}</li>`).join('')}
            </ul>
          </div>
        `
						: ''
				}
        
        ${
					location.food && location.food.length > 0
						? `
          <div class="info-section">
            <div class="info-section-title">🍜 好吃的</div>
            <ul class="info-list">
              ${location.food.map((f) => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        `
						: ''
				}
        
        ${
					nextLocation && location.transportation
						? `
          <div class="info-section transportation">
            <div class="info-section-title">🚇 前往下一站</div>
            <div class="transportation-detail">
              <div class="next-location">→ ${nextLocation.name}</div>
              ${location.transportation.method ? `<div>方式：${location.transportation.method}</div>` : ''}
              ${location.transportation.duration ? `<div>时长：${location.transportation.duration}</div>` : ''}
              ${location.transportation.cost ? `<div>费用：${location.transportation.cost}</div>` : ''}
            </div>
          </div>
        `
						: ''
				}
      </div>
    `
	}

	const getTypeName = (type?: string) => {
		const nameMap: Record<string, string> = {
			attraction: '景点',
			restaurant: '餐厅',
			hotel: '酒店',
		}
		return nameMap[type || 'attraction'] || '地点'
	}

	if (error) {
		return (
			<div className='map-error' style={{ height }}>
				<p>⚠️ {error}</p>
				{!AMAP_KEY && (
					<small style={{ marginTop: '8px', display: 'block', opacity: 0.7 }}>
						请在 .env 中配置 VITE_AMAP_JS_API_KEY
					</small>
				)}
			</div>
		)
	}

	if (!mapLoaded) {
		return (
			<div className='map-loading' style={{ height }}>
				<div className='loading-spinner'></div>
				<p>加载地图中...</p>
			</div>
		)
	}

	return (
		<div className='route-map-container'>
			<div ref={mapContainer} className='route-map' style={{ height }}></div>
		</div>
	)
}
