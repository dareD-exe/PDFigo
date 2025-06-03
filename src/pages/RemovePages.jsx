import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiTrash2 } from 'react-icons/fi';
import { PDFDocument } from 'pdf-lib';
import { useEffect } from 'react';

const RemovePages = () => {
  useEffect(() => {
    document.title = 'Remove Pages | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagesToRemoveInput, setPagesToRemoveInput] = useState('');
  const [totalPages, setTotalPages] = useState(0);
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
    setPagesToRemoveInput('');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
    } catch (err) {
      setError('Error loading PDF file');
      console.error(err);
      clearFile();
    } finally {
      setLoading(false);
    }
  };

  const parsePagesToRemove = (input, totalPages) => {
    const pages = new Set();
    const ranges = input.split(',').map(range => range.trim()).filter(range => range);

    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(num => parseInt(num.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
          for (let i = start; i <= end; i++) {
            pages.add(i - 1); // Convert to 0-indexed
          }
        } else {
          return { error: `Invalid range: ${range}` };
        }
      } else {
        const pageNum = parseInt(range, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pages.add(pageNum - 1); // Convert to 0-indexed
        } else {
          return { error: `Invalid page number: ${range}` };
        }
      }
    }
    return { pages: Array.from(pages).sort((a, b) => a - b) };
  };

  const handleRemovePages = async () => {
    if (!file || !pagesToRemoveInput) return;

    setLoading(true);
    setError('');

    const parseResult = parsePagesToRemove(pagesToRemoveInput, totalPages);

    if (parseResult.error) {
      setError(parseResult.error);
      setLoading(false);
      return;
    }

    const pagesToRemoveIndices = parseResult.pages;

    if (pagesToRemoveIndices.length === 0) {
        setError('No valid pages specified for removal.');
        setLoading(false);
        return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Create a new PDF with pages that are NOT in the pagesToRemoveIndices list
      const newPdfDoc = await PDFDocument.create();
      const originalPages = pdfDoc.getPages();

      for (let i = 0; i < originalPages.length; i++) {
        if (!pagesToRemoveIndices.includes(i)) {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
          newPdfDoc.addPage(copiedPage);
        }
      }

      if (newPdfDoc.getPageCount() === 0) {
          setError('All pages were removed. The resulting PDF is empty.');
          setLoading(false);
          // Optionally clear file or keep it loaded
          // clearFile();
          return;
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `removed_pages_${file ? file.name.replace('.pdf', '') : 'document'}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      // Reset state
      clearFile();

    } catch (err) {
      setError('Error removing pages from PDF.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setLoading(false);
    setError('');
    setPagesToRemoveInput('');
    setTotalPages(0);
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
          <h1 className="text-4xl font-bold text-white mb-4">Remove Pages</h1>
          <p className="text-gray-300">Remove specific pages or ranges from your PDF document</p>
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

            {/* Pages to Remove Input */}
            {file && totalPages > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">Enter Pages to Remove</h3>
                <p className="text-sm text-gray-400">Enter page numbers or ranges (e.g., 1, 3-5, 8)</p>
                <input
                  type="text"
                  value={pagesToRemoveInput}
                  onChange={(e) => setPagesToRemoveInput(e.target.value)}
                  placeholder={`e.g., 1, 3-5, ${totalPages}`}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {totalPages > 0 && <p className="text-sm text-gray-400">Total pages: {totalPages}</p>}
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
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleRemovePages}
                  disabled={!pagesToRemoveInput || loading}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    !pagesToRemoveInput || loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 hover:scale-105'
                  }`}
                >
                  <FiTrash2 className="w-5 h-5 mr-2" />
                  {loading ? 'Removing...' : 'Remove Pages'}
                </button>
                 <button
                  onClick={clearFile}
                  className="flex items-center px-6 py-3 rounded-xl font-medium bg-gray-600 hover:bg-gray-700 hover:scale-105 transition-all"
                >
                  <FiTrash2 className="w-5 h-5 mr-2" />
                  Clear File
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RemovePages; 