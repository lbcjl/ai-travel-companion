import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm'
import { Conversation } from './conversation.entity'

export type MessageRole = 'user' | 'assistant' | 'system'

@Entity('messages')
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column()
	conversationId: string

	@ManyToOne(() => Conversation, (conversation) => conversation.messages, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'conversationId' })
	conversation: Conversation

	@Column({
		type: 'text',
	})
	role: MessageRole

	@Column('text')
	content: string

	@CreateDateColumn()
	timestamp: Date
}
