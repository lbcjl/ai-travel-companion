export interface Location {
	order?: number
	name: string
	address: string
	lat?: number
	lng?: number
	type?: 'attraction' | 'restaurant' | 'hotel'
	time?: string
	duration?: string
	cost?: string
	description?: string
	highlights?: string[]
	food?: string[]
	transportation?: {
		nextLocation?: string
		method?: string
		duration?: string
		cost?: string
	}
}

export interface DayItinerary {
	day: string
	locations: Location[]
	weather?: string
	dailyCost?: number
}

/**
 * 解析Markdown表格行，按天分组
 */
export const parseMarkdownTable = (content: string): DayItinerary[] => {
	const lines = content.split('\n')
	const days: DayItinerary[] = []

	let currentDayTitle = '行程总览'
	let currentLocations: any[] = []
	let currentWeather: string | undefined
	let currentDailyCost: number | undefined
	let insideTable = false

	// 动态表头索引
	let headerMap: { [key: string]: number } = {}

	const flushCurrentDay = () => {
		if (currentLocations.length > 0) {
			const existingDay = days.find((d) => d.day === currentDayTitle)
			if (existingDay) {
				existingDay.locations = [...existingDay.locations, ...currentLocations]
				// 如果已有天气信息，保留；否则尝试更新
				if (!existingDay.weather && currentWeather)
					existingDay.weather = currentWeather
				if (!existingDay.dailyCost && currentDailyCost)
					existingDay.dailyCost = currentDailyCost
			} else {
				days.push({
					day: currentDayTitle,
					locations: [...currentLocations],
					weather: currentWeather,
					dailyCost: currentDailyCost,
				})
			}
			currentLocations = []
			// 重置临时状态，但保留当前天标题直到下一个标题出现
			currentWeather = undefined
			currentDailyCost = undefined
		}
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim()

		// 1. 检测日期标题
		const dayMatch = line.match(
			/#{2,4}\s*(第[\d一二三四五六七八九十]+天|Day\s*\d+|D\d+)/i,
		)
		if (dayMatch) {
			if (insideTable) {
				insideTable = false
			}
			flushCurrentDay()
			currentDayTitle = dayMatch[1]
			continue
		}

		// 1.5 检测天气和花销
		const weatherMatch = line.match(
			/>\s*\*\*(?:天气|Weather)\*\*[：:]\s*([^\n]+)/i,
		)
		if (weatherMatch) {
			currentWeather = weatherMatch[1].trim()
			continue
		}

		const costMatch = line.match(
			/>\s*\*\*(?:今日预计花销|Daily Cost|预算|Cost)\*\*[：:]\s*([^\n]+)/i,
		)
		if (costMatch) {
			const costStr = costMatch[1].trim()
			const costNum = parseInt(costStr.replace(/[^\d]/g, ''))
			if (!isNaN(costNum)) {
				currentDailyCost = costNum
			}
			continue
		}

		// 2. 检测表格开始 (表头行)
		if (
			line.startsWith('|') &&
			line.includes('序号') &&
			(line.includes('名称') || line.includes('地点'))
		) {
			insideTable = true

			// 解析表头，建立索引映射
			const headers = line
				.split('|')
				.slice(1, -1)
				.map((h) => h.trim())

			headerMap = {}
			headers.forEach((h, idx) => {
				if (h.includes('序号')) headerMap['order'] = idx
				else if (h.includes('时间')) headerMap['time'] = idx
				else if (h.includes('名称') || h.includes('地点'))
					headerMap['name'] = idx
				else if (h.includes('地址') || h.includes('位置'))
					headerMap['address'] = idx
				else if (h.includes('类型')) headerMap['type'] = idx
				else if (h.includes('时长') || h.includes('建议时长'))
					headerMap['duration'] = idx
				else if (h.includes('费用') || h.includes('花费'))
					headerMap['cost'] = idx
				else if (h.includes('描述') || h.includes('备注'))
					headerMap['description'] = idx
				else if (h.includes('推荐') || h.includes('亮点'))
					headerMap['highlights'] = idx
				else if (h.includes('美食') || h.includes('餐饮'))
					headerMap['food'] = idx
				else if (h.includes('交通')) headerMap['transportation'] = idx
			})

			continue
		}

		// 3. 跳过分隔行
		if (insideTable && line.startsWith('|') && line.includes('---')) {
			continue
		}

		// 4. 解析表格内容行
		if (insideTable && line.startsWith('|')) {
			const dirtyValues = line.split('|')

			// 确保行是完整的（前后都有 |）
			if (dirtyValues.length < 3) continue

			const cleanValues = dirtyValues.slice(1, -1).map((v) => v.trim())

			// 辅助函数：根据表头获取值
			const getVal = (key: string) => {
				const idx = headerMap[key]
				if (idx !== undefined && idx < cleanValues.length) {
					return cleanValues[idx]
				}
				// 回退机制
				if (key === 'order') return cleanValues[0]
				if (key === 'time') return cleanValues[1]
				if (key === 'type') return cleanValues[2]
				if (key === 'name') return cleanValues[3]
				if (key === 'address') return cleanValues[4]
				return ''
			}

			const name = getVal('name')
			const address = getVal('address')

			const isTimeLike = (str: string) =>
				/^[\d:：\s-]+$/.test(str) && str.includes(':')

			const isInvalidName = (str: string) => {
				if (!str || str === '-') return true
				if (/^[\d\.]+\s*(分钟|min|h|小时|hours?)$/i.test(str)) return true
				if (/^\d+$/.test(str)) return true
				const invalidKeywords = [
					'未找到',
					'暂无',
					'待定',
					'无',
					'推荐',
					'建议时长',
					'费用',
				]
				if (invalidKeywords.includes(str)) return true
				return false
			}

			if (name && !isInvalidName(name) && !isTimeLike(name)) {
				const location: any = {}
				location.order =
					parseInt(getVal('order')) || currentLocations.length + 1
				location.time = getVal('time')
				location.type = mapTypeToEn(getVal('type'))
				location.name = name
				location.address = address && address !== '-' ? address : name
				location.duration = getVal('duration')
				location.cost = getVal('cost')
				location.description = getVal('description')

				// 解析数组字段
				const highlightsStr = getVal('highlights')
				location.highlights =
					highlightsStr && highlightsStr !== '-'
						? highlightsStr.split(/[,、，]/).map((s) => s.trim())
						: []

				const foodStr = getVal('food')
				location.food =
					foodStr && foodStr !== '-'
						? foodStr.split(/[,、，]/).map((s) => s.trim())
						: []

				const transportStr = getVal('transportation')
				if (transportStr && transportStr !== '-') {
					location.transportation = { method: transportStr }
				}

				currentLocations.push(location)
			}
		} else if (insideTable && line === '') {
			insideTable = false
			flushCurrentDay()
		}
	}

	flushCurrentDay()

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
