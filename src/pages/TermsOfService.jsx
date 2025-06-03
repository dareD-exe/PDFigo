import React, { useEffect } from 'react';

const TermsOfService = () => {
  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Terms of Service | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Terms of Service</h1>
      <div className="bg-dark-card p-6 rounded-lg shadow-lg">
        <p className="text-gray-300 mb-4">
          Welcome to PDFigo. These terms and conditions outline the rules and regulations for the use of PDFigo's Website, located at [Your Website URL].
        </p>
        <p className="text-gray-300 mb-4">
          By accessing this website we assume you accept these terms and conditions. Do not continue to use PDFigo if you do not agree to take all of the terms and conditions stated on this page.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">License</h2>
        <p className="text-gray-300 mb-4">
          Unless otherwise stated, PDFigo and/or its licensors own the intellectual property rights for all material on PDFigo. All intellectual property rights are reserved. You may access this from PDFigo for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <p className="text-gray-300 mb-4">
          You must not:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
          <li>Republish material from PDFigo</li>
          <li>Sell, rent or sub-license material from PDFigo</li>
          <li>Reproduce, duplicate or copy material from PDFigo</li>
          <li>Redistribute content from PDFigo</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3 text-white">User Content</h2>
        <p className="text-gray-300 mb-4">
          Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. PDFigo does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of PDFigo,its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions.
        </p>
        <p className="text-gray-300 mb-4">
          You warrant and represent that:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
          <li>You are entitled to post the Comments on our website and have all necessary licenses and consents to do so;</li>
          <li>The Comments do not invade any intellectual property right, including without limitation copyright, patent or trademark of any third party;</li>
          <li>The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3 text-white">Disclaimer</h2>
        <p className="text-gray-300 mb-4">
          To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
          <li>limit or exclude our or your liability for death or personal injury;</li>
          <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
          <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
          <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
        </ul>
        <p className="text-gray-300">
          As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;