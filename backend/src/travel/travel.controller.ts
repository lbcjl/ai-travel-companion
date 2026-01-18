import {
	Controller,
	Get,
	Delete,
	Param,
	HttpCode,
	HttpStatus,
} from '@nestjs/common'
import { TravelService } from './travel.service'

@Controller('travel/plans')
export class TravelController {
	constructor(private readonly travelService: TravelService) {}

	/**
	 * 获取所有旅行方案
	 * GET /api/travel/plans
	 */
	@Get()
	async getAllPlans() {
		return this.travelService.getAllPlans()
	}

	/**
	 * 获取单个旅行方案
	 * GET /api/travel/plans/:id
	 */
	@Get(':id')
	async getPlan(@Param('id') id: string) {
		return this.travelService.getPlan(id)
	}

	/**
	 * 删除旅行方案
	 * DELETE /api/travel/plans/:id
	 */
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deletePlan(@Param('id') id: string) {
		await this.travelService.deletePlan(id)
	}
}
