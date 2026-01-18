import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TravelPlan } from '../entities/travel-plan.entity'

@Injectable()
export class TravelService {
	private readonly logger = new Logger(TravelService.name)

	constructor(
		@InjectRepository(TravelPlan)
		private travelPlanRepo: Repository<TravelPlan>
	) {}

	/**
	 * 获取所有旅行方案
	 */
	async getAllPlans(): Promise<TravelPlan[]> {
		return this.travelPlanRepo.find({
			relations: ['conversation'],
			order: { createdAt: 'DESC' },
		})
	}

	/**
	 * 获取单个旅行方案
	 */
	async getPlan(id: string): Promise<TravelPlan> {
		const plan = await this.travelPlanRepo.findOne({
			where: { id },
			relations: ['conversation'],
		})

		if (!plan) {
			throw new NotFoundException(`旅行方案 ${id} 不存在`)
		}

		return plan
	}

	/**
	 * 删除旅行方案
	 */
	async deletePlan(id: string): Promise<void> {
		const result = await this.travelPlanRepo.delete(id)
		if (result.affected === 0) {
			throw new NotFoundException(`旅行方案 ${id} 不存在`)
		}
		this.logger.log(`删除旅行方案: ${id}`)
	}
}
