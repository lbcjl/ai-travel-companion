import { useState, useEffect } from 'react'
import type { Location } from '../components/RouteMap'
import { mapApi } from '../services/mapApi'

export interface DayItinerary {
	day: string
	locations: Location[]
}

/**
 * 解析Markdown表格行，按天分组
 */
const parseMarkdownTable = (content: string): DayItinerary[] => {
	const lines = content.split('\n')
	const days: DayItinerary[] = []

	let currentDayTitle = '行程总览'
	let currentLocations: any[] = []
	let insideTable = false

	const flushCurrentDay = () => {
		if (currentLocations.length > 0) {
			// 如果已经存在相同title的天，合并进去（防止AI把同一天拆成两段写）
			const existingDay = days.find((d) => d.day === currentDayTitle)
			if (existingDay) {
				existingDay.locations = [...existingDay.locations, ...currentLocations]
			} else {
				days.push({
					day: currentDayTitle,
					locations: [...currentLocations],
				})
			}
			currentLocations = []
		}
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim()

		// 1. 检测日期标题 (e.g., "#### 第1天", "### Day 1", "#### 第三天")
		const dayMatch = line.match(
			/#{2,4}\s*(第[\d一二三四五六七八九十]+天|Day\s*\d+|D\d+)/i
		)
		if (dayMatch) {
			// 在开始新的一天前，保存上一天的数据
			if (insideTable) {
				insideTable = false
			}
			flushCurrentDay()
			currentDayTitle = dayMatch[1]
			continue
		}

		// 2. 检测表格开始
		if (
			line.startsWith('|') &&
			line.includes('序号') &&
			line.includes('名称') &&
			(line.includes('地址') || line.includes('位置'))
		) {
			insideTable = true
			continue
		}

		// 3. 跳过分隔行
		if (insideTable && line.startsWith('|') && line.includes('---')) {
			continue
		}

		// 4. 解析表格内容行
		if (insideTable && line.startsWith('|')) {
			const values = line
				.split('|')
				.map((v) => v.trim())
				.filter((v, index) => index > 0 || v !== '')

			if (values.length >= 4) {
				const cleanValues = line
					.split('|')
					.slice(1, -1)
					.map((v) => v.trim())

				const getVal = (index: number) => cleanValues[index] || ''

				// 必须要有名称和地址才算有效点
				const name = getVal(3)
				const address = getVal(4)

				if (name && address && address !== '-' && name !== '-') {
					const location: any = {}
					location.order = parseInt(getVal(0)) || currentLocations.length + 1
					location.time = getVal(1)
					location.type = mapTypeToEn(getVal(2))
					location.name = name
					location.address = address
					location.duration = getVal(5)
					location.cost = getVal(6)
					location.description = getVal(7)

					// 解析新增字段
					const highlightsStr = getVal(8)
					location.highlights =
						highlightsStr && highlightsStr !== '-'
							? highlightsStr.split(/[,、，]/).map((s) => s.trim())
							: []

					const foodStr = getVal(9)
					location.food =
						foodStr && foodStr !== '-'
							? foodStr.split(/[,、，]/).map((s) => s.trim())
							: []

					const transportStr = getVal(10)
					if (transportStr && transportStr !== '-') {
						location.transportation = {
							method: transportStr,
						}
					}

					currentLocations.push(location)
				}
			}
		} else if (insideTable && line === '') {
			// 表格结束
			insideTable = false
			flushCurrentDay()
		}
	}

	// 循环结束后再次flush
	flushCurrentDay()

	// 如果没有识别出任何日期，但有数据，默认给个名字
	if (days.length === 0 && currentLocations.length > 0) {
		days.push({ day: '行程', locations: currentLocations })
	}

	return days
}

const mapTypeToEn = (typeCb: string): 'attraction' | 'restaurant' | 'hotel' => {
	if (typeCb.includes('餐厅') || typeCb.includes('美食')) return 'restaurant'
	if (typeCb.includes('酒店') || typeCb.includes('住宿')) return 'hotel'
	return 'attraction'
}

export interface ItineraryParserResult {
	days: DayItinerary[]
	loading: boolean
}

export function useItineraryParser(content: string): ItineraryParserResult {
	const [days, setDays] = useState<DayItinerary[]>([])
	const [loading, setLoading] = useState(false)
	const [parsedContent, setParsedContent] = useState<string>('')

	useEffect(() => {
		if (!content) return
		if (content === parsedContent) return // 避免重复解析

		// 只有当内容看起来包含完整的表格时才解析
		if (!content.includes('| 序号 |') || !content.includes('|--')) {
			return
		}

		console.log('Parsing itinerary content...')
		const parsedDays = parseMarkdownTable(content)

		if (parsedDays.length > 0) {
			setLoading(true)
			setParsedContent(content)

			// 收集所有需要地理编码的地点 (Flat list)
			const allLocationsToGeo: {
				dayIndex: number
				locIndex: number
				name: string
				address: string
			}[] = []

			parsedDays.forEach((day, dIndex) => {
				day.locations.forEach((loc, lIndex) => {
					allLocationsToGeo.push({
						dayIndex: dIndex,
						locIndex: lIndex,
						name: loc.name,
						address: loc.address,
					})
				})
			})

			// 批量地理编码
			mapApi
				.generateMap(
					allLocationsToGeo.map((item) => ({
						name: item.name,
						address: item.address,
					}))
				)
				.then((data) => {
					const geoResults = data.locations

					// 让我们重写一下逻辑以确保正确归位
					// 第一步：将 flat 的 geoResults 映射回 days 结构
					let geoIndex = 0
					const updatedDays = parsedDays.map((day) => {
						const validDayLocations = day.locations.filter((loc) => {
							const geo = geoResults[geoIndex++]
							if (geo && geo.lat && geo.lng) {
								loc.lat = geo.lat
								loc.lng = geo.lng
								return true
							}
							console.warn(`Geocoding failed for: ${loc.name} (${loc.address})`)
							return false // 过滤掉无效点
						})
						return { ...day, locations: validDayLocations }
					})

					setDays(updatedDays)
				})
				.catch((err) => {
					console.error('Failed to geocode locations', err)
				})
				.finally(() => {
					setLoading(false)
				})
		}
	}, [content, parsedContent])

	return { days, loading }
}
