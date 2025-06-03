import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiLogIn, FiLoader } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Notification from '../components/Notification';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';

const LoginPage = () => {
  useEffect(() => {
    document.title = 'Login | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [step, setStep] = useState(1); // 1 for identifier, 2 for password
  const [formData, setFormData] = useState({
    identifier: '', // Username or Email
    password: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailForAuth, setEmailForAuth] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setNotification({ message: '', type: '' });
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: '', type: '' });
    if (!formData.identifier) {
      setNotification({ message: 'Please enter your email or username.', type: 'error' });
      setLoading(false);
      return;
    }
    try {
      const identifierInput = formData.identifier.trim();
      const isEmail = identifierInput.includes('@');
      let resolvedEmail = isEmail ? identifierInput.toLowerCase() : '';
      if (isEmail && !/\S+@\S+\.\S+/.test(identifierInput)) {
        setNotification({ message: 'Please enter a valid email address.', type: 'error' });
        setLoading(false);
        return;
      }
      if (!isEmail) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', identifierInput.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setNotification({ message: 'Username not found. Please check your username or try with email.', type: 'error' });
          setLoading(false);
          return;
        }
        resolvedEmail = querySnapshot.docs[0].data().email;
        if (!resolvedEmail) {
          setNotification({ message: 'Could not find email associated with this username.', type: 'error' });
          setLoading(false);
          return;
        }
      }
      setEmailForAuth(resolvedEmail);
      setStep(2);
    } catch (err) {
      setNotification({ message: 'Failed to verify your account. Please try again.', type: 'error' });
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: '', type: '' });
    if (!formData.password) {
      setNotification({ message: 'Please enter your password.', type: 'error' });
      setLoading(false);
      return;
    }
    if (!emailForAuth) {
      setNotification({ message: 'An unexpected error occurred. Please go back and re-enter your email/username.', type: 'error' });
      setLoading(false);
      setStep(1);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, emailForAuth, formData.password);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setNotification({ message: 'No account found with this email. Please sign up or check your details.', type: 'error' });
        setStep(1);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setNotification({ message: 'Incorrect password. Please try again.', type: 'error' });
      } else if (err.code === 'auth/too-many-requests'){
        setNotification({ message: 'Too many login attempts. Please try again later or reset your password.', type: 'error' });
      } else {
        setNotification({ message: 'Failed to login. Please try again.', type: 'error' });
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Google Sign-in successful. Firebase handles user creation/linking.
      // The auth state listener will handle navigation if needed.
      navigate('/profile');
    } catch (err) {
      console.error("Google Sign-in error:", err);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google Sign-in popup was closed.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Popup already opened.';
      } else if (err.code === 'auth/operation-not-supported-in-this-environment'){
        errorMessage = 'Popup not supported in this environment. Try redirect or a different browser.';
      } else if (err.code === 'auth/auth-domain-config-required'){
        errorMessage = 'Firebase auth domain not configured correctly.';
      } else if (err.code === 'auth/operation-not-allowed'){
        errorMessage = 'Google Sign-in is not enabled in Firebase Console.';
      }
      setNotification({ message: errorMessage, type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 1) {
      setFormData(prev => ({ ...prev, password: '' }));
      setEmailForAuth('');
    }
  }, [step]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 pt-24 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <CosmicBackground />
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-[0_0_50px_rgba(0,255,255,0.2)] p-8 md:p-10 space-y-8 flex flex-col items-center"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          {/* <div className="flex items-center justify-center mb-6">
            <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-700 p-5 shadow-xl">
              <FiLogIn className="h-12 w-12 text-white" />
            </span>
          </div> */}
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-200/80 text-lg">Sign in to continue</p>
        </motion.div>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="identifier-form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50, position: 'absolute', width: '100%' }}
              transition={{ duration: 0.4 }}
              onSubmit={handleIdentifierSubmit}
              className="space-y-6 w-full"
            >
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-blue-200 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {formData.identifier.includes('@') ?
                      <FiMail className="h-5 w-5 text-blue-400" /> :
                      <FiUser className="h-5 w-5 text-blue-400" />
                    }
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username email"
                    required
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Enter your username or email"
                    className="w-full px-4 pl-12 py-3 pr-4 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base"
                  />
                </div>
                {notification.message && notification.type === 'error' && (
                  <div className="mt-2 text-pink-400 text-sm animate-fade-in">{notification.message}</div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiLoader className="h-5 w-5 text-white" />
                  </motion.div>
                ) : (
                  <>
                    Next <FiArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
          {step === 2 && (
            <motion.form
              key="password-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50, position: 'absolute', width: '100%' }}
              transition={{ duration: 0.4 }}
              onSubmit={handleLogin}
              className="space-y-6 w-full"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-blue-200">
                    Password for <span className='font-semibold text-blue-400'>{emailForAuth}</span>
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => { setStep(1); setNotification({ message: '', type: '' }); }}
                    className="text-xs text-blue-300 hover:text-blue-100 hover:underline focus:outline-none transition duration-200"
                  >
                    Change email/username
                  </motion.button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 pl-12 py-3 pr-12 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base"
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5 text-blue-400 hover:text-white" /> : <FiEye className="h-5 w-5 text-blue-400 hover:text-white" />}
                  </motion.div>
                </div>
                {notification.message && notification.type === 'error' && (
                  <div className="mt-2 text-pink-400 text-sm animate-fade-in">{notification.message}</div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiLoader className="h-5 w-5 text-white" />
                  </motion.div>
                ) : (
                  <>
                    Login <FiLogIn className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Google Sign-in Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FiLoader className="h-5 w-5 text-gray-700" />
            </motion.div>
          ) : (
            <>
              <FcGoogle className="mr-2 h-5 w-5" /> Sign in with Google
            </>
          )}
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-400 mt-6"
        >
          <p className="text-sm text-gray-400">
            New to PDFigo?{' '}
            <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition duration-200">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default LoginPage;