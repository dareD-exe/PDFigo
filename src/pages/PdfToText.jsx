import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiFileText, FiTrash2 } from 'react-icons/fi';
import { useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Footer from '../components/Footer';

// Set the worker source for PDF.js to the local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PdfToText = () => {
  useEffect(() => {
    document.title = 'PDF to Text | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setFile(null);
      setText('');
      return;
    }

    setFile(selectedFile);
    setError('');
    setText('');
  };

  const handleExtractText = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setText('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      let extractedText = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map(item => item.str).join(' ') + '\n';
      }

      setText(extractedText);

    } catch (err) {
      setError('Error extracting text.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    setText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadText = () => {
    if (text) {
      const blob = new Blob([text], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${file.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">PDF to Text</h1>
            <p className="text-gray-300">Extract text content from your PDF document</p>
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
                {file && <p className="mt-4 text-gray-300">Selected file: <span className="font-semibold text-white">{file.name}</span></p>}
              </div>

              {/* Extracted Text Display */}
              {text && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-700/30 rounded-xl p-6 space-y-4"
                >
                  <h3 className="text-lg font-semibold text-white">Extracted Text</h3>
                  <textarea
                    readOnly
                    value={text}
                    className="w-full h-64 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Extracted text will appear here..."
                  ></textarea>
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
              {file && ( // Show buttons if file is loaded
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleExtractText}
                    disabled={!file || loading}
                    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                      !file || loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                    }`}
                  >
                    <FiFileText className="w-5 h-5 mr-2" />
                    {loading ? 'Extracting...' : 'Extract Text'}
                  </button>
                  {text && (
                    <button
                      onClick={handleDownloadText}
                      className="flex items-center px-6 py-3 rounded-xl font-medium bg-green-600 hover:bg-green-700 hover:scale-105 transition-all"
                    >
                      <FiDownload className="w-5 h-5 mr-2" />
                      Download Text
                    </button>
                  )}
                  <button
                    onClick={clearFile}
                    className="flex items-center px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-700 hover:scale-105 transition-all"
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
      <Footer />
    </>
  );
};

export default PdfToText; 