/**
 * Extract text from PDF, Word, or plain text files in the browser.
 */
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker - use legacy build for broader compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf') {
    return extractTextFromPdf(file);
  }
  if (ext === 'docx' || ext === 'doc') {
    return extractTextFromWord(file);
  }
  if (ext === 'txt') {
    return file.text();
  }
  throw new Error(`Unsupported file type: ${ext}. Please use PDF, Word (.docx), or plain text (.txt).`);
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const textParts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }
  return textParts.join('\n\n').trim();
}

async function extractTextFromWord(file: File): Promise<string> {
  const { default: mammoth } = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}
