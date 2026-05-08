// src/lib/fileExtraction.js
// Extracts plain text from uploaded files: PDF (via pdf.js), DOCX (via mammoth),
// and plain text / markdown directly.

import * as mammoth from 'mammoth'

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('could not read file'))
    reader.readAsText(file)
  })
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('could not read file'))
    reader.readAsArrayBuffer(file)
  })
}

let _pdfjsLoadPromise = null
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib)
  if (_pdfjsLoadPromise) return _pdfjsLoadPromise
  _pdfjsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      if (!window.pdfjsLib) { reject(new Error('pdf.js failed to expose pdfjsLib')); return }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      resolve(window.pdfjsLib)
    }
    script.onerror = () => reject(new Error('could not load pdf.js from CDN'))
    document.head.appendChild(script)
  })
  return _pdfjsLoadPromise
}

export async function extractTextFromPdf(file) {
  const pdfjs = await loadPdfJs()
  const buf = await readFileAsArrayBuffer(file)
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  const parts = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const lineMap = {}
    for (const item of content.items) {
      const y = Math.round(item.transform[5])
      if (!lineMap[y]) lineMap[y] = []
      lineMap[y].push(item.str)
    }
    const sortedYs = Object.keys(lineMap).map(Number).sort((a, b) => b - a)
    for (const y of sortedYs) parts.push(lineMap[y].join(' '))
    parts.push('')
  }
  const text = parts.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!text) throw new Error('PDF appears to contain no extractable text (it may be scanned images).')
  return text
}

export async function extractTextFromDocx(file) {
  const buf = await readFileAsArrayBuffer(file)
  const result = await mammoth.extractRawText({ arrayBuffer: buf })
  const text = (result.value || '').trim()
  if (!text) throw new Error('DOCX appears to contain no extractable text.')
  return text
}

export async function extractTextFromFile(file) {
  if (!file) throw new Error('no file provided')
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.pdf')) return extractTextFromPdf(file)
  if (name.endsWith('.docx')) return extractTextFromDocx(file)
  return readFileAsText(file)
}
