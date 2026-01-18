import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// 启用 CORS（允许前端调用）
	app.enableCors({
		origin: process.env.FRONTEND_URL || 'http://localhost:5173',
		credentials: true,
	})

	// 启用全局验证管道
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	)

	// API 路由前缀
	app.setGlobalPrefix('api')

	const port = process.env.PORT || 3000
	await app.listen(port)

	console.log(`🚀 后端服务已启动: http://localhost:${port}/api`)
}

bootstrap()
