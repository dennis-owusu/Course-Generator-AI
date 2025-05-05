import fs from 'fs-extra';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text content from various document types
 * @param {string} filePath - Path to the uploaded file
 * @param {string} fileExt - File extension (pdf, docx, txt)
 * @returns {Promise<{content: string, title: string}>} - Extracted content and title
 */
export async function extractContentFromFile(filePath, fileExt) {
  try {
    let content = '';
    let title = path.basename(filePath, path.extname(filePath));
    
    // Clean up the title (remove underscores, etc.)
    title = title.replace(/_/g, ' ').trim();
    
    switch(fileExt.toLowerCase()) {
      case 'pdf':
        content = await extractFromPDF(filePath);
        break;
      case 'docx':
        content = await extractFromDOCX(filePath);
        break;
      case 'txt':
        content = await extractFromTXT(filePath);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileExt}`);
    }
    
    // If no title was extracted from the document, use the filename
    if (!title) {
      title = path.basename(filePath, path.extname(filePath)).replace(/_/g, ' ');
    }
    
    return {
      content: content.trim(),
      title: title
    };
  } catch (error) {
    console.error(`Error extracting content from ${fileExt} file:`, error);
    throw error;
  }
}

/**
 * Extract text content from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting content from PDF:', error);
    throw error;
  }
}

/**
 * Extract text content from DOCX file
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting content from DOCX:', error);
    throw error;
  }
}

/**
 * Extract text content from TXT file
 * @param {string} filePath - Path to the TXT file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractFromTXT(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error extracting content from TXT:', error);
    throw error;
  }
}

/**
 * Generate a course topic and description from extracted content
 * @param {string} content - Extracted text content
 * @param {string} fileName - Original file name
 * @returns {Object} - Generated topic and description
 */
export function generateTopicFromContent(content, fileName) {
  // Extract a potential topic from the first 500 characters
  // This is a simple implementation - in a production app, you might use AI to generate a better topic
  let extractedTopic = '';
  
  if (content && content.length > 0) {
    // Try to extract a title from the first line or first 100 characters
    const firstLine = content.split('\n')[0].trim();
    if (firstLine && firstLine.length > 5 && firstLine.length < 100) {
      extractedTopic = firstLine;
    } else {
      // Extract first 100 characters and find a reasonable cutoff point
      const snippet = content.substring(0, 100);
      const endIndex = snippet.lastIndexOf('.');
      extractedTopic = endIndex > 10 ? snippet.substring(0, endIndex) : snippet;
    }
  }
  
  // Fallback to filename if we couldn't extract a good topic
  if (!extractedTopic || extractedTopic.length < 5) {
    extractedTopic = fileName.split('.')[0].replace(/_/g, ' ');
  }
  
  // Generate a description
  const contentPreview = content.length > 200 ? 
    content.substring(0, 200) + '...' : 
    content;
  
  const description = `Course generated from document: ${fileName}. Content preview: ${contentPreview}`;
  
  return {
    topic: extractedTopic,
    description: description
  };
}