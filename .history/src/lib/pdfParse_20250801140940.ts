import * as pdfParse from 'pdf-parse';

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(buffer);  // works with default import fix
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw error;
  }
};