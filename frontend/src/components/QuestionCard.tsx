import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './QuestionCard.css'

interface QuestionCardProps {
	data: {
		intro?: string
		questions: string[]
	}
}

export default function QuestionCard({ data }: QuestionCardProps) {
	// Use structured JSON directly without regex parsing
	// Safe destructuring with defaults to prevent crash
	const { intro, questions = [] } = data || {}

	return (
		<div className='question-card'>
			<div className='question-header'>
				<span className='icon'>📝</span>
				<span className='title'>需要您的确认</span>
			</div>

			{intro && (
				<div className='question-intro markdown-body'>
					<ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown>
				</div>
			)}

			<div className='question-list'>
				{questions.map((q, idx) => (
					<div key={idx} className='question-item'>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{q}</ReactMarkdown>
					</div>
				))}
			</div>
		</div>
	)
}
