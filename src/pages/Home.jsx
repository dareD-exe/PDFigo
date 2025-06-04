import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiZap, FiLock, FiCloudOff, FiImage, FiFileText, FiLayers } from 'react-icons/fi';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const Home = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Home | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const tools = [
    {
      title: 'PDF Merge',
      description: 'Combine multiple PDF files into a single document',
      path: '/pdf-merge',
      icon: <FiLayers className="w-8 h-8" />,
      glow: 'from-cyan-400 to-blue-600',
      border: 'border-cyan-500',
    },
    {
      title: 'PDF to Image',
      description: 'Convert PDF pages to high-quality images',
      path: '/pdf-to-image',
      icon: <FiImage className="w-8 h-8" />,
      glow: 'from-emerald-400 to-emerald-600',
      border: 'border-emerald-500',
    },
    {
      title: 'Image to PDF',
      description: 'Convert images to PDF format',
      path: '/image-to-pdf',
      icon: <FiFileText className="w-8 h-8" />,
      glow: 'from-pink-500 to-fuchsia-600',
      border: 'border-pink-500',
      },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white">
      <CosmicBackground />
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center z-10">
      <motion.div
          initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
      >
          <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-700 p-8 shadow-2xl mb-4 animate-pulse-slow">
            <FiFileText className="w-16 h-16 text-white" />
          </span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-neon animate-gradient-x mb-4"
          >
            Your Ultimate PDF Toolkit
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="text-xl sm:text-2xl text-blue-200/90 max-w-3xl mx-auto mb-8"
          >
            Access a suite of powerful tools to effortlessly manage, convert, and secure your PDF files. Fast, intuitive, and built for the future.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
          >
            <Link to="/tools" className="inline-flex items-center justify-center px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-700 rounded-full shadow-lg hover:from-cyan-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105">
              Explore Tools
              <FiChevronRight className="w-6 h-6 ml-2" />
            </Link>
          </motion.div>
      </motion.div>
      </section>

      {/* Tools Grid */}
      <section className="flex-1 py-20 px-4 sm:px-6 lg:px-8 z-10">
      <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mb-16 tracking-wide">Featured Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-12">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1 + 0.4, duration: 0.7 }}
                whileHover={{ scale: 1.05, y: -10, boxShadow: '0 15px 30px rgba(0, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="h-full relative group rounded-2xl overflow-hidden bg-gray-800/60 border border-blue-700/50 shadow-lg"
            >
                <Link to={tool.path} className="block h-full p-8">
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${tool.glow}`}></div>
                  <div className="relative z-10 flex flex-col items-start">
                    <div className={`mb-6 p-4 rounded-full bg-gradient-to-br ${tool.glow} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      {React.cloneElement(tool.icon, { className: `${tool.icon.props.className} text-white` })}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-200">{tool.title}</h3>
                    <p className="text-blue-100/80 text-base mb-6">{tool.description}</p>
                    <span className="mt-auto inline-flex items-center text-blue-300 group-hover:text-cyan-400 transition-colors duration-200 font-semibold">
                      Use Tool
                      <FiChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/40 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 tracking-wide">Why Choose PDFigo?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: 'Lightning Fast',
                description: 'Process your documents in seconds with our optimized tools. Get more done, faster.',
                icon: <FiZap className="w-10 h-10 text-cyan-400" />,
              },
              {
                title: 'Privacy First',
                description: 'Your files are processed locally in your browser and never stored on our servers. Your data is safe.',
                icon: <FiLock className="w-10 h-10 text-emerald-400" />,
              },
              {
                title: 'Completely Free',
                description: 'Enjoy unlimited access to all our tools without any hidden costs or subscriptions. Free for everyone.',
                icon: <FiCloudOff className="w-10 h-10 text-pink-400" />,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1 + 0.6, duration: 0.7 }}
                className="bg-gray-700/50 backdrop-blur-xl p-10 rounded-2xl border border-blue-700/50 shadow-lg hover:shadow-[0_0_40px_rgba(0,200,255,0.3)] transition-all duration-300 group flex flex-col items-center text-center"
              >
                <div className="mb-5 p-4 rounded-full bg-gray-600/40 group-hover:bg-gray-500/60 transition-colors duration-200">
                   {React.cloneElement(feature.icon, { className: `${feature.icon.props.className} group-hover:brightness-125 transition-brightness duration-200` })}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-200 transition-colors duration-200">{feature.title}</h3>
                <p className="text-blue-100/80 text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;