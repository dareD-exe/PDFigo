import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiList, FiTrash2, FiType } from 'react-icons/fi';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const PageNumbers = () => {
  useEffect(() => {
    document.title = 'Page Numbers | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    position: 'bottom-center',
    startNumber: 1,
    fontSize: 12,
    color: '#000000',
    format: '1',
  });
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

  const handleOptionsChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
  };

  const handleAddPageNumbers = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const textColor = hexToRgb(options.color);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNumber = options.startNumber + i;
        let text;
        
        // Format the page number based on the selected format
        switch (options.format) {
          case '1/10':
            text = `${pageNumber}/${pages.length}`;
            break;
          case 'Page 1':
            text = `Page ${pageNumber}`;
            break;
          default:
            text = `${pageNumber}`;
        }

        const textWidth = font.widthOfTextAtSize(text, options.fontSize);
        const textHeight = font.heightAtSize(options.fontSize);

        let x, y;

        // Determine position
        const margin = 20;
        switch (options.position) {
          case 'top-left':
            x = margin;
            y = height - margin - textHeight;
            break;
          case 'top-center':
            x = (width - textWidth) / 2;
            y = height - margin - textHeight;
            break;
          case 'top-right':
            x = width - margin - textWidth;
            y = height - margin - textHeight;
            break;
          case 'bottom-left':
            x = margin;
            y = margin;
            break;
          case 'bottom-center':
            x = (width - textWidth) / 2;
            y = margin;
            break;
          case 'bottom-right':
            x = width - margin - textWidth;
            y = margin;
            break;
          default:
            x = (width - textWidth) / 2; // Default to bottom-center
            y = margin;
        }

        page.drawText(text, {
          x,
          y,
          font,
          size: options.fontSize,
          color: rgb(textColor.r, textColor.g, textColor.b),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `pagenumbered_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      // Reset state
      setFile(null);
      setOptions({
        position: 'bottom-center',
        startNumber: 1,
        fontSize: 12,
        color: '#000000',
        format: '1',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      setError('Error adding page numbers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setOptions({
      position: 'bottom-center',
      startNumber: 1,
      fontSize: 12,
      color: '#000000',
      format: '1',
    });
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
            <FiType className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Add Page Numbers</h1>
          <p className="text-xl text-blue-200/90">
            Add page numbers to your PDF documents with custom formatting
          </p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/20 shadow-xl">
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="file-upload"
                className="w-full max-w-xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-teal-500/30 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
              >
                <FiUpload className="w-12 h-12 text-teal-400 mb-4" />
                <span className="text-lg text-teal-200">
                  {file ? file.name : 'Choose a PDF file or drag it here'}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-lg text-teal-200">Number Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: '1', label: '1' },
                        { value: '1/10', label: '1/10' },
                        { value: 'Page 1', label: 'Page 1' }
                      ].map((fmt) => (
                        <button
                          key={fmt.value}
                          onClick={() => setOptions(prev => ({ ...prev, format: fmt.value }))}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            options.format === fmt.value
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-lg text-teal-200">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'bottom-left', label: 'Bottom Left' },
                        { value: 'bottom-center', label: 'Bottom Center' },
                        { value: 'bottom-right', label: 'Bottom Right' }
                      ].map((pos) => (
                        <button
                          key={pos.value}
                          onClick={() => setOptions(prev => ({ ...prev, position: pos.value }))}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            options.position === pos.value
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleAddPageNumbers}
                    disabled={loading}
                    className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-700 rounded-full hover:from-teal-700 hover:to-cyan-800 transition-all duration-200 shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        <FiType className="w-5 h-5 mr-2" />
                        Add Page Numbers
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default PageNumbers; 