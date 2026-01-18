import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TravelController } from './travel.controller'
import { TravelService } from './travel.service'
import { TravelPlan } from '../entities/travel-plan.entity'

@Module({
	imports: [TypeOrmModule.forFeature([TravelPlan])],
	controllers: [TravelController],
	providers: [TravelService],
	exports: [TravelService],
})
export class TravelModule {}
