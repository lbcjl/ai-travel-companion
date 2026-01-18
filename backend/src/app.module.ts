import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatModule } from './chat/chat.module'
import { TravelModule } from './travel/travel.module'
import { MapModule } from './map/map.module'
import { Conversation } from './entities/conversation.entity'
import { Message } from './entities/message.entity'
import { TravelPlan } from './entities/travel-plan.entity'

@Module({
	imports: [
		// 配置模块（加载环境变量）
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '../.env',
		}),

		// 数据库模块（TypeORM + SQLite）
		TypeOrmModule.forRoot({
			type: 'sqljs',
			location: process.env.DATABASE_PATH || './database.sqlite',
			autoSave: true,
			entities: [Conversation, Message, TravelPlan],
			synchronize: true, // 开发环境自动同步，生产环境应设为 false
			logging: false,
		}),

		// 业务模块
		ChatModule,
		TravelModule,
		MapModule,
	],
})
export class AppModule {}
