import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { FiChevronRight } from 'react-icons/fi';
import { useEffect } from 'react';
import { tools } from '../config/tools';

const ToolsPage = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Tools | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900 text-white">
      <CosmicBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 w-full flex-grow"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4">
            All PDF Tools
          </h1>
          <p className="mt-4 text-xl text-blue-200/90 max-w-2xl mx-auto">
            Explore our suite of powerful tools to manage and transform your PDF files.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.path}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 + 0.4, duration: 0.7 }}
              whileHover={{ scale: 1.05, y: -10, boxShadow: '0 15px 30px rgba(0, 255, 255, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="relative group rounded-2xl overflow-hidden bg-gray-800/60 border border-blue-700/50 shadow-lg p-6 flex flex-col items-start"
            >
              <div className={`absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${tool.glow}`}></div>
              <Link to={tool.path} className="relative z-10 flex flex-col items-start h-full w-full">
                <div className={`mb-4 p-4 rounded-full bg-gradient-to-br ${tool.glow} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  {React.createElement(tool.icon, { className: 'w-10 h-10 text-white' })}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-200">{tool.title}</h3>
                <p className="text-blue-100/80 text-base mb-4 flex-grow">{tool.description}</p>
                <span className="mt-auto inline-flex items-center text-blue-300 group-hover:text-cyan-400 transition-colors duration-200 font-semibold">
                  Use Tool
                  <FiChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default ToolsPage; 