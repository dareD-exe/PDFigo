import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle, FiFileText, FiImage, FiDownload } from 'react-icons/fi';
import Modal from '../components/Modal'; // Import the Modal component
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

function ImageToPdf() {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Image to PDF | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [files, setFiles] = useState([]); // Stores {file, id, preview}
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [downloadFileName, setDownloadFileName] = useState('converted-images.pdf');
  const fileInputRef = useRef(null);
  // Removed imageFormat and imageQuality states as per user request to simplify settings

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
              const imageType = imageFileToProcess.type.split('/')[1].toUpperCase();
              // For JPEG, 'FAST' provides good quality. For other types, jsPDF handles them.
              const compression = imageType === 'JPEG' ? 'FAST' : 'NONE'; // Use 'NONE' for non-JPEGs or if lossless is critical
              pdf.addImage(imgData, imageType, 10, currentPdfYPosition, pdfImageWidth, scaledImageHeight, undefined, compression);
              heightLeft -= pdfPageUsableHeight; // Subtract the height that fit on this page

              // If the image is taller than what fits on one page (within usable height)
              while (heightLeft >= 0) { // Using >= 0 as in the structure of the intended replace_block
                // Calculate the y-offset for the *entire* image on the new page
                // This makes the previously hidden part of the image visible at the top of the new page
                currentPdfYPosition = heightLeft - scaledImageHeight + 10;
                pdf.addPage();
                const imageTypeLoop = imageFileToProcess.type.split('/')[1].toUpperCase();
                const compressionLoop = imageTypeLoop === 'JPEG' ? 'FAST' : 'NONE';
                pdf.addImage(imgData, imageTypeLoop, 10, currentPdfYPosition, pdfImageWidth, scaledImageHeight, undefined, compressionLoop);
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
          Convert Images to PDF
        </h1>
        <p className="mt-4 text-xl text-blue-200/90 max-w-2xl mx-auto">
          Transform your JPG, PNG, or other image files into a PDF document in seconds.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        className="bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.1)] p-8 mb-8 w-full"
      >
        {!files.length > 0 ? (
          <motion.div 
            className={`upload-zone w-full border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
              isDragging || dragOver ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-blue-500'
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
              accept="image/*" 
            />
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="mb-4"
              >
                <FiUploadCloud className="h-16 w-16 text-blue-400 drop-shadow-lg" />
              </motion.div>
              <p className="text-xl text-white font-medium mb-2">Drag & drop images here</p>
              <p className="text-base text-blue-200/80">or click anywhere in this area to browse</p>
              <p className="text-sm text-blue-300/70 mt-3">Supports JPG, JPEG, PNG, GIF, BMP, WEBP</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Selected Images ({files.length})</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="relative group aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-lg border border-gray-700/50"
                  >
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="object-cover w-full h-full"
                    />
                    <motion.button
                      onClick={() => handleRemoveFile(file.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      aria-label="Remove Image"
                    >
                      <FiXCircle className="h-5 w-5 text-red-400" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={handleConvertToPdf}
              disabled={files.length === 0}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:from-cyan-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               <FiFileText className="h-6 w-6" /> Convert to PDF
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* How-to section (Optional) */}

    </motion.div>
    <Footer />
    </div>
  );
}

export default ImageToPdf;