export interface Message {
	id: string
	conversationId: string
	role: 'user' | 'assistant' | 'system'
	content: string
	timestamp: Date
}

export interface Conversation {
	id: string
	userId?: string
	title: string
	messages: Message[]
	createdAt: Date
	updatedAt: Date
}

export interface TravelPlan {
	id: string
	conversationId: string
	destination: string
	startDate?: Date
	endDate?: Date
	duration?: number
	budget?: number
	travelers?: number
	itinerary: DayItinerary[]
	accommodations?: Accommodation[]
	budgetBreakdown?: BudgetItem[]
	tips?: string[]
	createdAt: Date
}

export interface DayItinerary {
	day: number
	date?: Date
	activities: Activity[]
}

export interface Activity {
	time?: string
	title: string
	description?: string
	location?: string
	duration?: string
	cost?: number
	tips?: string
}

export interface Accommodation {
	name: string
	type: string
	priceRange: string
	location: string
	rating?: number
}

export interface BudgetItem {
	category: string
	amount: number
	description?: string
}
