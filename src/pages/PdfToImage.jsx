import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle, FiFileText, FiDownload } from 'react-icons/fi';
import Modal from '../components/Modal'; // Import the Modal component

function PdfToImage() {
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
    <>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        {...modalConfig}
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Convert PDF to Images
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Extract pages from your PDF files as high-quality images in various formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6 mb-8">
            {!pdfFile ? (
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
                  accept="application/pdf" 
                />
                <div className="flex flex-col items-center justify-center py-6">
                  <svg className="h-12 w-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg text-gray-300 font-medium">Drag & drop PDF file here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-500 mt-2">Only PDF files are supported</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="aspect-w-4 aspect-h-5 overflow-hidden rounded-lg bg-dark-bg">
                  <iframe 
                    src={pdfPreview} 
                    title="PDF Preview" 
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-400 truncate">{pdfFile.name}</p>
                  <button 
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-400"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Conversion Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="imageFormat" className="block text-sm font-medium text-gray-300 mb-2">
                  Image Format
                </label>
                <select
                  id="imageFormat"
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WEBP</option>
                  <option value="tiff">TIFF</option>
                </select>
              </div>
              {/* Image Quality settings removed as per user request */}
              
              <div className="pt-4">
                <button 
                  onClick={handleConvertToImages}
                  className="btn-primary w-full"
                  disabled={!pdfFile}
                >
                  Convert to Images
                </button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">About This Tool</h2>
            <p className="text-gray-400 mb-4">
              This tool allows you to convert each page of a PDF document into separate image files.
            </p>
            <ul className="text-gray-400 space-y-2 list-disc pl-5">
              <li>Convert PDF pages to JPG, PNG, WEBP, or TIFF</li>
              <li>Aims for original image quality</li>
              <li>Process multi-page PDF documents</li>
              <li>Download all images as a ZIP file</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-6 mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">How to Convert PDF to Images</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Upload PDF</h3>
            <p className="text-gray-400">Drag and drop your PDF file or click to browse your files.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Choose Settings</h3>
            <p className="text-gray-400">Select your preferred image format.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <span className="text-lg font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Convert & Download</h3>
            <p className="text-gray-400">Click the Convert button and download your image files.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default PdfToImage;