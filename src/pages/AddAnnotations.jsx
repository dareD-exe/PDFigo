import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useEffect } from 'react';

// Note: A full-featured PDF annotation tool client-side is highly complex.
// This implementation focuses on adding simple text annotations at a specified position.

const AddAnnotations = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Add Annotations | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [annotationText, setAnnotationText] = useState('');
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Default position
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState('#000000');
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
    setAnnotationText('');
    setPosition({ x: 50, y: 50 });
    setFontSize(12);
    setTextColor('#000000');
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
  };

  const handleAddAnnotation = async () => {
    if (!file || !annotationText) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      if (pages.length === 0) {
        setError('PDF has no pages.');
        setLoading(false);
        return;
      }

      const firstPage = pages[0]; // Add annotation to the first page for simplicity
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const annotationColor = hexToRgb(textColor);

      firstPage.drawText(annotationText, {
        x: position.x,
        y: position.y,
        font: helveticaFont,
        size: fontSize,
        color: rgb(annotationColor.r, annotationColor.g, annotationColor.b),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `annotated_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      // Reset state
      clearFile();

    } catch (err) {
      setError('Error adding annotation.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    setAnnotationText('');
    setPosition({ x: 50, y: 50 });
    setFontSize(12);
    setTextColor('#000000');
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
          <h1 className="text-4xl font-bold text-white mb-4">Add Basic Annotations</h1>
          <p className="text-gray-300">Add simple text annotations to your PDF document</p>
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

            {/* Annotation Input */}
            {file && ( 
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">Add Text Annotation (on first page)</h3>
                <input
                  type="text"
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Enter text to add to the PDF..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">X Position</label>
                        <input
                            type="number"
                            value={position.x}
                            onChange={(e) => setPosition({...position, x: parseInt(e.target.value, 10) || 0})}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Y Position</label>
                         <input
                            type="number"
                            value={position.y}
                            onChange={(e) => setPosition({...position, y: parseInt(e.target.value, 10) || 0})}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Font Size</label>
                         <input
                            type="number"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                 </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Text Color</label>
                    <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 rounded-lg bg-gray-800 border border-gray-600 cursor-pointer"
                    />
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
            {file && ( // Show buttons if file is loaded
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleAddAnnotation}
                  disabled={!file || !annotationText || loading}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    !file || !annotationText || loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                  }`}
                >
                  <FiEdit className="w-5 h-5 mr-2" />
                  {loading ? 'Adding Annotation...' : 'Add Annotation & Download'}
                </button>
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
  );
};

export default AddAnnotations; 