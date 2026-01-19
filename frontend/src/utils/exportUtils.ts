import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export const exportToPDF = async (elementId: string, filename: string) => {
	const element = document.getElementById(elementId)
	if (!element) return

	try {
		const canvas = await html2canvas(element, {
			scale: 2, // Improve quality
			useCORS: true,
			logging: false,
			backgroundColor: '#ffffff',
		})

		const imgData = canvas.toDataURL('image/jpeg', 0.95)
		const pdf = new jsPDF({
			orientation: 'p',
			unit: 'mm',
			format: 'a4',
		})

		const imgWidth = 210 // A4 width
		const pageHeight = 297 // A4 height
		const imgHeight = (canvas.height * imgWidth) / canvas.width
		let heightLeft = imgHeight
		let position = 0

		pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
		heightLeft -= pageHeight

		// Handle multi-page
		while (heightLeft >= 0) {
			position = heightLeft - imgHeight
			pdf.addPage()
			pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
			heightLeft -= pageHeight
		}

		pdf.save(`${filename}.pdf`)
	} catch (error) {
		console.error('Export PDF failed:', error)
		alert('导出 PDF 失败，请重试')
	}
}

export const exportToPoster = async (elementId: string, filename: string) => {
	const element = document.getElementById(elementId)
	if (!element) return

	try {
		const canvas = await html2canvas(element, {
			scale: 3, // High quality for poster
			useCORS: true,
			logging: false,
			backgroundColor: '#ffffff', // Ensure white background
		})

		const link = document.createElement('a')
		link.download = `${filename}.png`
		link.href = canvas.toDataURL('image/png')
		link.click()
	} catch (error) {
		console.error('Generate poster failed:', error)
		alert('生成海报失败，请重试')
	}
}
