export async function extractTextFromPDF(file) {
  // Use CDN worker — local worker URL resolution breaks in Vite prod builds on Vercel
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    // Join items, preserving spacing between words
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ')
      .replace(/\s{2,}/g, ' ')
    fullText += pageText + '\n\n'
  }

  const trimmed = fullText.trim()
  if (!trimmed) throw new Error('No text could be extracted from this PDF. It may be a scanned image PDF.')

  return { text: trimmed, pages: pdf.numPages }
}

export async function extractTextFromDocx(file) {
  // For docx we read as text (works for plain docx content)
  const text = await file.text()
  return { text: text.trim(), pages: 1 }
}

export async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return extractTextFromPDF(file)
  return extractTextFromDocx(file)
}
