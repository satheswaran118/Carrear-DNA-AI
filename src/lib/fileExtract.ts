/**
 * Browser-side text extraction for PDF, DOCX, and TXT files.
 * PDF: uses pdf.js loaded from CDN (no npm install needed)
 * DOCX: parses ZIP+XML using native DecompressionStream
 * TXT/MD: native FileReader
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext === "txt" || ext === "md") return readAsText(file)
  if (ext === "pdf") return extractFromPDF(file)
  if (ext === "docx" || ext === "doc") return extractFromDOCX(file)
  throw new Error(`Unsupported file type: .${ext}. Please upload PDF, DOCX, or TXT.`)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

// ── PDF via pdf.js from CDN ───────────────────────────────────────────────────

const PDFJS_VERSION = "3.11.174"
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`

// Load pdf.js script from CDN once
let pdfjsLoadPromise: Promise<void> | null = null

function loadPdfJs(): Promise<void> {
  if (pdfjsLoadPromise) return pdfjsLoadPromise

  pdfjsLoadPromise = new Promise((resolve, reject) => {
    // Already loaded
    if ((window as unknown as Record<string, unknown>)["pdfjsLib"]) {
      resolve()
      return
    }
    const script = document.createElement("script")
    script.src = PDFJS_CDN
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load PDF.js from CDN. Check your internet connection."))
    document.head.appendChild(script)
  })

  return pdfjsLoadPromise
}

async function extractFromPDF(file: File): Promise<string> {
  await loadPdfJs()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib = (window as any).pdfjsLib
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER

  const buffer = await readAsArrayBuffer(file)
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // Join text items, preserving line breaks via transform position
    let lastY: number | null = null
    let pageText = ""
    for (const item of content.items) {
      if (!("str" in item)) continue
      const y = item.transform?.[5]
      if (lastY !== null && Math.abs(y - lastY) > 5) {
        pageText += "\n"
      }
      pageText += item.str + " "
      lastY = y
    }
    pages.push(pageText.trim())
  }

  const result = pages.join("\n\n").replace(/\n{3,}/g, "\n\n").trim()
  if (!result) {
    throw new Error(
      "Could not extract text from this PDF — it may be scanned or image-based. " +
      "Please use the 'Paste Resume' tab to paste the text manually."
    )
  }
  return result
}

// ── DOCX via native ZIP parsing + DecompressionStream ────────────────────────

async function extractFromDOCX(file: File): Promise<string> {
  const buffer = await readAsArrayBuffer(file)
  const bytes = new Uint8Array(buffer)
  const xml = await findFileInZip(bytes, "word/document.xml")

  if (!xml) {
    throw new Error(
      "Could not read DOCX file. Try saving as .txt or use the 'Paste Resume' tab."
    )
  }
  return extractTextFromWordXML(xml)
}

async function findFileInZip(bytes: Uint8Array, targetName: string): Promise<string | null> {
  let offset = 0

  while (offset < bytes.length - 30) {
    // Local file header signature: PK\x03\x04
    if (
      bytes[offset]   !== 0x50 || bytes[offset+1] !== 0x4b ||
      bytes[offset+2] !== 0x03 || bytes[offset+3] !== 0x04
    ) {
      offset++
      continue
    }

    const method    = bytes[offset+8]  | (bytes[offset+9]  << 8)
    const compSize  = (
      (bytes[offset+18])        | (bytes[offset+19] << 8) |
      (bytes[offset+20] << 16) | (bytes[offset+21] << 24)
    ) >>> 0
    const nameLen   = bytes[offset+26] | (bytes[offset+27] << 8)
    const extraLen  = bytes[offset+28] | (bytes[offset+29] << 8)
    const name      = new TextDecoder().decode(bytes.slice(offset+30, offset+30+nameLen))
    const dataStart = offset + 30 + nameLen + extraLen

    if (name === targetName) {
      const compData = bytes.slice(dataStart, dataStart + compSize)
      if (method === 0) {
        return new TextDecoder("utf-8").decode(compData)
      }
      if (method === 8) {
        const raw = await decompressDeflateRaw(compData)
        return new TextDecoder("utf-8").decode(raw)
      }
      return null
    }

    offset = dataStart + compSize
  }

  return null
}

async function decompressDeflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate-raw")
  const writer = ds.writable.getWriter()
  const reader = ds.readable.getReader()

  await writer.write(data)
  await writer.close()

  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    total += value.length
  }

  const out = new Uint8Array(total)
  let pos = 0
  for (const chunk of chunks) { out.set(chunk, pos); pos += chunk.length }
  return out
}

function extractTextFromWordXML(xml: string): string {
  const text = xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x[0-9A-Fa-f]+;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (!text) throw new Error("No text found in DOCX. Try the 'Paste Resume' tab instead.")
  return text
}
