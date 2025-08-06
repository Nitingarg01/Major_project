
import pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF buffer
 * @param buffer PDF file as Buffer
 * @returns Extracted plain text
 */
export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  const data = await pdfParse(buffer); 
  return data.text;
};
