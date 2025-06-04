import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiUnlock, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import axios from 'axios';

const UnlockPdf = () => {
  useEffect(() => {
    document.title = 'Unlock PDF | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setFile(null);
      setPassword('');
      return;
    }

    setFile(selectedFile);
    setError('');
    setPassword('');
  };

  const handleUnlock = async () => {
    if (!file || !password) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('password', password);

      // Check if we're on a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/unlock-pdf`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout for mobile devices
        timeout: isMobile ? 30000 : 15000,
      });

      // Create a download link for the unlocked PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unlocked_${file.name}`);
      
      // For mobile devices, open in new tab if download doesn't work
      if (isMobile) {
        try {
          document.body.appendChild(link);
          link.click();
          // Wait a bit before removing the link
          setTimeout(() => {
            link.remove();
            window.URL.revokeObjectURL(url);
          }, 1000);
        } catch (mobileError) {
          console.error('Mobile download error:', mobileError);
          // Fallback: Open in new tab
          window.open(url, '_blank');
        }
      } else {
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      // Reset state
      setFile(null);
      setPassword('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Error unlocking PDF:', err);
      if (err.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || 'Error unlocking PDF. Please try again.');
          } catch (e) {
            setError('Error unlocking PDF. Please try again.');
          }
        };
        reader.readAsText(err.response.data);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again with a smaller file or check your internet connection.');
      } else {
        setError('Error unlocking PDF. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPassword('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-6"
          >
            <FiUnlock className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Unlock PDF</h1>
          <p className="text-xl text-blue-200/90">
            Remove password protection from your PDF files
          </p>
        </div>

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

            {/* Password Input */}
            {file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Enter Password to Unlock</h3>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
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
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={handleUnlock}
                disabled={!file || !password || loading}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  !file || !password || loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                }`}
              >
                <FiUnlock className="w-5 h-5 mr-2" />
                {loading ? 'Unlocking...' : 'Unlock PDF'}
              </button>
              {file && (
                <button
                  onClick={clearFile}
                  className="flex items-center px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-700 hover:scale-105 transition-all"
                >
                  <FiTrash2 className="w-5 h-5 mr-2" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default UnlockPdf; 