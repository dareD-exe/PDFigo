import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiTrash2, FiImage } from 'react-icons/fi';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useEffect } from 'react';
import Footer from '../components/Footer';

const AddImageSignature = () => {
  useEffect(() => {
    document.title = 'Add Image Signature | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [pdfFile, setPdfFile] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState('center'); // Can be 'top-left', etc.
  const [size, setSize] = useState(100); // Size in pixels
  const pdfFileInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const handlePdfFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setPdfFile(null);
      return;
    }

    setPdfFile(selectedFile);
    setError('');
  };

  const handleSignatureChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file for the signature');
      setSignatureImage(null);
      return;
    }

    setSignatureImage(selectedFile);
    setError('');
  };

  const handleAddSignature = async () => {
    if (!pdfFile || !signatureImage) return;

    setLoading(true);
    setError('');

    try {
      const pdfArrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();

      const signatureImageBytes = await signatureImage.arrayBuffer();
      let embeddedImage;
      
      // Determine image type and embed
      if (signatureImage.type === 'image/jpeg') {
        embeddedImage = await pdfDoc.embedJpg(signatureImageBytes);
      } else if (signatureImage.type === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(signatureImageBytes);
      } else {
        setError('Unsupported image format. Please use JPEG or PNG.');
        setLoading(false);
        return;
      }
      
      const imageDims = embeddedImage.scale(size / embeddedImage.width);

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        let x, y;

        // Determine position (basic implementation, can be expanded)
        switch (position) {
          case 'top-left':
            x = 50;
            y = height - 50 - imageDims.height;
            break;
          case 'top-center':
            x = (width - imageDims.width) / 2;
            y = height - 50 - imageDims.height;
            break;
          case 'top-right':
            x = width - 50 - imageDims.width;
            y = height - 50 - imageDims.height;
            break;
          case 'middle-left':
             x = 50;
             y = (height - imageDims.height) / 2;
             break;
          case 'center':
            x = (width - imageDims.width) / 2;
            y = (height - imageDims.height) / 2;
            break;
          case 'middle-right':
             x = width - 50 - imageDims.width;
             y = (height - imageDims.height) / 2;
             break;
          case 'bottom-left':
            x = 50;
            y = 50;
            break;
          case 'bottom-center':
            x = (width - imageDims.width) / 2;
            y = 50;
            break;
          case 'bottom-right':
            x = width - 50 - imageDims.width;
            y = 50;
            break;
          default:
            x = (width - imageDims.width) / 2; // Default to center
            y = (height - imageDims.height) / 2;
        }

        page.drawImage(embeddedImage, {
          x,
          y,
          width: imageDims.width,
          height: imageDims.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `signed_${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      // Reset state
      clearFiles();

    } catch (err) {
      setError('Error adding signature.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFiles = () => {
    setPdfFile(null);
    setSignatureImage(null);
    setError('');
    setPosition('center');
    setSize(100);
    if (pdfFileInputRef.current) {
      pdfFileInputRef.current.value = '';
    }
     if (signatureInputRef.current) {
      signatureInputRef.current.value = '';
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
            <h1 className="text-4xl font-bold text-white mb-4">Add Image Signature</h1>
            <p className="text-gray-300">Add an image signature to your PDF document</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700"
          >
            <div className="space-y-8">
              {/* PDF File Upload */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-xl">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload PDF</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF files only</p>
                    </div>
                    <input
                      ref={pdfFileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handlePdfFileChange}
                    />
                  </label>
                </div>
                {pdfFile && <p className="mt-4 text-gray-300">Selected PDF: <span className="font-semibold text-white">{pdfFile.name}</span></p>}
              </div>

               {/* Signature Image Upload */}
              {pdfFile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-700/30 rounded-xl p-6 space-y-4"
                >
                   <div className="flex flex-col items-center justify-center">
                    <div className="w-full max-w-xl">
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiImage className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload Signature Image</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">Image files only</p>
                        </div>
                        <input
                          ref={signatureInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleSignatureChange}
                        />
                      </label>
                    </div>
                    {signatureImage && <p className="mt-4 text-gray-300">Selected Signature: <span className="font-semibold text-white">{signatureImage.name}</span></p>}
                  </div>
                </motion.div>
              )}

              {/* Signature Options */}
              {signatureImage && (
                   <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gray-700/30 rounded-xl p-6 space-y-4"
                    >
                        <h3 className="text-lg font-semibold text-white">Signature Options</h3>
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
                            <label className="block text-sm font-medium text-gray-400 mb-1">Size (pixels wide)</label>
                            <input
                                type="number"
                                value={size}
                                onChange={(e) => setSize(parseInt(e.target.value, 10) || 0)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
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
              {pdfFile && signatureImage && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleAddSignature}
                    disabled={!pdfFile || !signatureImage || loading}
                    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                      !pdfFile || !signatureImage || loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                    }`}
                  >
                    {loading ? 'Adding Signature...' : 'Add Signature & Download'}
                  </button>
                  <button
                    onClick={clearFiles}
                    className="flex items-center px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-700 hover:scale-105 transition-all"
                  >
                    <FiTrash2 className="w-5 h-5 mr-2" />
                    Clear Files
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

export default AddImageSignature; 