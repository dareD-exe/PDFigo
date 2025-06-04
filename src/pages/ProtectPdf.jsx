import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiLock, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import axios from 'axios';

const ProtectPdf = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Protect PDF | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: true,
    modifying: true,
    annotating: true,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: true
  });
  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setFile(null);
      setPassword('');
      setConfirmPassword('');
      return;
    }

    setFile(selectedFile);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const validatePassword = (pass) => {
    if (pass.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(pass)) return 'Password must contain at least one special character (!@#$%^&*)';
    return '';
  };

  const handleProtect = async () => {
    if (!file || !password || !confirmPassword) return;

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('password', password);
      formData.append('permissions', JSON.stringify(permissions));

      // Check if we're on a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const response = await axios.post('http://localhost:5000/api/protect-pdf', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout for mobile devices
        timeout: isMobile ? 30000 : 15000,
      });

      // Create a download link for the protected PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `protected_${file.name}`);
      
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
      setConfirmPassword('');
      setPermissions({
        printing: true,
        copying: true,
        modifying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
      });

    } catch (err) {
      console.error('Error protecting PDF:', err);
      if (err.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || 'Error protecting PDF. Please try again.');
          } catch (e) {
            setError('Error protecting PDF. Please try again.');
          }
        };
        reader.readAsText(err.response.data);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again with a smaller file or check your internet connection.');
      } else {
        setError('Error protecting PDF. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setError('');
    setPermissions({
      printing: true,
      copying: true,
      modifying: true,
      annotating: true,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <CosmicBackground />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 w-full flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Protect PDF</h1>
          <p className="text-gray-300">Add password protection and control access to your PDF document</p>
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
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-500/20' : ''
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF files only</p>
                  </div>
                </div>
              </div>
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-gray-300"
                >
                  Selected file: <span className="font-semibold text-white">{file.name}</span>
                </motion.div>
              )}
            </div>

            {/* Password and Permissions */}
            {file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6 space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                
                {/* Password Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Password
                    </label>
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.printing}
                        onChange={(e) => setPermissions(prev => ({ ...prev, printing: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-gray-300">Allow Printing</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.copying}
                        onChange={(e) => setPermissions(prev => ({ ...prev, copying: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-gray-300">Allow Copying</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.modifying}
                        onChange={(e) => setPermissions(prev => ({ ...prev, modifying: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-gray-300">Allow Modifying</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.annotating}
                        onChange={(e) => setPermissions(prev => ({ ...prev, annotating: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-gray-300">Allow Annotating</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.fillingForms}
                        onChange={(e) => setPermissions(prev => ({ ...prev, fillingForms: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-gray-300">Allow Form Filling</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.contentAccessibility}
                        onChange={(e) => setPermissions(prev => ({ ...prev, contentAccessibility: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-gray-300">Allow Content Accessibility</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.documentAssembly}
                        onChange={(e) => setPermissions(prev => ({ ...prev, documentAssembly: e.target.checked }))}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-gray-300">Allow Document Assembly</span>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={clearFile}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleProtect}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg bg-blue-600 text-white font-medium flex items-center space-x-2 ${
                      loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FiLock />
                        <span>Protect PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ProtectPdf; 