import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiEdit, FiDownload, FiTrash2 } from 'react-icons/fi';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const EditPdf = () => {
  useEffect(() => {
    document.title = 'Edit PDF | PDFigo - Murtuja';
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

  const handleEdit = async () => {
    if (!file) return;

    setLoading(true);
    setError('Basic editing is not yet fully implemented client-side. This feature will be available soon.');
    // TODO: Implement basic editing using pdf-lib or other suitable client-side approach
    // Note: Full PDF editing client-side is very complex.

    // Placeholder for future implementation:
    // try {
    //   const arrayBuffer = await file.arrayBuffer();
    //   const pdfDoc = await PDFDocument.load(arrayBuffer);

    //   // *** Basic Editing Logic Here (e.g., adding text annotations) ***

    //   const pdfBytes = await pdfDoc.save();
    //   const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    //   const downloadUrl = URL.createObjectURL(blob);
    //   const link = document.createElement('a');
    //   link.href = downloadUrl;
    //   link.download = `edited_${file.name}`;
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   URL.revokeObjectURL(downloadUrl);

    //   setFile(null);
    //   if (fileInputRef.current) {
    //     fileInputRef.current.value = '';
    //   }
    // } catch (err) {
    //   setError('Error processing PDF for editing.');
    //   console.error(err);
    // } finally {
       setLoading(false);
    // }
  };

  const clearFile = () => {
    setFile(null);
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
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 mb-6"
          >
            <FiEdit className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Edit PDF</h1>
          <p className="text-xl text-blue-200/90">
            Add text or basic markup to your PDF document
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

            {/* Editing Controls - Placeholder */}
            {file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6 text-center text-gray-400"
              >
                <p>Basic editing features (adding text, shapes) are planned but not yet implemented in this client-side version.</p>
                <p>You can proceed to download, but no edits will be applied.</p>
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
                onClick={handleEdit}
                disabled={!file || loading}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  !file || loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                }`}
              >
                <FiEdit className="w-5 h-5 mr-2" />
                {loading ? 'Processing...' : 'Process PDF (No Edits Yet)'}
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

export default EditPdf; 