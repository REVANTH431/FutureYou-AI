import { useState } from 'react'

export function ExportPdfButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (loading) return
    const root = document.getElementById('dashboard')
    if (!root) return

    setLoading(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(root, {
        backgroundColor: '#070712',
        scale: window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio || 1.5,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let position = 10
      let remaining = imgHeight

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, Math.min(imgHeight, pageHeight - 20))
      remaining -= pageHeight - 20

      while (remaining > 0) {
        pdf.addPage()
        position = 10
        pdf.addImage(
          imgData,
          'PNG',
          10,
          position,
          imgWidth,
          Math.min(imgHeight, pageHeight - 20),
          undefined,
          'FAST',
        )
        remaining -= pageHeight - 20
      }

      pdf.save('futureyou-results.pdf')
    } catch {
      // Silent fail; in a real app we might show a toast.
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="btn btn--ghost dash__export" onClick={handleExport} disabled={loading}>
      {loading ? 'Exporting…' : 'Export as PDF'}
    </button>
  )
}

