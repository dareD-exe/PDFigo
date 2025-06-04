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
import ProfilePage from './pages/ProfilePage'; // Import ProfilePage
import AuthRedirect from './components/AuthRedirect'; // Import AuthRedirect
import ToolsPage from './pages/ToolsPage'; // Import ToolsPage
import SplitPdf from './pages/SplitPdf';
import CompressPdf from './pages/CompressPdf';
import RotatePdf from './pages/RotatePdf';
import ProtectPdf from './pages/ProtectPdf';
import UnlockPdf from './pages/UnlockPdf';
import EditPdf from './pages/EditPdf';
import PageNumbers from './pages/PageNumbers';
import RearrangePdf from './pages/RearrangePdf';
import RemovePages from './pages/RemovePages';
import FlattenPdf from './pages/FlattenPdf';
import AddAnnotations from './pages/AddAnnotations';
import AddTextWatermark from './pages/AddTextWatermark';
import PdfToText from './pages/PdfToText'; // Import PdfToText
import AddHeadersFooters from './pages/AddHeadersFooters'; // Import AddHeadersFooters
import AddImageSignature from './pages/AddImageSignature'; // Import AddImageSignature
import { AuthProvider } from './contexts/AuthContext';

const AppRoutes = () => {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/image-to-pdf" element={<AuthRedirect><ImageToPdf /></AuthRedirect>} />
        <Route path="/pdf-to-image" element={<AuthRedirect><PdfToImage /></AuthRedirect>} />
        <Route path="/pdf-merge" element={<AuthRedirect><PdfMerge /></AuthRedirect>} />
        <Route path="/split-pdf" element={<AuthRedirect><SplitPdf /></AuthRedirect>} />
        <Route path="/compress-pdf" element={<AuthRedirect><CompressPdf /></AuthRedirect>} />
        <Route path="/rotate-pdf" element={<AuthRedirect><RotatePdf /></AuthRedirect>} />
        <Route path="/protect-pdf" element={<AuthRedirect><ProtectPdf /></AuthRedirect>} />
        <Route path="/unlock-pdf" element={<AuthRedirect><UnlockPdf /></AuthRedirect>} />
        <Route path="/edit-pdf" element={<AuthRedirect><EditPdf /></AuthRedirect>} />
        <Route path="/page-numbers" element={<AuthRedirect><PageNumbers /></AuthRedirect>} />
        <Route path="/rearrange-pdf" element={<AuthRedirect><RearrangePdf /></AuthRedirect>} />
        <Route path="/remove-pages" element={<AuthRedirect><RemovePages /></AuthRedirect>} />
        <Route path="/flatten-pdf" element={<AuthRedirect><FlattenPdf /></AuthRedirect>} />
        <Route path="/add-annotations" element={<AuthRedirect><AddAnnotations /></AuthRedirect>} />
        <Route path="/add-text-watermark" element={<AuthRedirect><AddTextWatermark /></AuthRedirect>} />
        <Route path="/pdf-to-text" element={<AuthRedirect><PdfToText /></AuthRedirect>} />
        <Route path="/add-headers-footers" element={<AuthRedirect><AddHeadersFooters /></AuthRedirect>} />
        <Route path="/add-image-signature" element={<AuthRedirect><AddImageSignature /></AuthRedirect>} />
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/profile" element={<AuthRedirect><ProfilePage /></AuthRedirect>} />
        <Route path="/auth-redirect" element={<AuthRedirect />} />
    </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;