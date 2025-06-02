import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiLogIn, FiLoader } from 'react-icons/fi'; // Added FiLoader
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Notification from '../components/Notification'; // Import Notification

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1 for identifier, 2 for password
  const [formData, setFormData] = useState({
    identifier: '', // Username or Email
    password: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' }); // For Notification component
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailForAuth, setEmailForAuth] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setNotification({ message: '', type: '' }); // Clear notification on change
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

      const methods = await fetchSignInMethodsForEmail(auth, resolvedEmail);
      if (methods.length === 0) {
        setNotification({ message: 'No account found with this email. Please sign up or check your details.', type: 'error' });
        setLoading(false);
        return;
      }
      
      setEmailForAuth(resolvedEmail);
      setStep(2);
    } catch (err) {
      console.error('Identifier check error:', err);
      if (err.code === 'auth/invalid-email') {
        setNotification({ message: 'Invalid email format provided.', type: 'error' });
      } else if (err.message.includes('network')) { // More generic network error check
        setNotification({ message: 'Network error. Please check your connection and try again.', type: 'error' });
      } else {
        setNotification({ message: 'Failed to verify your account. Please try again.', type: 'error' });
      }
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
      // No need for success notification here, navigation to '/' implies success.
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setNotification({ message: 'Invalid password or email. Please try again.', type: 'error' });
      } else if (err.code === 'auth/too-many-requests'){
        setNotification({ message: 'Too many login attempts. Please try again later or reset your password.', type: 'error' });
      } else {
        setNotification({ message: 'Failed to login. Please try again.', type: 'error' });
      }
    }
    setLoading(false);
  };
  
  // Effect to clear password when identifier changes (user goes back to step 1)
  useEffect(() => {
    if (step === 1) {
      setFormData(prev => ({ ...prev, password: '' }));
      setEmailForAuth('');
      // setNotification({ message: '', type: '' }); // Also clear notification when going back to step 1
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 selection:bg-primary-500 selection:text-white">
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />
      <div className="w-full max-w-md bg-dark-card shadow-2xl rounded-xl p-8 space-y-8 transform transition-all duration-500 hover:scale-105">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <FiLogIn className="h-12 w-auto text-primary-500 mx-auto" />
          </Link>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="mt-3 text-gray-400">Login to access your PDFigo dashboard.</p>
        </div>

        {/* Error messages are now handled by the Notification component or inline for specific fields if needed */}
        {/* This global error display can be removed if inline/Notification is sufficient */}
        {/* {notification.message && notification.type === 'error' && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm" role="alert">
            <p>{notification.message}</p>
          </div>
        )} */}

        {step === 1 && (
          <form onSubmit={handleIdentifierSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-1">
                Username or Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.identifier.includes('@') ? 
                    <FiMail className="h-5 w-5 text-gray-500" /> : 
                    <FiUser className="h-5 w-5 text-gray-500" />
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
                  placeholder="yourname or you@example.com"
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-dark-border bg-dark-input rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-bg transition-transform transform hover:scale-105 duration-300 ease-out disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Next'}
                 <FiArrowRight className={`ml-2 h-5 w-5 ${loading ? 'hidden' : ''}`} />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password for <span className='font-semibold text-primary-400'>{emailForAuth}</span>
                </label>
                <button 
                    type="button"
                    onClick={() => { setStep(1); setNotification({ message: '', type: '' }); }}
                    className="text-sm text-primary-500 hover:text-primary-400 hover:underline focus:outline-none"
                >
                  Change email/username
                </button>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-dark-border bg-dark-input rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-300">
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />} 
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-bg transition-transform transform hover:scale-105 duration-300 ease-out disabled:opacity-60 disabled:cursor-not-allowed"
              >
                 {loading ? (
                  <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                ) : null}
                Log In
                {!loading && <FiLogIn className="ml-2 h-5 w-5" />}
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center">
          <p className="text-gray-400">
            {step === 1 ? "Don't have an account?" : "Forgot your password?"}{' '}
            {step === 1 && 
                <Link to="/signup" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                Sign up here
                </Link>
            }
            {step === 2 && 
                <Link to="/forgot-password" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                    Reset it here
                </Link>
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;