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
	mapId?: string // 唯一ID，用于多实例
}

// ... imports ...

export default function RouteMap({
	locations,
	height = '500px',
	// mapId = 'amap-container',
}: RouteMapProps) {
	const mapContainer = useRef<HTMLDivElement>(null)
	const [mapLoaded, setMapLoaded] = useState(false)
	const [error, setError] = useState<string | null>(null)
	// const [warning, setWarning] = useState<string | null>(null)

	const AMAP_KEY = import.meta.env.VITE_AMAP_JS_API_KEY
	const AMAP_SECURITY_KEY = import.meta.env.VITE_AMAP_SECURITY_KEY

	// useEffect for loading script
	useEffect(() => {
		if (!AMAP_KEY) {
			setError('未配置高德地图API Key')
			return
		}

		if ((window as any).AMap) {
			setMapLoaded(true)
			return
		}

		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Driving`
		script.onerror = () => {
			setError('高德地图JSAPI加载失败')
		}
		script.onload = () => {
			;(window as any)._AMapSecurityConfig = {
				securityJsCode: AMAP_SECURITY_KEY,
			}
			setMapLoaded(true)
		}
		document.head.appendChild(script)

		return () => {
			document.head.removeChild(script)
			// 清理全局变量，防止内存泄漏
			delete (window as any).AMap
			delete (window as any)._AMapSecurityConfig
		}
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
			// Filter out locations with invalid coordinates
			const validLocations = locations.filter(
				(loc) =>
					typeof loc.lat === 'number' &&
					typeof loc.lng === 'number' &&
					!isNaN(loc.lat) &&
					!isNaN(loc.lng),
			)

			if (validLocations.length === 0) {
				console.warn('RouteMap: No valid locations to display')
				return
			}

			console.log(
				'初始化地图，中心点:',
				validLocations[0],
				'共',
				validLocations.length,
				'个有效地点',
			)

			// [Screenshot Fix] Monkey patch getContext to force preserveDrawingBuffer
			// This allows html2canvas to capture the WebGL canvas
			const originalGetContext = HTMLCanvasElement.prototype.getContext
			HTMLCanvasElement.prototype.getContext = function (
				type: string,
				attributes?: any,
			) {
				if (
					type === 'webgl' ||
					type === 'experimental-webgl' ||
					type === 'webgl2'
				) {
					attributes = {
						...attributes,
						preserveDrawingBuffer: true,
					}
				}
				return originalGetContext.call(this, type, attributes) as any
			}

			// 创建地图实例
			try {
				map = new AMap.Map(mapContainer.current, {
					resizeEnable: true,
					viewMode: '2D',
					zoom: 11,
					center: [validLocations[0].lng, validLocations[0].lat],
					mapStyle: 'amap://styles/whitesmoke',
				})
			} finally {
				// Restore original method
				HTMLCanvasElement.prototype.getContext = originalGetContext
			}

			// 添加自定义标记
			validLocations.forEach((location, index) => {
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
					validLocations,
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

			if (validLocations.length > 1) {
				// setWarning(null) // Reset warning

				// [Multi-City Check] 如果点与点之间距离过远（>300km），不使用驾车规划，直接用直线
				const isLongDistance = hasLongSemgent(validLocations, 300000) // 300km

				if (isLongDistance) {
					console.log('检测到长距离/跨城行程，切换为直线模式')
					// setWarning('跨城行程，显示直线路径') // Optional warning
					fallbackToPolyline(map, validLocations)
				} else {
					// 加载驾车路线规划插件
					AMap.plugin('AMap.Driving', () => {
						// 创建驾车路线规划实例
						driving = new AMap.Driving({
							map: map,
							hideMarkers: true,
							autoFitView: true,
						})

						// 构造起点、终点和途经点
						const start = new AMap.LngLat(
							validLocations[0].lng,
							validLocations[0].lat,
						)
						const end = new AMap.LngLat(
							validLocations[validLocations.length - 1].lng,
							validLocations[validLocations.length - 1].lat,
						)

						// 构造途经点（Driving 支持最多16个途经点）
						const waypoints = validLocations
							.slice(1, -1)
							.map((loc) => new AMap.LngLat(loc.lng, loc.lat))

						// 调用驾车路线规划
						driving.search(
							start,
							end,
							{ waypoints },
							(status: string, result: any) => {
								if (status === 'complete') {
									console.log('驾车路线规划成功')
								} else {
									console.warn('路线规划失败:', result)
									console.warn('路线规划服务不可用，已切换为直线模式')
									fallbackToPolyline(map, validLocations)
								}
							},
						)
					})
				}
			} else {
				map.setFitView()
			}
		} catch (err: any) {
			console.error('地图初始化错误:', err)
			setError(`地图初始化失败: ${err.message}`)
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
			showMsg: false, // Prevent message on segments
		})
		map.add(polyline)
		map.setFitView()
	}

	// 辅助：计算两点间距离是否超过阈值（单位：米）
	const hasLongSemgent = (locs: Location[], threshold: number) => {
		const AMap = (window as any).AMap
		for (let i = 0; i < locs.length - 1; i++) {
			const p1 = new AMap.LngLat(locs[i].lng, locs[i].lat)
			const p2 = new AMap.LngLat(locs[i + 1].lng, locs[i + 1].lat)
			const distance = p1.distance(p2)
			if (distance > threshold) {
				return true
			}
		}
		return false
	}

	// 生成信息窗口内容
	const generateInfoWindowContent = (
		location: Location,
		index: number,
		allLocations: Location[],
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
