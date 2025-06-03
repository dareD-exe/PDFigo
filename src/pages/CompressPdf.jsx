import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiMinimize2, FiTrash2 } from 'react-icons/fi';
import { PDFDocument } from 'pdf-lib';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const CompressPdf = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Compress PDF | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Compression: This is a basic approach. PDF compression is complex
      // and often requires more sophisticated methods like image re-sampling,
      // font subsetting, etc., which typically need a backend library or service.
      // pdf-lib's save() method with options can provide some basic optimization.
      
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false, // May help with compatibility/basic compression
        addMetadata: false, // Reduces file size slightly by removing metadata
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Create a local URL for the blob and trigger download
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the local URL
      URL.revokeObjectURL(downloadUrl);

      // Reset state
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      setError('Error compressing PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      <CosmicBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 w-full flex-grow"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 mb-6"
          >
            <FiMinimize2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Compress PDF</h1>
          <p className="text-xl text-blue-200/90">
            Reduce PDF file size while maintaining quality
          </p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-yellow-500/20 shadow-xl">
          <div className="space-y-6">
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
                onClick={handleCompress}
                disabled={!file || loading}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  !file || loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                }`}
              >
                <FiMinimize2 className="w-5 h-5 mr-2" />
                {loading ? 'Compressing...' : 'Compress PDF'}
              </button>
              {file && (
                <button
                  onClick={() => {
                    setFile(null);
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
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default CompressPdf; 