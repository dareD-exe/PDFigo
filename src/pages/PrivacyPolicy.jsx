import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
      <div className="bg-dark-card p-6 rounded-lg shadow-lg">
        <p className="text-gray-300 mb-4">
          Welcome to PDFigo's Privacy Policy. Your privacy is important to us.
        </p>
        <p className="text-gray-300 mb-4">
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">Information We Collect</h2>
        <p className="text-gray-300 mb-4">
          We may collect information about you in a variety of ways. The information we may collect on the Site includes:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
          <li>Personal Data: Personally identifiable information, such as your name, email address, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
          <li>Derivative Data: Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
          <li>Uploaded Files: Files you upload for processing (e.g., images for PDF conversion, PDFs for merging or image extraction). These files are temporarily stored on our servers for processing and are deleted shortly after.</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3 text-white">Use of Your Information</h2>
        <p className="text-gray-300 mb-4">
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
          <li>Create and manage your account.</li>
          <li>Process your uploaded files and deliver the requested services.</li>
          <li>Email you regarding your account or order.</li>
          <li>Improve the efficiency and operation of the Site.</li>
          <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3 text-white">Security of Your Information</h2>
        <p className="text-gray-300 mb-4">
          We use administrative, technical, and physical security measures to help protect your personal information and uploaded files. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">Policy for Children</h2>
        <p className="text-gray-300 mb-4">
          We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">Contact Us</h2>
        <p className="text-gray-300">
          If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email/Link]
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;