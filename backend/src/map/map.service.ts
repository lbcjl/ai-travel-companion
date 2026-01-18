import { Injectable, Logger } from '@nestjs/common'
import { AmapService, Location, GeoCodeResult } from './amap.service'

@Injectable()
export class MapService {
	private readonly logger = new Logger(MapService.name)

	constructor(private amapService: AmapService) {}

	/**
	 * 为位置列表生成地图数据
	 */
	async generateMapData(locations: Location[]): Promise<{
		locations: GeoCodeResult[]
		mapImageUrl: string
	}> {
		// 批量地理编码
		const geocodedLocations = await this.amapService.batchGeocode(locations)

		if (geocodedLocations.length === 0) {
			throw new Error('无法获取任何有效的地理位置信息')
		}

		// 生成静态地图URL
		const mapImageUrl = this.amapService.generateStaticMapUrl(
			geocodedLocations,
			{
				width: 800,
				height: 600,
				zoom: 13,
			}
		)

		this.logger.log(`生成地图数据成功，位置数: ${geocodedLocations.length}`)

		return {
			locations: geocodedLocations,
			mapImageUrl,
		}
	}

	/**
	 * 单个地址地理编码
	 */
	async geocodeAddress(address: string): Promise<GeoCodeResult | null> {
		return this.amapService.geocode(address)
	}
}
