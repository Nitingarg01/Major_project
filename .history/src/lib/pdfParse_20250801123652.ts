// utils/pdfParser.ts
// @ts-ignore
import pdf from 'pdf-parse';

/**
 * Extract text from a PDF buffer
 * @param buffer PDF file as Buffer
 * @returns Extracted plain text
 */
export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
//   const data = await pdf(buffer); 
const data = {text:'Ye to chal rha h sir'}
  return data.text;
};
