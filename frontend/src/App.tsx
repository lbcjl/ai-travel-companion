import ChatInterface from './components/ChatInterface'
import MapTest from './pages/MapTest'
import './App.css'

function App() {
	// 检查URL参数，如果包含 ?test=map 则显示测试页面
	const isTestMode = window.location.search.includes('test=map')

	return <>{isTestMode ? <MapTest /> : <ChatInterface />}</>
}

export default App
