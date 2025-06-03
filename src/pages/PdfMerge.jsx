import CosmicBackground from '../components/CosmicBackground';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle, FiFileText, FiArrowUp, FiArrowDown, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal'; // Import the Modal component

import React, { useState, useCallback, useRef, useEffect } from 'react'; // Added useRef and useEffect
import Footer from '../components/Footer';
import { PDFDocument } from 'pdf-lib'; // Explicitly import PDFDocument

function PdfMerge() {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Merge PDF Files | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const fileInputRef = useRef(null); // Added fileInputRef declaration
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false); // Added isDragging state
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
    setDragOver(true); // Use dragOver for visual feedback during hover
    setIsDragging(true); // Keep isDragging for broader drag state if needed elsewhere or for logic
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
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

    let mergedPdf;
    try {
      mergedPdf = await PDFDocument.create();

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

    if (!mergedPdf) { // Check if mergedPdf was initialized
      console.error('Error: mergedPdf is not initialized.');
      setModalConfig({
        title: 'Merge Error',
        message: 'An unexpected error occurred during PDF merge. Please try again.',
        type: 'error',
      });
      setModalOpen(true);
      return;
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      <CosmicBackground />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        {...modalConfig}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 w-full"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4">
            Merge PDF Files
          </h1>
          <p className="mt-4 text-xl text-blue-200/90 max-w-2xl mx-auto">
            Combine multiple PDF documents into a single file in your preferred order. Fast and secure.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.1)] p-8 mb-8 w-full"
        >
          <motion.div 
            className={`upload-zone w-full border-2 border-dashed rounded-xl transition-all duration-300 ${
              dragOver ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-blue-500'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            whileHover={{ scale: 1.01, borderColor: '#3b82f6' }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              multiple 
              accept="application/pdf" 
            />
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="mb-4"
              >
                <FiUploadCloud className="h-16 w-16 text-blue-400 drop-shadow-lg" />
              </motion.div>
              <p className="text-xl text-white font-medium mb-2">Drag & drop PDF files here</p>
              <p className="text-base text-blue-200/80">or click anywhere in this area to browse</p>
              <p className="text-sm text-blue-300/70 mt-3">Only PDF files are supported</p>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Selected Files ({files.length})</h2>
              <ul className="bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.1)] divide-y divide-gray-700 overflow-hidden">
                <AnimatePresence>
                  {files.map((fileObj, index) => (
                    <motion.li
                      key={fileObj.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-6 hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <FiFileText className="h-6 w-6 text-blue-400" />
                        <div className="flex flex-col">
                          <span className="text-white font-medium truncate max-w-full sm:max-w-sm md:max-w-md">{fileObj.name}</span>
                          <span className="text-blue-200/70 text-sm">{formatFileSize(fileObj.size)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <motion.button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full hover:bg-gray-700/70 text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                          aria-label="Move Up"
                        >
                          <FiArrowUp className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === files.length - 1}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full hover:bg-gray-700/70 text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                          aria-label="Move Down"
                        >
                          <FiArrowDown className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleRemoveFile(fileObj.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full hover:bg-red-900/50 text-red-400 transition-colors duration-200"
                          aria-label="Remove File"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <motion.button
                onClick={handleMergePdfs}
                disabled={files.length < 2}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-10 w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:from-cyan-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Merge PDFs
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <Footer />
    </div>
  );
}

export default PdfMerge;