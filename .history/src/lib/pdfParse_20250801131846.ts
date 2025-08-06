// utils/pdfParser.ts
import * as pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF buffer
 * @param buffer PDF file as Buffer
 * @returns Extracted plain text
 */
export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
    try {
        const data = await pdf(buffer); // parse the PDF
        return data.text
    } catch (error) {
        console.log(error)
        return ''
    }
    
// //   
// const data = {text:"Hi thi is to working"}
//   return data.text;
};
