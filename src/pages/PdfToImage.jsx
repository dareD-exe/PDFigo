import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle, FiFileText, FiDownload, FiImage, FiSettings } from 'react-icons/fi';
import Modal from '../components/Modal'; // Import the Modal component
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

function PdfToImage() {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'PDF to Image | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageFormat, setImageFormat] = useState('jpg');
  // const [imageQuality, setImageQuality] = useState(90); // Removed as per user request
  const [dragOver, setDragOver] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [downloadFileName, setDownloadFileName] = useState('converted_pdf_to_images.zip');
  const [pdfPreview, setPdfPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfPreview(URL.createObjectURL(file));
    }
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
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setPdfPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleRemoveFile = () => {
    if (pdfPreview) {
      URL.revokeObjectURL(pdfPreview);
    }
    setPdfFile(null);
    setPdfPreview(null);
  };

  const handleConvertToImages = async () => {
    if (!pdfFile) {
      setModalConfig({
        title: 'No PDF Selected',
        message: 'Please select a PDF file to convert to images.',
        type: 'error',
      });
      setModalOpen(true);
      return;
    }

    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      
      // Set workerSrc. Using a CDN as a robust default.
      // User should adjust this based on their project's asset handling.
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        // Using a specific version for stability. Match this with your installed pdfjs-dist version.
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.mjs`;
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const numPages = pdfDoc.numPages;
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      let actualFormatForConversion = imageFormat;
      if (imageFormat === 'tiff') {
        console.warn("TIFF format is not directly supported by browser canvas conversion. Outputting as PNG with .tiff extension.");
        actualFormatForConversion = 'png'; // Convert to PNG, but keep .tiff extension as per user choice
      }

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const scale = 2.0; // Adjust for quality vs. performance
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;

        const mimeType = `image/${actualFormatForConversion === 'jpg' ? 'jpeg' : actualFormatForConversion}`;
        // Quality argument removed to aim for original/best quality. 
        // For JPG/WEBP, browser default is typically high. PNG is lossless.
        const imageDataUrl = canvas.toDataURL(mimeType);
        
        // Use the user-selected imageFormat for the filename extension
        zip.file(`page_${i}.${imageFormat}`, imageDataUrl.split(',')[1], { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${pdfFile.name.replace(/\.pdf$/i, '')}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      setModalConfig({
        title: 'Conversion Successful',
        message: 'Your PDF has been converted to images and packaged in a ZIP file.',
        fileName: downloadFileName,
        onFileNameChange: (e) => setDownloadFileName(e.target.value),
        onDownload: () => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = downloadFileName || `${pdfFile.name.replace(/\.pdf$/i, '')}_images.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          setModalOpen(false);
          setDownloadFileName('converted_pdf_to_images.zip'); // Reset
        },
        downloadable: true,
        editableName: true,
        type: 'success',
      });
      setModalOpen(true);

    } catch (error) {
      console.error("Error during PDF conversion:", error);
      let userMessage = "An error occurred during PDF conversion.";
      if (error.name === 'MissingPDFException' || error.name === 'InvalidPDFException') {
        userMessage = "Invalid or corrupted PDF file.";
      } else if (error.message && (error.message.includes("NetworkError") || error.message.includes("Failed to fetch"))) {
        userMessage = "Network error. Could not load PDF or required resources (like the PDF worker).";
      } else if (error.name === 'UnknownErrorException') {
        userMessage = "An unknown error occurred while processing the PDF. The file might be password-protected or use features not supported by the viewer.";
      }
      setModalConfig({
        title: 'Conversion Error',
        message: userMessage + "\nPlease check the console for more details.",
        type: 'error',
      });
      setModalOpen(true);
    } finally {
      // Clear the selected file and preview after attempting conversion
      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview);
      }
      setPdfFile(null);
      setPdfPreview(null);
    }
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
          Convert PDF to Images
        </h1>
        <p className="mt-4 text-xl text-blue-200/90 max-w-2xl mx-auto">
          Extract pages from your PDF files as high-quality images in various formats.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload / Preview Section */}
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
           className="lg:col-span-2 bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.1)] p-8 flex flex-col items-center justify-center"
        >
          {!pdfFile ? (
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
                <p className="text-xl text-white font-medium mb-2">Drag & drop PDF file here</p>
                <p className="text-base text-blue-200/80">or click anywhere in this area to browse</p>
                <p className="text-sm text-blue-300/70 mt-3">Only PDF files are supported</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
               <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden shadow-xl border border-blue-700/50 mb-4">
                 <iframe 
                   src={pdfPreview} 
                   title="PDF Preview" 
                   className="w-full h-full"
                 ></iframe>
               </div>
              <div className="flex justify-between items-center px-2">
                <p className="text-white font-medium truncate text-lg">{pdfFile.name}</p>
                <motion.button 
                  onClick={handleRemoveFile}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-red-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-red-900/50"
                  aria-label="Remove File"
                >
                  <FiXCircle className="h-6 w-6" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Options and Convert Button */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-1 bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.1)] p-8 flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Image Format Option */}
            <div>
              <label htmlFor="imageFormat" className="block text-blue-300 text-lg font-medium mb-3">
                Output Format
              </label>
              <select
                id="imageFormat"
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 text-base"
              >
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
                <option value="tiff">TIFF (as PNG)</option>
              </select>
            </div>
            
            {/* Image Quality Option (if re-added) */}
            {/* <div>
              <label htmlFor="imageQuality" className="block text-blue-300 text-lg font-medium mb-3">
                Image Quality ({imageQuality}%)
              </label>
              <input
                type="range"
                id="imageQuality"
                min="1" max="100"
                value={imageQuality}
                onChange={(e) => setImageQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-blue-500"
              />
            </div> */}
          </div>

          {/* Convert Button */}
          <motion.button
            onClick={handleConvertToImages}
            disabled={!pdfFile}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-auto w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:from-cyan-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             <FiDownload className="h-6 w-6" /> Convert to Images
          </motion.button>
        </motion.div>
      </div>

      {/* How-to section (Optional, can be added here or similar to home page) */}

    </motion.div>
    <Footer />
    </div>
  );
}

export default PdfToImage;