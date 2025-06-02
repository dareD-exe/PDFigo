import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle, FiFileText, FiImage } from 'react-icons/fi';
import Modal from '../components/Modal'; // Import the Modal component

function ImageToPdf() {
  const [files, setFiles] = useState([]); // Stores {file, id, preview}
  const [dragOver, setDragOver] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [downloadFileName, setDownloadFileName] = useState('converted-images.pdf');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    // Filter for image files only
    const imageFiles = newFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    // Add preview URLs
    const filesWithPreviews = imageFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2),
      preview: URL.createObjectURL(file)
    }));
    
    setFiles(prevFiles => [...prevFiles, ...filesWithPreviews]);
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
    setFiles(prevFiles => {
      // Find the file to remove
      const fileToRemove = prevFiles.find(f => f.id === id);
      
      // Revoke the object URL to prevent memory leaks
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      // Return the filtered array
      return prevFiles.filter(f => f.id !== id);
    });
  };

  const handleConvertToPdf = async () => {
    if (files.length === 0) {
      setModalConfig({
        title: 'No Images Selected',
        message: 'Please select one or more images to convert to PDF.',
        type: 'error',
      });
      setModalOpen(true);
      return;
    }

    const { default: jsPDF } = await import('jspdf');
    const pdf = new jsPDF();

    for (let i = 0; i < files.length; i++) {
      const fileObject = files[i]; // files state contains {file, id, preview}
      const imageFileToProcess = fileObject.file; // Actual File object
      const reader = new FileReader();

      try {
        await new Promise((resolve, reject) => {
        reader.onload = (event) => {
          try {
            const imgData = event.target.result;
            const img = new Image();
            img.src = imgData;
            img.onload = () => {
              // Logic adapted from the provided replace_block for PDF generation
              const pdfImageWidth = pdf.internal.pageSize.getWidth() - 20; // 10 margin on each side
              const pdfPageUsableHeight = pdf.internal.pageSize.getHeight() - 20; // Usable height within margins
              const scaledImageHeight = (img.height * pdfImageWidth) / img.width; // Image height scaled to fit pdfImageWidth
              
              let heightLeft = scaledImageHeight; // Total height of the scaled image
              let currentPdfYPosition = 10; // Initial y position for drawing on PDF page

              if (i > 0) {
                pdf.addPage();
              }
              // Add the image (or its first part)
              pdf.addImage(imgData, 'JPEG', 10, currentPdfYPosition, pdfImageWidth, scaledImageHeight);
              heightLeft -= pdfPageUsableHeight; // Subtract the height that fit on this page

              // If the image is taller than what fits on one page (within usable height)
              while (heightLeft >= 0) { // Using >= 0 as in the structure of the intended replace_block
                // Calculate the y-offset for the *entire* image on the new page
                // This makes the previously hidden part of the image visible at the top of the new page
                currentPdfYPosition = heightLeft - scaledImageHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 10, currentPdfYPosition, pdfImageWidth, scaledImageHeight);
                heightLeft -= pdfPageUsableHeight;
              }
              resolve();
            };
            img.onerror = (err) => {
              console.error("Error loading image:", imageFileToProcess.name, err);
              alert(`Error loading image ${imageFileToProcess.name}. It might be corrupted or an unsupported format.`);
              reject(new Error(`Failed to load image ${imageFileToProcess.name}`));
            };
          } catch (e) {
            console.error("Error processing image:", imageFileToProcess.name, e);
            alert(`Error processing image ${imageFileToProcess.name}.`);
            reject(e);
          }
        };
        reader.onerror = (err) => {
            console.error("Error reading file:", imageFileToProcess.name, err);
            alert(`Error reading file ${imageFileToProcess.name}.`);
            reject(new Error(`Failed to read file ${imageFileToProcess.name}`));
         };
         reader.readAsDataURL(imageFileToProcess);
       });
      } catch (error) {
        console.error('Error during PDF conversion process:', error);
        setModalConfig({
          title: 'Conversion Error',
          message: `An error occurred while converting images: ${error.message}`,
          type: 'error',
        });
        setModalOpen(true);
        return; // Stop the process if an error occurs
      }
     }

    setModalConfig({
      title: 'Conversion Successful',
      message: 'Your images have been converted to PDF.',
      fileName: downloadFileName,
      onFileNameChange: (e) => setDownloadFileName(e.target.value),
      onDownload: () => {
        pdf.save(downloadFileName || 'converted-images.pdf');
        setModalOpen(false);
        setFiles([]);
        setDownloadFileName('converted-images.pdf'); // Reset for next time
      },
      downloadable: true,
      editableName: true,
      type: 'success',
    });
    setModalOpen(true);
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
          Convert Images to PDF
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Transform your JPG, PNG, or other image files into a PDF document in seconds.
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
            accept="image/*" 
          />
          <div className="flex flex-col items-center justify-center py-6">
            <svg className="h-12 w-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg text-gray-300 font-medium">Drag & drop images here</p>
            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            <p className="text-xs text-gray-500 mt-2">Supports JPG, JPEG, PNG, GIF, BMP, WEBP</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Selected Images ({files.length})</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg bg-dark-bg">
                  <img 
                    src={file.preview} 
                    alt={file.file.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm text-gray-400 truncate">{file.file.name}</p>
                  <button 
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleConvertToPdf}
              className="btn-primary"
              disabled={files.length === 0}
            >
              Convert to PDF
            </button>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">How to Convert Images to PDF</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Upload Images</h3>
            <p className="text-gray-400">Drag and drop your images or click to browse your files.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Arrange Order</h3>
            <p className="text-gray-400">Rearrange the images to set the order in the final PDF document.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Convert & Download</h3>
            <p className="text-gray-400">Click the Convert button and download your PDF file.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default ImageToPdf;