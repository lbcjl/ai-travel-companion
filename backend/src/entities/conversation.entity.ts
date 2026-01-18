import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	OneToOne,
} from 'typeorm'
import { Message } from './message.entity'
import { TravelPlan } from './travel-plan.entity'

@Entity('conversations')
export class Conversation {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ nullable: true })
	userId?: string

	@Column({ default: '' })
	title: string // 对话标题（可根据第一条消息自动生成）

	@OneToMany(() => Message, (message) => message.conversation, {
		cascade: true,
		eager: true,
	})
	messages: Message[]

	@OneToOne(() => TravelPlan, (plan) => plan.conversation, {
		nullable: true,
	})
	travelPlan?: TravelPlan

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
