import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiType, FiTrash2 } from 'react-icons/fi';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { useEffect } from 'react';

const AddTextWatermark = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Add Text Watermark | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [watermarkText, setWatermarkText] = useState('');
  const [fontSize, setFontSize] = useState(48); // Larger default for watermark
  const [textColor, setTextColor] = useState('#D3D3D3'); // Light gray default
  const [opacity, setOpacity] = useState(0.3); // Semi-transparent default
  const [position, setPosition] = useState('center'); // Default position
  const [rotation, setRotation] = useState(0); // Default rotation
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
    setWatermarkText('');
    setFontSize(48);
    setTextColor('#D3D3D3');
    setOpacity(0.3);
    setPosition('center');
    setRotation(0);
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
  };

  const handleAddWatermark = async () => {
    if (!file || !watermarkText) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const watermarkColor = hexToRgb(textColor);

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x, y;

        // Determine position
        switch (position) {
          case 'top-left':
            x = 20;
            y = height - 20 - textHeight;
            break;
          case 'top-center':
            x = (width - textWidth) / 2;
            y = height - 20 - textHeight;
            break;
          case 'top-right':
            x = width - 20 - textWidth;
            y = height - 20 - textHeight;
            break;
          case 'middle-left':
             x = 20;
             y = (height - textHeight) / 2;
             break;
          case 'center':
            x = (width - textWidth) / 2;
            y = (height - textHeight) / 2;
            break;
          case 'middle-right':
             x = width - 20 - textWidth;
             y = (height - textHeight) / 2;
             break;
          case 'bottom-left':
            x = 20;
            y = 20;
            break;
          case 'bottom-center':
            x = (width - textWidth) / 2;
            y = 20;
            break;
          case 'bottom-right':
            x = width - 20 - textWidth;
            y = 20;
            break;
          default:
            x = (width - textWidth) / 2; // Default to center
            y = (height - textHeight) / 2;
        }

        page.drawText(watermarkText, {
          x,
          y,
          font,
          size: fontSize,
          color: rgb(watermarkColor.r, watermarkColor.g, watermarkColor.b),
          opacity: opacity,
          rotate: degrees(rotation),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `watermarked_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      // Reset state
      clearFile();

    } catch (err) {
      setError('Error adding watermark.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    setWatermarkText('');
    setFontSize(48);
    setTextColor('#D3D3D3');
    setOpacity(0.3);
    setPosition('center');
    setRotation(0);
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
          <h1 className="text-4xl font-bold text-white mb-4">Add Text Watermark</h1>
          <p className="text-gray-300">Add a text watermark to your PDF document</p>
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

            {/* Watermark Options */}
            {file && ( 
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-700/30 rounded-xl p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">Watermark Options</h3>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                        <select
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="top-left">Top Left</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-right">Top Right</option>
                            <option value="middle-left">Middle Left</option>
                            <option value="center">Center</option>
                            <option value="middle-right">Middle Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-right">Bottom Right</option>
                        </select>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Text Color</label>
                      <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-10 rounded-lg bg-gray-800 border border-gray-600 cursor-pointer"
                      />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Opacity (0.0 - 1.0)</label>
                      <input
                          type="number"
                          step="0.1"
                          min="0.0"
                          max="1.0"
                          value={opacity}
                          onChange={(e) => setOpacity(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Rotation (degrees)</label>
                      <input
                          type="number"
                          value={rotation}
                          onChange={(e) => setRotation(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onClick={handleAddWatermark}
                  disabled={!file || !watermarkText || loading}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    !file || !watermarkText || loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                  }`}
                >
                  <FiType className="w-5 h-5 mr-2" />
                  {loading ? 'Adding Watermark...' : 'Add Watermark & Download'}
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

export default AddTextWatermark; 