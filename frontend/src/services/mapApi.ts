import axios from 'axios'

const api = axios.create({
	baseURL: '/api',
})

export interface Location {
	name: string
	address: string
	lat?: number
	lng?: number
}

export interface GeoCodeResult extends Location {
	location: string
	lat: number
	lng: number
}

export interface MapData {
	locations: GeoCodeResult[]
	mapImageUrl: string
}

/**
 * 地图API服务
 */
export const mapApi = {
	/**
	 * 单个地址地理编码
	 */
	async geocode(address: string): Promise<GeoCodeResult | null> {
		const response = await api.get('/map/geocode', {
			params: { address },
		})
		return response.data.data
	},

	/**
	 * 批量地理编码并生成地图
	 */
	async generateMap(locations: Location[]): Promise<MapData> {
		const response = await api.post('/map/generate', {
			locations,
		})
		return response.data.data
	},
}
