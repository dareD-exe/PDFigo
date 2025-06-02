import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle, FiFileText, FiArrowUp, FiArrowDown, FiTrash2 } from 'react-icons/fi';
import Modal from '../components/Modal'; // Import the Modal component

function PdfMerge() {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [downloadFileName, setDownloadFileName] = useState('merged.pdf');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    // Filter for PDF files only
    const pdfFiles = newFiles.filter(file => 
      file.type === 'application/pdf'
    );
    
    // Add unique IDs
    const filesWithIds = pdfFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2),
      name: file.name,
      size: file.size
    }));
    
    setFiles(prevFiles => [...prevFiles, ...filesWithIds]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (id) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  const handleMoveDown = (index) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setFiles(newFiles);
  };

  const handleMergePdfs = async () => {
    if (files.length < 2) {
      setModalConfig({
        title: 'Not Enough Files',
        message: 'Please select at least two PDF files to merge.',
        type: 'error',
      });
      setModalOpen(true);
      return;
    }

    try {
      const { PDFDocument } = await import('pdf-lib');
    const mergedPdf = await PDFDocument.create();

    for (const fileObj of files) {
      const arrayBuffer = await fileObj.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
  } catch (error) {
    console.error('Error during PDF merge process:', error);
    setModalConfig({
      title: 'Merge Error',
      message: `An error occurred while merging PDFs: ${error.message}`,
      type: 'error',
    });
    setModalOpen(true);
    return; // Stop the process if an error occurs
  }

    const mergedPdfBytes = await mergedPdf.save();

    // Trigger download
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'merged.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    setModalConfig({
      title: 'Merge Successful',
      message: 'Your PDF files have been merged.',
      fileName: downloadFileName,
      onFileNameChange: (e) => setDownloadFileName(e.target.value),
      onDownload: () => {
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = downloadFileName || 'merged.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        setModalOpen(false);
        setFiles([]);
        setDownloadFileName('merged.pdf'); // Reset for next time
      },
      downloadable: true,
      editableName: true,
      type: 'success',
    });
    setModalOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        {...modalConfig}
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Merge PDF Files
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Combine multiple PDF documents into a single file in the order you want.
        </p>
      </div>

      <div className="card p-6 mb-8">
        <div 
          className={`upload-zone ${isDragging ? 'active' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
            accept="application/pdf" 
          />
          <div className="flex flex-col items-center justify-center py-6">
            <svg className="h-12 w-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg text-gray-300 font-medium">Drag & drop PDF files here</p>
            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            <p className="text-xs text-gray-500 mt-2">Only PDF files are supported</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Selected PDF Files ({files.length})</h2>
          <p className="text-sm text-gray-400 mb-4">
            Drag and drop to rearrange files. The PDFs will be merged in the order shown below.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-border">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    File Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {files.map((file, index) => (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <span className="font-medium">{index + 1}</span>
                        <div className="ml-3 flex space-x-1">
                          <button 
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded-full ${index === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleMoveDown(index)}
                            disabled={index === files.length - 1}
                            className={`p-1 rounded-full ${index === files.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                          <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                          <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
                        </svg>
                        <span className="truncate max-w-xs">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleMergePdfs}
              className="btn-primary"
              disabled={files.length < 2}
            >
              Merge PDFs
            </button>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">How to Merge PDF Files</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Upload PDFs</h3>
            <p className="text-gray-400">Drag and drop your PDF files or click to browse your files.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Arrange Order</h3>
            <p className="text-gray-400">Rearrange the files to set the order in the final merged PDF.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Merge & Download</h3>
            <p className="text-gray-400">Click the Merge button and download your combined PDF file.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default PdfMerge;