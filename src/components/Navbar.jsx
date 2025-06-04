import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiChevronDown, FiUser, FiLogOut, FiSettings, FiBell, FiChevronRight, FiPower, FiX, FiFilePlus, FiImage, FiScissors, FiMinimize2, FiRotateCw, FiLock, FiUnlock, FiEdit, FiList, FiTrash2, FiCheckSquare, FiGrid, FiType } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { tools } from '../config/tools';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('Allow');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toolsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target)) {
        setIsToolsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch user profile data for dropdown
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          }
        } catch (e) {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed w-full z-50 transition-all duration-300 bg-black/70 backdrop-blur-xl border-none shadow-none`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-white tracking-widest" style={{ fontFamily: 'WDXL Lubrifont TC, cursive' }}>
            {/* <FiFileText className="w-9 h-9 text-cyan-400 neon-cosmic" /> */}
            PDFigo
            </Link>

          {/* Right side: Tools Dropdown + Auth/Profile */}
          <div className="flex items-center gap-4">
            {/* Tools Dropdown (desktop) */}
            <div className="hidden md:flex items-center" ref={toolsDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setIsToolsOpen((v) => !v)}
                  onMouseEnter={() => setIsToolsOpen(true)}
                  onMouseLeave={() => setIsToolsOpen(false)}
                  className="flex items-center gap-1 px-5 py-2 rounded-lg text-base font-semibold text-blue-300 border border-blue-700 hover:bg-blue-900/30 transition shadow"
                  aria-haspopup="true"
                  aria-expanded={isToolsOpen}
                >
                  Tools <FiChevronDown className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {isToolsOpen && (
                <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }}
                      onMouseEnter={() => setIsToolsOpen(true)}
                      onMouseLeave={() => setIsToolsOpen(false)}
                      className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl bg-black/70 backdrop-blur-xl border border-blue-800 z-50 py-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-2">
                        {tools.map((tool) => (
                  <Link
                            key={tool.path}
                            to={tool.path}
                            className={`block px-3 py-2 rounded-md text-blue-100 hover:bg-blue-900/30 hover:text-blue-300 transition text-base font-medium ${location.pathname === tool.path ? 'font-bold text-blue-400' : ''}`}
                            onClick={() => setIsToolsOpen(false)}
                          >
                            {tool.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop: Auth/Profile */}
            <div className="hidden md:flex items-center gap-4">
              {!currentUser ? (
                <>
                  <Link to="/login" className="px-5 py-2 rounded-lg text-base font-semibold text-blue-300 border border-blue-700 hover:bg-blue-900/30 transition shadow">
                    Login
                  </Link>
                  <Link to="/signup" className="px-5 py-2 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition shadow">
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen((v) => !v)}
                    className="flex items-center gap-2 p-1 rounded-full bg-blue-900/30 hover:bg-blue-900/50 transition shadow border border-blue-700"
                  >
                    {userData?.profileImageUrl || currentUser.photoURL ? (
                      <img src={userData?.profileImageUrl || currentUser.photoURL} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-700 text-blue-200 font-bold">
                        <FiUser className="w-6 h-6" />
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl bg-black/70 backdrop-blur-xl border border-blue-800 z-50"
                      >
                        {/* Profile info */}
                        <div className="flex flex-col items-center pt-6 pb-4">
                          {userData?.profileImageUrl || currentUser.photoURL ? (
                            <img src={userData?.profileImageUrl || currentUser.photoURL} alt="avatar" className="w-16 h-16 rounded-full object-cover mb-2" />
                          ) : (
                            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-700 text-blue-200 font-bold mb-2">
                              <FiUser className="w-8 h-8" />
                            </span>
                          )}
                          <div className="text-white font-semibold text-lg">{userData?.fullName || currentUser.displayName || currentUser.email.split('@')[0]}</div>
                          <div className="text-gray-400 text-sm">{currentUser.email}</div>
                        </div>
                        <div className="border-t border-[#232526]" />
                        {/* Menu items */}
                        <div className="flex flex-col py-2">
                          <button
                            onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                            className="flex items-center justify-between px-6 py-3 text-white hover:bg-blue-900/20 transition text-base rounded-xl"
                          >
                            <span className="flex items-center gap-3"><FiUser className="w-5 h-5" /> My Profile</span>
                            <FiChevronRight className="w-5 h-5 text-gray-400" />
                          </button>
                          {/* Settings link in dropdown - opens modal handled in ProfilePage */}
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center justify-between px-6 py-3 text-white hover:bg-blue-900/20 transition text-base rounded-xl"
                          >
                            <span className="flex items-center gap-3"><FiSettings className="w-5 h-5" /> Settings</span>
                            <FiChevronRight className="w-5 h-5 text-gray-400" />
                          </Link>
                          <div className="relative">
                            <button
                              onClick={() => setIsNotificationOpen((v) => !v)}
                              className="flex items-center justify-between px-6 py-3 text-white hover:bg-blue-900/20 transition text-base rounded-xl w-full"
                            >
                              <span className="flex items-center gap-3"><FiBell className="w-5 h-5" /> Notification</span>
                              <span className="flex items-center gap-1 text-blue-400 text-sm">
                                {notificationStatus}
                                <FiChevronRight className="w-4 h-4 text-gray-400" />
                              </span>
                            </button>
                            <AnimatePresence>
                              {isNotificationOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 8 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-6 top-14 w-32 bg-[#23272f] rounded-xl shadow-xl border border-blue-800 z-50"
                                >
                                  <button
                                    onClick={() => { setNotificationStatus('Allow'); setIsNotificationOpen(false); }}
                                    className={`block w-full px-4 py-2 text-left text-white hover:bg-blue-900/30 rounded-t-xl ${notificationStatus === 'Allow' ? 'font-bold text-blue-400' : ''}`}
                                  >
                                    Allow
                                  </button>
                                  <button
                                    onClick={() => { setNotificationStatus('Mute'); setIsNotificationOpen(false); }}
                                    className={`block w-full px-4 py-2 text-left text-white hover:bg-blue-900/30 rounded-b-xl ${notificationStatus === 'Mute' ? 'font-bold text-blue-400' : ''}`}
                                  >
                                    Mute
                                  </button>
                                </motion.div>
                    )}
                            </AnimatePresence>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-6 py-3 text-red-400 hover:bg-blue-900/20 transition text-base rounded-xl mt-2"
                          >
                            <FiPower className="w-5 h-5" /> Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Settings Modal (handled in ProfilePage, but included here for potential future direct access if needed) */}
                  {/* <AnimatePresence>
                    {isSettingsModalOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                      >
                </motion.div>
                    )}
                  </AnimatePresence> */}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-cyan-200 hover:text-cyan-400 focus:outline-none"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gradient-to-br from-[#232526] to-[#0f2027] backdrop-blur-lg shadow-2xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Tools Dropdown (collapsible) */}
              <div className="mb-2">
                <button
                  onClick={() => setIsToolsOpen((v) => !v)}
                  className="flex items-center gap-1 w-full px-3 py-2 text-lg font-semibold text-cyan-200 hover:text-cyan-400 transition"
                >
                  Tools <FiChevronDown className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {isToolsOpen && (
                <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }}
                      className="pl-4 mt-1"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pr-2">
                        {tools.map((tool) => (
                  <Link
                            key={tool.path}
                            to={tool.path}
                            className={`block px-3 py-2 rounded-md text-lg font-medium ${
                              location.pathname === tool.path
                                ? 'text-cyan-400 bg-cyan-900/30'
                                : 'text-cyan-200 hover:text-cyan-400 hover:bg-cyan-900/20'
                    }`}
                            onClick={() => { setIsToolsOpen(false); setIsMobileMenuOpen(false); }}
                  >
                            {tool.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Auth/Profile */}
              {!currentUser ? (
                <div className="flex flex-col gap-2 mt-4">
                  <Link to="/login" className="px-4 py-2 rounded-lg text-base font-semibold text-cyan-300 border border-cyan-700 hover:bg-cyan-900/30 transition text-center shadow">
                    Login
                  </Link>
                  <Link to="/signup" className="px-4 py-2 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition text-center shadow">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-cyan-900/30 hover:bg-cyan-900/50 transition shadow"
                  >
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-700 text-cyan-200 font-bold">
                        <FiUser className="w-6 h-6" />
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="rounded-2xl shadow-2xl bg-gradient-to-br from-[#232526] to-[#0f2027] border border-cyan-800 py-2 z-50 mt-2"
                      >
                        <Link to="/profile" className="flex items-center gap-2 px-6 py-3 text-cyan-100 hover:bg-cyan-900/30 hover:text-cyan-300 transition text-lg font-medium">
                          <FiUser className="w-5 h-5" /> Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-6 py-3 w-full text-left text-cyan-100 hover:bg-cyan-900/30 hover:text-cyan-300 transition text-lg font-medium"
                        >
                          <FiLogOut className="w-5 h-5" /> Logout
                        </button>
                </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 