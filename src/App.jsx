import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom'; // Removed BrowserRouter, Routes, Route, useNavigate as they are handled elsewhere or not directly needed here
import './App.css';
// LoginPage and SignupPage imports are not needed here as they are handled by AppRoutes
import { auth } from './firebase'; // Import Firebase auth
import { signOut } from 'firebase/auth'; // onAuthStateChanged is now in AuthContext
import { FiChevronDown, FiTool, FiImage, FiFileText, FiGitMerge, FiLogIn, FiUserPlus, FiGrid, FiLogOut, FiUser, FiMenu, FiX, FiHome } from 'react-icons/fi'; 
import AppRoutes from './Routes'; // Import the new centralized routes
import { useAuth } from './contexts/AuthContext'; // Import useAuth

function App() {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, loadingAuth } = useAuth(); // Use context

  const toolsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // useEffect for onAuthStateChanged is removed as it's handled by AuthProvider

  const toggleToolsDropdown = () => setIsToolsDropdownOpen(!isToolsDropdownOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      // Navigation will be handled by NavLink or direct usage of useNavigate in child components if needed
      // Forcing a reload to root might be an option if direct navigation is tricky here:
      // window.location.pathname = '/';
    } catch (error) {
      console.error("Error logging out: ", error);
      alert("Failed to log out. Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setIsToolsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      // For mobile menu, check if click is outside the menu button AND the menu itself
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // loadingAuth state is now handled by AuthProvider, App component will only render when not loadingAuth
  // However, a top-level loading indicator in App might still be useful if AuthProvider's children render before auth state is resolved.
  // For now, assuming AuthProvider handles this correctly by not rendering children until auth is resolved.
  // If a flicker occurs, we might need to re-introduce a loading check here or ensure AuthProvider delays children rendering.

  // if (loadingAuth) { // This check might still be useful depending on AuthProvider behavior
  //   return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white text-xl">Loading PDFigo...</div>;
  // }


  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
      isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-dark-hover hover:text-white'
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out ${
      isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-dark-hover hover:text-white'
    }`;

  return (
      <div className="min-h-screen bg-dark-bg text-white flex flex-col">
        {/* Navbar - apply 'sticky' class from App.css for blur */}
        {/* Router is now expected to be in main.jsx wrapping this App component */}
        <nav className="bg-dark-card/80 border-b border-dark-border sticky top-0 z-50 nav-sticky backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <FiGrid className="h-8 w-8 text-primary-500" />
                <span className="ml-2 text-xl font-bold">PDFigo</span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
                <NavLink to="/" className={navLinkClasses} end>
                  <FiHome className="mr-1"/> Home
                </NavLink>
                <div className="relative" ref={toolsDropdownRef}>
                  <button
                    onClick={toggleToolsDropdown}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-dark-hover hover:text-white focus:outline-none transition-colors duration-150 ease-in-out"
                  >
                    <FiTool className="mr-1" /> Tools <FiChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isToolsDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-dark-card/90 backdrop-blur-md border border-dark-border/50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <NavLink to="/image-to-pdf" className={({ isActive }) => `flex items-center px-4 py-3 text-sm transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-200 hover:bg-primary-500 hover:text-white'}`} role="menuitem" onClick={() => setIsToolsDropdownOpen(false)}>
                          <FiImage className="mr-3" /> Image to PDF
                        </NavLink>
                        <NavLink to="/pdf-to-image" className={({ isActive }) => `flex items-center px-4 py-3 text-sm transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-200 hover:bg-primary-500 hover:text-white'}`} role="menuitem" onClick={() => setIsToolsDropdownOpen(false)}>
                          <FiFileText className="mr-3" /> PDF to Image
                        </NavLink>
                        <NavLink to="/pdf-merge" className={({ isActive }) => `flex items-center px-4 py-3 text-sm transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-200 hover:bg-primary-500 hover:text-white'}`} role="menuitem" onClick={() => setIsToolsDropdownOpen(false)}>
                          <FiGitMerge className="mr-3" /> PDF Merge
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>

                {currentUser ? (
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-dark-hover hover:text-white focus:outline-none transition-colors duration-150 ease-in-out"
                    >
                      <FiUser className="mr-1" /> {currentUser.displayName || currentUser.email?.split('@')[0]} <FiChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-dark-card/90 backdrop-blur-md ring-1 ring-black ring-opacity-5 border border-dark-border/50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-150 ease-in-out"
                          role="menuitem"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        {/* <Link
                          to="/settings" // Placeholder, adjust as needed
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-150 ease-in-out"
                          role="menuitem"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Settings
                        </Link> */}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-md transition-colors duration-150 ease-in-out"
                          role="menuitem"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <NavLink to="/login" className={navLinkClasses}>
                      <FiLogIn className="mr-1" /> Login
                    </NavLink>
                    <NavLink to="/signup" className={`${navLinkClasses({isActive:false})} bg-primary-600 hover:bg-primary-700 text-white`}>
                      <FiUserPlus className="mr-1" /> Sign Up
                    </NavLink>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="-mr-2 flex md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  type="button"
                  className="mobile-menu-button bg-dark-input inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */} 
          {isMobileMenuOpen && (
            <div className="md:hidden bg-dark-card/90 backdrop-blur-md border-t border-dark-border" id="mobile-menu" ref={mobileMenuRef}>
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <NavLink to="/" className={mobileNavLinkClasses} onClick={() => { toggleMobileMenu(); setIsToolsDropdownOpen(false); setIsUserDropdownOpen(false); }} end>
                  <FiHome className="inline mr-2" /> Home
                </NavLink>
                <NavLink to="/image-to-pdf" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>
                  <FiImage className="inline mr-2" /> Image to PDF
                </NavLink>
                <NavLink to="/pdf-to-image" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>
                  <FiFileText className="inline mr-2" /> PDF to Image
                </NavLink>
                <NavLink to="/pdf-merge" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>
                  <FiGitMerge className="inline mr-2" /> PDF Merge
                </NavLink>
                {currentUser ? (
                  <>
                    {/* <NavLink to="/profile" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>
                      <FiUser className="inline mr-2" /> Profile ({currentUser.displayName || currentUser.email?.split('@')[0]})
                    </NavLink> */}
                    <button
                      onClick={() => { handleLogout(); toggleMobileMenu(); }}
                      className={`${mobileNavLinkClasses({isActive: false})} w-full text-left flex items-center`}
                    >
                      <FiLogOut className="inline mr-2" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>
                      <FiLogIn className="inline mr-2" /> Login
                    </NavLink>
                    <NavLink to="/signup" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>
                      <FiUserPlus className="inline mr-2" /> Sign Up
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 page-section">
          <AppRoutes />
        </main>

        {/* Footer */}
        <footer className="bg-dark-card border-t border-dark-border mt-auto">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <div className="flex items-center">
                  {/* Re-using FiGrid as logo, or replace with actual SVG logo if available */}
                  <FiGrid className="h-8 w-8 text-primary-500" /> 
                  <span className="ml-2 text-xl font-bold">PDFigo</span>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  PDFigo provides free online tools to work with PDF files. Convert images to PDF, extract images from PDF, and merge multiple PDF files with ease.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Tools</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link to="/image-to-pdf" className="text-sm text-gray-400 hover:text-white hover:underline">
                      Image to PDF
                    </Link>
                  </li>
                  <li>
                    <Link to="/pdf-to-image" className="text-sm text-gray-400 hover:text-white hover:underline">
                      PDF to Image
                    </Link>
                  </li>
                  <li>
                    <Link to="/pdf-merge" className="text-sm text-gray-400 hover:text-white hover:underline">
                      PDF Merge
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <NavLink to="/privacy-policy" className="text-sm text-gray-400 hover:text-white hover:underline">
                      Privacy Policy
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/terms-of-service" className="text-sm text-gray-400 hover:text-white hover:underline">
                      Terms of Service
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 border-t border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} PDFigo. All rights reserved.

              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}

export default App;