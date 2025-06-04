import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiGrid, FiTrash2 } from 'react-icons/fi';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { useEffect } from 'react';

// Note: Live preview of PDF pages client-side for reordering is complex and potentially resource-intensive.
// This component will focus on the logic of selecting pages and rearranging their order based on input or a simple visual representation (e.g., numbered boxes).

const RearrangePdf = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Rearrange PDF | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageOrder, setPageOrder] = useState([]); // Array of page indices in current order
  const fileInputRef = useRef(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setFile(null);
      setPdfDoc(null);
      setTotalPages(0);
      setPageOrder([]);
      return;
    }

    setFile(selectedFile);
    setError('');
    setLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadedPdfDoc = await PDFDocument.load(arrayBuffer);
      const numPages = loadedPdfDoc.getPageCount();
      setPdfDoc(loadedPdfDoc);
      setTotalPages(numPages);
      setPageOrder(Array.from({ length: numPages }, (_, i) => i)); // Initial order is sequential
    } catch (err) {
      setError('Error loading PDF file');
      console.error(err);
      setFile(null);
      setPdfDoc(null);
      setTotalPages(0);
      setPageOrder([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  // Simple drag and drop for reordering page numbers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const newPageOrder = [...pageOrder];
    const [movedPage] = newPageOrder.splice(draggedIndex, 1);
    newPageOrder.splice(targetIndex, 0, movedPage);
    setPageOrder(newPageOrder);
  };

  const handleDownload = async () => {
    if (!pdfDoc || loading) return;

    setLoading(true);
    setError('');

    try {
      const newPdfDoc = await PDFDocument.create();

      for (const originalPageIndex of pageOrder) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [originalPageIndex]);
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rearranged_${file ? file.name.replace('.pdf', '') : 'document'}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      // Optionally clear the file and state after download
      // clearFile();

    } catch (err) {
      setError('Error rearranging PDF.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setPageOrder([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Rearrange PDF</h1>
          <p className="text-gray-300">Change the order of pages in your PDF document</p>
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
                 <div {...getRootProps()} className={`w-full max-w-xl flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition-colors ${isDragActive ? 'border-blue-500 bg-gray-700/70' : ''}`}>
                  <input {...getInputProps()} ref={fileInputRef} />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
                      {isDragActive ? (
                        <p className="mb-2 text-sm text-gray-400">Drop the files here ...</p>
                      ) : (
                         <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                      )}
                      <p className="text-xs text-gray-500">PDF files only</p>
                    </div>
                </div>
              </div>
            )}

            {/* Page Reordering Interface */}
            {file && totalPages > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">Drag and Drop to Reorder Pages</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {pageOrder.map((originalIndex, currentIndex) => (
                    <div
                      key={originalIndex} // Use original index as key
                      draggable
                      onDragStart={(e) => handleDragStart(e, currentIndex)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, currentIndex)}
                      className="flex flex-col items-center p-4 rounded-lg bg-gray-600 text-white cursor-grab active:cursor-grabbing shadow hover:bg-gray-500 transition-colors"
                    >
                      <FiGrid className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Page {originalIndex + 1}</span>
                      <span className="text-xs text-gray-300">(#{currentIndex + 1})</span>
                    </div>
                  ))}
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
            {file && totalPages > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:scale-105'}`}
                >
                  <FiDownload className="w-5 h-5 mr-2" />
                  {loading ? 'Processing...' : 'Download Rearranged PDF'}
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

export default RearrangePdf; 