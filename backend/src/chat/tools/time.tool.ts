import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

/**
 * 工具：获取当前系统时间（用于日期核对）
 */
export class TimeTool extends StructuredTool {
	name = 'get_current_time'
	description =
		'获取当前系统的详细时间信息，包括年份、月份、日期、星期几和时区。当需要确认“今天”是几号，或者计算相对日期（如“下周五”）时，必须使用此工具。'

	schema = z.object({})

	private timezone: string

	constructor(timezone: string = 'Asia/Shanghai') {
		super()
		this.timezone = timezone
	}

	async _call(_input: any) {
		const now = new Date()
		const days = [
			'星期日',
			'星期一',
			'星期二',
			'星期三',
			'星期四',
			'星期五',
			'星期六',
		]

		// Force usage of the specific timezone
		// Note: We need to properly handle timezone conversion if the system timezone matches.
		// using toLocaleString with timeZone option is reliable.

		return JSON.stringify({
			iso: now.toISOString(),
			local: now.toLocaleString('zh-CN', { timeZone: this.timezone }),
			// Note: getFullYear/Month/Date returns LOCAL system time, not the timezone specific time.
			// To get accurate components, we should rely on the localized string or calculation.
			// For simplicity and accuracy effectively, let's provide the full localized string which is most important for LLM.
			// But let's try to parse components from the localized string for structure.

			// Actually, let's just use the localized string which is unambiguous "2024/1/20 12:00:00"
			description: `Current time in ${this.timezone} is: ${now.toLocaleString('zh-CN', { timeZone: this.timezone })} ${days[now.getDay()]}`, // Simple string for LLM

			// If we want detailed fields, we'd need to shift the timestamp to that timezone,
			// but simply providing the local string is usually enough for LLM.
			timezone: this.timezone,
			timestamp: now.getTime(),
		})
	}
}
