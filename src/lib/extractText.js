import { logger } from './logger'

export async function extractTextFromPDF(file) {
  logger.log('PDF', `Starting extraction: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)

  let pdfjsLib
  try {
    pdfjsLib = await import('pdfjs-dist')
    logger.ok('PDF', 'pdfjs-dist imported successfully', { version: pdfjsLib.version })
  } catch (err) {
    logger.error('PDF', 'Failed to import pdfjs-dist', err)
    throw err
  }

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    logger.log('PDF', 'Worker src set to CDN')
  } catch (err) {
    logger.error('PDF', 'Failed to set workerSrc', err)
    throw err
  }

  let arrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer()
    logger.ok('PDF', `File read into ArrayBuffer: ${arrayBuffer.byteLength} bytes`)
  } catch (err) {
    logger.error('PDF', 'Failed to read file as ArrayBuffer', err)
    throw err
  }

  let pdf
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    pdf = await loadingTask.promise
    logger.ok('PDF', `PDF loaded: ${pdf.numPages} page(s)`)
  } catch (err) {
    logger.error('PDF', 'pdfjs failed to parse the document', err)
    throw err
  }

  let fullText = ''
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s{2,}/g, ' ')
      fullText += pageText + '\n\n'
      logger.log('PDF', `Page ${i}/${pdf.numPages}: ${pageText.length} chars extracted`)
    }
  } catch (err) {
    logger.error('PDF', 'Error while extracting page text', err)
    throw err
  }

  const trimmed = fullText.trim()
  if (!trimmed) {
    const msg = 'PDF parsed but no text found — may be a scanned/image-only PDF'
    logger.error('PDF', msg)
    throw new Error(msg)
  }

  logger.ok('PDF', `Extraction complete: ${trimmed.length} total characters`)
  return { text: trimmed, pages: pdf.numPages }
}

export async function extractTextFromTxt(file) {
  logger.log('TXT', `Reading text file: ${file.name}`)
  try {
    const text = await file.text()
    logger.ok('TXT', `Text file read: ${text.length} chars`)
    return { text: text.trim(), pages: 1 }
  } catch (err) {
    logger.error('TXT', 'Failed to read text file', err)
    throw err
  }
}

export async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  logger.log('FILE', `File selected: "${file.name}", type: "${file.type}", ext: "${ext}", size: ${(file.size/1024).toFixed(1)} KB`)
  if (ext === 'pdf') return extractTextFromPDF(file)
  return extractTextFromTxt(file)
}

