import {
	IsString,
	IsOptional,
	IsNumber,
	ValidateNested,
	IsArray,
} from 'class-validator'
import { Type } from 'class-transformer'

export class LocationDto {
	@IsString()
	name: string

	@IsString()
	address: string

	@IsOptional()
	@IsNumber()
	lat?: number

	@IsOptional()
	@IsNumber()
	lng?: number
}

export class GeocodeRequestDto {
	@IsString()
	address: string

	@IsOptional()
	@IsString()
	city?: string
}

export class BatchGeocodeRequestDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => LocationDto)
	locations: LocationDto[]

	@IsOptional()
	@IsString()
	city?: string
}
