import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer = () => (
  <motion.footer
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.8 }}
    className="w-full bg-gray-900/80 backdrop-blur-md border-t border-blue-800/40 py-10 mt-16 flex flex-col items-center justify-center text-gray-300 text-sm z-10"
  >
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2 text-2xl font-extrabold text-white tracking-widest" style={{ fontFamily: 'WDXL Lubrifont TC, cursive' }}>
            <FiFileText className="w-8 h-8 text-cyan-400" />
            PDFigo
          </div>
          <p className="text-gray-400 text-center md:text-left max-w-sm">Your all-in-one online PDF tool for easy document management.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-base">
          <Link to="/tools" className="hover:text-blue-400 transition duration-200">Tools</Link>
          <Link to="/about" className="hover:text-blue-400 transition duration-200">About Us</Link>
          <Link to="/contact" className="hover:text-blue-400 transition duration-200">Contact</Link>
          <Link to="/privacy-policy" className="hover:text-blue-400 transition duration-200">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-blue-400 transition duration-200">Terms of Service</Link>
        </div>

        {/* Social Media Links (Optional) */}
        {/*
        <div className="flex gap-6">
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition duration-200">
            <FiTwitter className="w-6 h-6" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition duration-200">
            <FiGithub className="w-6 h-6" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition duration-200">
            <FiLinkedin className="w-6 h-6" />
          </a>
        </div>
        */}
      </div>

      <div className="text-center text-gray-500 text-xs mt-8 pt-6 border-t border-gray-700/50">
        &copy; {new Date().getFullYear()} PDFigo. All rights reserved.
      </div>
    </div>
  </motion.footer>
);

export default Footer; 