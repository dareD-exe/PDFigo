import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiUser, FiCalendar, FiLock, FiArrowRight, FiEye, FiEyeOff, FiUserPlus, FiLoader, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, query, collection, where, getDocs } from 'firebase/firestore';
import Notification from '../components/Notification';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';

const SignupPage = () => {
  useEffect(() => {
    document.title = 'Signup | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    dob: '',
    username: '',
    password: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setNotification({ message: '', type: '' });
  };

  const isEmailTaken = async (email) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const isUsernameTaken = async (username) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const validateStep = async () => {
    switch (step) {
      case 1:
        if (!formData.email) {
          setNotification({ message: 'Please enter your email address.', type: 'error' });
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setNotification({ message: 'Please enter a valid email address.', type: 'error' });
          return false;
        }
        setIsLoading(true);
        const taken = await isEmailTaken(formData.email);
        setIsLoading(false);
        if (taken) {
          setNotification({ message: 'This email address is already in use. Please use a different email or login.', type: 'error' });
          return false;
        }
        break;
      case 2:
        if (!formData.fullName) {
          setNotification({ message: 'Please enter your full name.', type: 'error' });
          return false;
        }
        break;
      case 3:
        if (!formData.dob) {
          setNotification({ message: 'Please enter your date of birth.', type: 'error' });
          return false;
        }
        const today = new Date();
        const birthDate = new Date(formData.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 13) {
            setNotification({ message: 'You must be at least 13 years old to sign up.', type: 'error' });
            return false;
        }
        break;
      case 4:
        if (!formData.username) {
          setNotification({ message: 'Please enter a username.', type: 'error' });
          return false;
        }
        if (formData.username.length < 3) {
          setNotification({ message: 'Username must be at least 3 characters long.', type: 'error' });
          return false;
        }
        setIsLoading(true);
        const usernameTaken = await isUsernameTaken(formData.username);
        setIsLoading(false);
        if (usernameTaken) {
          setNotification({ message: 'This username is already taken. Please choose another.', type: 'error' });
          return false;
        }
        break;
      case 5:
        if (!formData.password) {
          setNotification({ message: 'Please enter a password.', type: 'error' });
          return false;
        }
        if (formData.password.length < 8) {
          setNotification({ message: 'Password must be at least 8 characters long.', type: 'error' });
          return false;
        }
        break;
      default:
        return true;
    }
    setNotification({ message: '', type: '' });
    return true;
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!(await validateStep())) return;
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setNotification({ message: '', type: '' });
    setStep(step - 1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!(await validateStep())) return;
    setIsLoading(true);
    setNotification({ message: '', type: '' });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.toLowerCase(), formData.password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email.toLowerCase(),
        fullName: formData.fullName,
        dob: formData.dob,
        username: formData.username.toLowerCase(),
        createdAt: new Date().toISOString(),
      });
      setNotification({ message: 'Signup Successful! Redirecting to login...', type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      let errorMessage = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      setNotification({ message: errorMessage, type: 'error' });
    }
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, position: 'absolute', width: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Let's start with your email</h2>
            <p className="text-cyan-100/80 mb-6 text-base">We'll use this to verify your account.</p>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 pl-12 py-3 pr-4 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base"
                />
              </div>
              {notification.message && notification.type === 'error' && (
                <div className="mt-2 text-pink-400 text-sm animate-fade-in">{notification.message}</div>
              )}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="name-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, position: 'absolute', width: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">What's your name?</h2>
            <p className="text-cyan-100/80 mb-6 text-base">This will be displayed on your profile.</p>
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  className="w-full px-4 pl-12 py-3 pr-4 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base"
                />
              </div>
              {notification.message && notification.type === 'error' && (
                <div className="mt-2 text-pink-400 text-sm animate-fade-in">{notification.message}</div>
              )}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="dob-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, position: 'absolute', width: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">When's your birthday?</h2>
            <p className="text-cyan-100/80 mb-6 text-base">We use this for age verification.</p>
            <div>
              <label htmlFor="dob" className="sr-only">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 pl-12 py-3 pr-4 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base"
                />
              </div>
              {notification.message && notification.type === 'error' && (
                <div className="mt-2 text-pink-400 text-sm animate-fade-in">{notification.message}</div>
              )}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="username-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, position: 'absolute', width: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Choose a username</h2>
            <p className="text-cyan-100/80 mb-6 text-base">This will be your unique identifier.</p>
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="choose_a_username"
                  className="w-full px-4 pl-12 py-3 pr-4 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base"
                />
              </div>
              {notification.message && notification.type === 'error' && (
                <div className="mt-2 text-pink-400 text-sm animate-fade-in">{notification.message}</div>
              )}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="password-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, position: 'absolute', width: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Create a password</h2>
            <p className="text-cyan-100/80 mb-6 text-base">It should be at least 8 characters long.</p>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 pl-12 py-3 pr-12 bg-gray-700/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base"
                />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5 text-cyan-400 hover:text-white" /> : <FiEye className="h-5 w-5 text-cyan-400 hover:text-white" />}
                </motion.div>
              </div>
              {notification.message && notification.type === 'error' && (
                <div className="mt-2 text-pink-400 text-sm animate-fade-in">{notification.message}</div>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Join PDFigo</h1>
          <p className="text-blue-200/80 text-lg">Create your free account</p>
        </motion.div>
        <AnimatePresence mode="wait">
          <form onSubmit={step === 5 ? handleSignup : handleNextStep} className="space-y-6 w-full">
          {renderStep()}
            <div className="flex justify-between items-center w-full">
            {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                onClick={handlePreviousStep}
                  className="text-cyan-200 hover:text-white focus:outline-none"
                >
                  Back
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`btn-cosmic ml-auto flex items-center justify-center px-6 py-3 text-lg font-bold w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2`}
            >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiLoader className="h-5 w-5 text-white" />
                  </motion.div>
                ) : step === 5 ? 'Create Account' : 'Next'}
                {!isLoading && step !== 5 && <FiArrowRight className="ml-2 h-5 w-5" />}
              </motion.button>
          </div>
        </form>
        </AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-400">
          Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition duration-200">
              Login
          </Link>
        </p>
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default SignupPage;