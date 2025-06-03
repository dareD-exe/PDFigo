import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiScissors, FiDownload, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PDFDocument } from 'pdf-lib';
import { useEffect } from 'react';

const SplitPdf = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Split PDF | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [splitPages, setSplitPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setFile(selectedFile);
    setError('');
    setLoading(true);

    try {
      // Read the PDF file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      setTotalPages(pageCount);
      setSplitPages(Array(pageCount).fill(false));
    } catch (err) {
      setError('Error reading PDF file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSplit = async () => {
    if (!file || !currentUser) return;

    setLoading(true);
    setError('');

    try {
      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Create new PDFs for selected pages
      const selectedPages = splitPages
        .map((selected, index) => selected ? index : -1)
        .filter(index => index !== -1);

      if (selectedPages.length === 0) {
        setError('Please select at least one page to split');
        return;
      }

      const newPdf = await PDFDocument.create();
      
      for (const pageIndex of selectedPages) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
        newPdf.addPage(copiedPage);
      }

      // Save the new PDF
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a local URL for the blob and trigger download
      const downloadUrl = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `split_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the local URL
      URL.revokeObjectURL(downloadUrl);

      // Reset state
      setFile(null);
      setSplitPages([]);
      setTotalPages(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Error processing PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (index) => {
    setSplitPages(prev => {
      const newPages = [...prev];
      newPages[index] = !newPages[index];
      return newPages;
    });
  };

  const selectAll = () => {
    setSplitPages(Array(totalPages).fill(true));
  };

  const deselectAll = () => {
    setSplitPages(Array(totalPages).fill(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Split PDF</h1>
          <p className="text-gray-300">Extract specific pages from your PDF document</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700"
        >
          <div className="space-y-8">
            {/* File Upload */}
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

            {/* Page Selection */}
            {file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Select Pages</h3>
                  <div className="space-x-2">
                    <button
                      onClick={selectAll}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {splitPages.map((selected, index) => (
                    <button
                      key={index}
                      onClick={() => togglePage(index)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {index + 1}
                    </button>
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleSplit}
                disabled={!file || loading}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  !file || loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                }`}
              >
                <FiScissors className="w-5 h-5 mr-2" />
                {loading ? 'Processing...' : 'Split PDF'}
              </button>
              {file && (
                <button
                  onClick={() => {
                    setFile(null);
                    setSplitPages([]);
                    setTotalPages(0);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="flex items-center px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-700 hover:scale-105 transition-all"
                >
                  <FiTrash2 className="w-5 h-5 mr-2" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplitPdf; 