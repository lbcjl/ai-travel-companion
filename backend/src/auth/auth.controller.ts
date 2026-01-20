import {
	Controller,
	Request,
	Post,
	UseGuards,
	Body,
	Get,
	Put,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {}

	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Request() req) {
		return this.authService.login(req.user)
	}

	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post('register')
	async register(@Body() registerDto: any) {
		return this.authService.register(registerDto)
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	async getProfile(@Request() req) {
		// req.user is now the full User entity from JwtStrategy
		return req.user
	}

	@UseGuards(AuthGuard('jwt'))
	@Put('profile')
	async updateProfile(@Request() req, @Body() body: any) {
		console.log('Update Profile Body:', JSON.stringify(body))
		// Update preferences or nickname
		return this.userService.updatePreferences(req.user.id, body.preferences)
	}
}
