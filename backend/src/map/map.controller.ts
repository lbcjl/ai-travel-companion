import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { MapService } from './map.service'
import { BatchGeocodeRequestDto, GeocodeRequestDto } from './dto/location.dto'

@Controller('map')
export class MapController {
	constructor(private mapService: MapService) {}

	/**
	 * 单个地址地理编码
	 */
	@Get('geocode')
	async geocode(@Query() dto: GeocodeRequestDto) {
		const result = await this.mapService.geocodeAddress(dto.address)
		return {
			success: !!result,
			data: result,
		}
	}

	/**
	 * 批量地理编码并生成地图
	 */
	@Post('generate')
	async generateMap(@Body() dto: BatchGeocodeRequestDto) {
		console.log(
			`[MapController] Received generate request. Locations: ${dto.locations.length}, City: ${dto.city}`,
		)
		const result = await this.mapService.generateMapData(
			dto.locations,
			dto.city,
		)
		return {
			success: true,
			data: result,
		}
	}
}
