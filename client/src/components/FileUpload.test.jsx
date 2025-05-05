import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from './FileUpload';

describe('FileUpload Component', () => {
  const mockOnFileUpload = jest.fn();
  
  beforeEach(() => {
    mockOnFileUpload.mockClear();
  });

  test('renders upload area when no file is selected', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />);
    
    expect(screen.getByText('Drag and drop your file here')).toBeInTheDocument();
    expect(screen.getByText('Browse Files')).toBeInTheDocument();
    expect(screen.getByText('Supported formats: PDF, DOCX, TXT (Max 10MB)')).toBeInTheDocument();
  });

  test('handles file selection correctly', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Browse Files/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    expect(mockOnFileUpload).toHaveBeenCalledWith(file);
  });

  test('displays error for invalid file type', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} acceptedFileTypes=".pdf,.docx" />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Browse Files/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    expect(screen.getByText('Invalid file type. Please upload .pdf,.docx files only.')).toBeInTheDocument();
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  test('displays error for file size exceeding limit', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />);
    
    // Create a mock file with size > 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Browse Files/i);
    
    Object.defineProperty(input, 'files', {
      value: [largeFile],
    });
    
    fireEvent.change(input);
    
    expect(screen.getByText('File size exceeds 10MB limit.')).toBeInTheDocument();
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  test('displays file info when file is selected', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Browse Files/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  test('removes file when remove button is clicked', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />);
    
    // First add a file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Browse Files/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    // Then remove it
    const removeButton = screen.getByRole('button', { name: '' }); // The X button has no text
    fireEvent.click(removeButton);
    
    expect(screen.getByText('Drag and drop your file here')).toBeInTheDocument();
    expect(mockOnFileUpload).toHaveBeenCalledWith(null);
  });
});