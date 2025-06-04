import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiTrash2 } from 'react-icons/fi';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useEffect } from 'react';
import Footer from '../components/Footer';

const AddHeadersFooters = () => {
  useEffect(() => {
    document.title = 'Add Headers and Footers | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState('#000000');
  const [placement, setPlacement] = useState('center'); // Can be 'left', 'center', 'right'
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
    setHeaderText('');
    setFooterText('');
    setFontSize(12);
    setTextColor('#000000');
    setPlacement('center');
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
  };

  const handleAddHeadersFooters = async () => {
    if (!file || (!headerText && !footerText)) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const color = hexToRgb(textColor);

      for (const page of pages) {
        const { width, height } = page.getSize();

        // Add Header
        if (headerText) {
          const headerWidth = font.widthOfTextAtSize(headerText, fontSize);
          let headerX;
          switch (placement) {
            case 'left':
              headerX = 30; // Left margin
              break;
            case 'center':
              headerX = (width - headerWidth) / 2;
              break;
            case 'right':
              headerX = width - headerWidth - 30; // Right margin
              break;
            default:
              headerX = (width - headerWidth) / 2;
          }
          page.drawText(headerText, {
            x: headerX,
            y: height - 30, // Top margin
            font,
            size: fontSize,
            color: rgb(color.r, color.g, color.b),
          });
        }

        // Add Footer
        if (footerText) {
          const footerWidth = font.widthOfTextAtSize(footerText, fontSize);
          let footerX;
          switch (placement) {
            case 'left':
              footerX = 30; // Left margin
              break;
            case 'center':
              footerX = (width - footerWidth) / 2;
              break;
            case 'right':
              footerX = width - footerWidth - 30; // Right margin
              break;
            default:
              footerX = (width - footerWidth) / 2;
          }
          page.drawText(footerText, {
            x: footerX,
            y: 30, // Bottom margin
            font,
            size: fontSize,
            color: rgb(color.r, color.g, color.b),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `headers_footers_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      // Reset state
      clearFile();

    } catch (err) {
      setError('Error adding headers and footers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    setHeaderText('');
    setFooterText('');
    setFontSize(12);
    setTextColor('#000000');
    setPlacement('center');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            <h1 className="text-4xl font-bold text-white mb-4">Add Headers and Footers</h1>
            <p className="text-gray-300">Add custom headers and footers to your PDF document</p>
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
                  <label className="flex flex-col items-center justify-center w-full h-40 sm:h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
                      <p className="mb-2 text-sm text-gray-400 text-center px-4">
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
                {file && <p className="mt-4 text-gray-300 text-center">Selected file: <span className="font-semibold text-white">{file.name}</span></p>}
              </div>

              {/* Text Input */}
              {file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-4 sm:p-6 space-y-4"
              >
              <h3 className="text-lg font-semibold text-white text-center sm:text-left">Header/Footer Options</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="header-text" className="block text-sm font-medium text-gray-400 mb-1">Header Text:</label>
                  <input
                    type="text"
                    id="header-text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional header text"
                  />
                </div>
                <div>
                  <label htmlFor="footer-text" className="block text-sm font-medium text-gray-400 mb-1">Footer Text:</label>
                  <input
                    type="text"
                    id="footer-text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional footer text"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="font-size" className="block text-sm font-medium text-gray-400 mb-1">Font Size:</label>
                  <input
                    type="number"
                    id="font-size"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label htmlFor="text-color" className="block text-sm font-medium text-gray-400 mb-1">Text Color:</label>
                  <input
                    type="color"
                    id="text-color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="placement" className="block text-sm font-medium text-gray-400 mb-1">Placement:</label>
                  <select
                    id="placement"
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-center sm:text-left"
                >
                  {error}
                </motion.div>
              )}

              {/* Action Buttons */}
               {file && (!loading) && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <button
                  onClick={handleAddHeadersFooters}
                  disabled={!file || (!headerText && !footerText) || loading}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    !file || (!headerText && !footerText) || loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                  }`}
                >
                  <FiDownload className="w-5 h-5 mr-2" />
                  {loading ? 'Processing...' : 'Add Headers/Footers'}
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
              {/* Loading State */}
              {file && loading && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                    <button
                       disabled={true}
                       className="flex items-center px-6 py-3 rounded-xl font-medium transition-all bg-gray-600 cursor-not-allowed"
                    >
                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
                        </svg>
                       Processing...
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
      <Footer />
    </>
  );
};

export default AddHeadersFooters; 