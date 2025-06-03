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

              {/* Text Input */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="header-text" className="block text-sm font-medium text-gray-300">Header Text:</label>
                  <input
                    type="text"
                    id="header-text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="footer-text" className="block text-sm font-medium text-gray-300">Footer Text:</label>
                  <input
                    type="text"
                    id="footer-text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="font-size" className="block text-sm font-medium text-gray-300">Font Size:</label>
                  <input
                    type="number"
                    id="font-size"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label htmlFor="text-color" className="block text-sm font-medium text-gray-300">Text Color:</label>
                  <input
                    type="color"
                    id="text-color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="mt-1 block w-full px-1 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="placement" className="block text-sm font-medium text-gray-300">Placement:</label>
                  <select
                    id="placement"
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
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

              {/* Action Button */}
              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={handleAddHeadersFooters}
                    disabled={!file || loading || (!headerText && !footerText)}
                    className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all ${
                      !file || loading || (!headerText && !footerText)
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                    }`}
                  >
                    {loading ? 'Adding...' : 'Add Headers & Footers'}
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