import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ImageToPdf from './pages/ImageToPdf';
import PdfToImage from './pages/PdfToImage';
import PdfMerge from './pages/PdfMerge';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AuthRedirect from './components/AuthRedirect'; // Import AuthRedirect

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/image-to-pdf" element={<ImageToPdf />} />
      <Route path="/pdf-to-image" element={<PdfToImage />} />
      <Route path="/pdf-merge" element={<PdfMerge />} />
      <Route 
        path="/login" 
        element={
          <AuthRedirect>
            <LoginPage />
          </AuthRedirect>
        }
      />
      <Route 
        path="/signup" 
        element={
          <AuthRedirect>
            <SignupPage />
          </AuthRedirect>
        }
      />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      {/* Add other routes here */}
    </Routes>
  );
};

export default AppRoutes;