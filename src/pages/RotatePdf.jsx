import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiRotateCw, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { PDFDocument, degrees } from 'pdf-lib';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const RotatePdf = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Rotate PDF | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageRotation, setPageRotation] = useState({}); // Stores rotation for each page index
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      clearFile();
      return;
    }

    setFile(selectedFile);
    setError('');
    setLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadedPdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(loadedPdfDoc);
      setTotalPages(loadedPdfDoc.getPageCount());
      setCurrentPageIndex(0);
      setPageRotation({}); // Reset rotation for new file
    } catch (err) {
      setError('Error loading PDF file');
      console.error(err);
      clearFile();
    } finally {
      setLoading(false);
    }
  };

  const handleRotateCurrentPage = () => {
    if (!pdfDoc) return;

    // Update rotation for the current page index
    setPageRotation(prev => ({
      ...prev,
      [currentPageIndex]: ((prev[currentPageIndex] || 0) + 90) % 360 // Ensure rotation cycles 0, 90, 180, 270
    }));
     // Optional: Provide feedback that rotation has been applied to the selected page internally
     console.log(`Page ${currentPageIndex + 1} rotation set to ${((pageRotation[currentPageIndex] || 0) + 90) % 360} degrees.`);
  };

  const handleDownload = async () => {
    if (!pdfDoc || loading) return;

    setLoading(true);
    setError('');

    try {
      // Create a new PDF document to apply rotations without modifying the original loaded one
      const newPdfDoc = await PDFDocument.create();
      const originalPages = pdfDoc.getPages();

      for (let i = 0; i < originalPages.length; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        
        // Apply the rotation stored in pageRotation state for this page index
        const additionalRotation = pageRotation[i] || 0;
        const originalRotation = copiedPage.getRotation().angle;

        // Set the new rotation, combining original and additional rotation
        copiedPage.setRotation(degrees(originalRotation + additionalRotation));
        
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rotated_${file ? file.name.replace('.pdf', '') : 'document'}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      // Optionally clear the file and state after download
      // clearFile();

    } catch (err) {
      setError('Error saving rotated PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setCurrentPageIndex(0);
    setPageRotation({});
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Rotate PDF</h1>
          <p className="text-gray-300">Rotate individual pages or the entire PDF</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700"
        >
          <div className="space-y-8">
            {/* File Upload */}
            {!file && (
              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-xl">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF files only</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Controls when file is loaded */}
            {pdfDoc && totalPages > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6 space-y-4 flex flex-col items-center"
              >
                <h3 className="text-lg font-semibold text-white">Page {currentPageIndex + 1} of {totalPages}</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentPageIndex === 0 || loading}
                    className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={handleRotateCurrentPage}
                    disabled={loading}
                    className="flex items-center px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiRotateCw className="w-5 h-5 mr-2" /> Rotate Page
                  </button>
                   <button
                    onClick={() => setCurrentPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPageIndex === totalPages - 1 || loading}
                     className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Action Buttons */}
            {pdfDoc && totalPages > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                  }`}
                >
                  <FiDownload className="w-5 h-5 mr-2" />
                  {loading ? 'Processing...' : 'Download Rotated PDF'}
                </button>
                <button
                  onClick={clearFile}
                  className="flex items-center px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-700 hover:scale-105 transition-all"
                >
                  <FiTrash2 className="w-5 h-5 mr-2" />
                  Clear
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RotatePdf; 