import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { Button } from './ui/button';

/**
 * This component is for testing the FileUpload component functionality
 * It can be imported and used temporarily in any page to verify file upload works
 */
const FileUploadTester = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleFileUpload = (file) => {
    setUploadedFile(file);
    setUploadSuccess(false);
  };

  const simulateUpload = () => {
    if (!uploadedFile) return;
    
    // Simulate API call
    setTimeout(() => {
      setUploadSuccess(true);
      console.log('File would be uploaded:', uploadedFile);
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto p-6 border rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-semibold text-indigo-900 mb-4">File Upload Test</h2>
      
      <div className="mb-6">
        <FileUpload onFileUpload={handleFileUpload} />
      </div>
      
      {uploadedFile && (
        <div className="mt-4">
          <Button 
            onClick={simulateUpload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Simulate Upload to Server
          </Button>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
          <p className="font-medium">✅ File upload simulation successful!</p>
          <p className="text-sm mt-1">File: {uploadedFile.name}</p>
          <p className="text-sm">Size: {(uploadedFile.size / 1024).toFixed(2)} KB</p>
          <p className="text-sm">Type: {uploadedFile.type}</p>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium">Testing Instructions:</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>Try uploading valid files (PDF, DOCX, TXT)</li>
          <li>Try uploading invalid file types</li>
          <li>Try uploading files larger than 10MB</li>
          <li>Test drag and drop functionality</li>
          <li>Test removing uploaded files</li>
        </ol>
      </div>
    </div>
  );
};

export default FileUploadTester;