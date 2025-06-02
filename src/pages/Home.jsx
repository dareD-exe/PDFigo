import { Link } from 'react-router-dom';

function Home() {
  const tools = [
    {
      id: 'image-to-pdf',
      title: 'Image to PDF',
      description: 'Convert JPG, PNG, or other image formats to PDF documents.',
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5C4 4.44772 4.44772 4 5 4H12.5C12.7761 4 13 4.22386 13 4.5V13.5C13 13.7761 12.7761 14 12.5 14H4.5C4.22386 14 4 13.7761 4 13.5V5Z" fill="currentColor" />
          <path d="M14 6C14 5.44772 14.4477 5 15 5H19C19.5523 5 20 5.44772 20 6V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V16C4 15.4477 4.44772 15 5 15H13.5C13.7761 15 14 15.2239 14 15.5V6Z" fill="currentColor" />
        </svg>
      ),
      path: '/image-to-pdf',
    },
    {
      id: 'pdf-to-image',
      title: 'PDF to Image',
      description: 'Extract pages from PDF files as JPG, PNG, or other image formats.',
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 4C19.5523 4 20 4.44772 20 5V15C20 15.5523 19.5523 16 19 16H15C14.4477 16 14 15.5523 14 15V5C14 4.44772 14.4477 4 15 4H19Z" fill="currentColor" />
          <path d="M5 8C4.44772 8 4 8.44772 4 9V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V18.5C20 18.2239 19.7761 18 19.5 18H5.5C5.22386 18 5 17.7761 5 17.5V8Z" fill="currentColor" />
        </svg>
      ),
      path: '/pdf-to-image',
    },
    {
      id: 'pdf-merge',
      title: 'PDF Merge',
      description: 'Combine multiple PDF files into a single document.',
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2C8.55228 2 9 2.44772 9 3V7C9 7.55228 8.55228 8 8 8H4C3.44772 8 3 7.55228 3 7V3C3 2.44772 3.44772 2 4 2H8Z" fill="currentColor" />
          <path d="M8 10C8.55228 10 9 10.4477 9 11V15C9 15.5523 8.55228 16 8 16H4C3.44772 16 3 15.5523 3 15V11C3 10.4477 3.44772 10 4 10H8Z" fill="currentColor" />
          <path d="M13 11C13 10.4477 13.4477 10 14 10H18C18.5523 10 19 10.4477 19 11V15C19 15.5523 18.5523 16 18 16H14C13.4477 16 13 15.5523 13 15V11Z" fill="currentColor" />
          <path d="M14 18C13.4477 18 13 18.4477 13 19V21C13 21.5523 13.4477 22 14 22H18C18.5523 22 19 21.5523 19 21V19C19 18.4477 18.5523 18 18 18H14Z" fill="currentColor" />
          <path d="M20.7071 7.70711C21.0976 7.31658 21.0976 6.68342 20.7071 6.29289C20.3166 5.90237 19.6834 5.90237 19.2929 6.29289L16 9.58579L14.7071 8.29289C14.3166 7.90237 13.6834 7.90237 13.2929 8.29289C12.9024 8.68342 12.9024 9.31658 13.2929 9.70711L15.2929 11.7071C15.6834 12.0976 16.3166 12.0976 16.7071 11.7071L20.7071 7.70711Z" fill="currentColor" />
        </svg>
      ),
      path: '/pdf-merge',
    },
  ];

  return (
    <div className="bg-dark-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-dark-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              <span className="block">PDF Tools Made Simple</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-300">
              Free online tools to convert, merge, and edit PDF files with ease.
            </p>
            <div className="mt-10 flex justify-center">
              <Link to="/image-to-pdf" className="btn-primary">
                Get Started
              </Link>
              <a href="#tools" className="ml-4 btn-secondary">
                View All Tools
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Why Choose Our PDF Tools?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
              Simple, fast, and secure PDF processing tools for all your document needs.
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            <div className="card p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">Fast Processing</h3>
              <p className="mt-2 text-base text-gray-400">
                All processing happens in your browser, ensuring quick results without waiting for server uploads.
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">100% Secure</h3>
              <p className="mt-2 text-base text-gray-400">
                Your files never leave your device. We process everything locally, ensuring complete privacy.
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">No Installation</h3>
              <p className="mt-2 text-base text-gray-400">
                Use our tools directly in your browser without installing any software or plugins.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div id="tools" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Our PDF Tools</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
              Powerful tools to handle all your PDF needs in one place.
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            {tools.map((tool) => (
              <Link key={tool.id} to={tool.path} className="card overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="text-primary-500">{tool.icon}</div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{tool.title}</h3>
                  <p className="mt-2 text-gray-400">{tool.description}</p>
                </div>
                <div className="bg-dark-border px-6 py-4">
                  <span className="text-sm font-medium text-primary-400 flex items-center">
                    Use Tool
                    <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-900 bg-opacity-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-400">Try our tools today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/image-to-pdf" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;