import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserService } from '../user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey:
				configService.get<string>('JWT_SECRET') || 'defaultSecretChangeMe',
		})
	}

	async validate(payload: any) {
		// Payload contains the decoded JWT (e.g. { sub: userId, email: ... })
		const user = await this.userService.findById(payload.sub)
		if (!user) {
			throw new UnauthorizedException()
		}
		return user
	}
}
