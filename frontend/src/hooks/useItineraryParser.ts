import { useState, useEffect } from 'react'
import { mapApi } from '../services/mapApi'
import { parseMarkdownTable, DayItinerary } from '../utils/itineraryParser'

export type { DayItinerary }

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
					})),
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
