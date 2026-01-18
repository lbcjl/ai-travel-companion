import { Module } from '@nestjs/common'
import { MapController } from './map.controller'
import { MapService } from './map.service'
import { AmapService } from './amap.service'

@Module({
	controllers: [MapController],
	providers: [MapService, AmapService],
	exports: [MapService, AmapService],
})
export class MapModule {}
