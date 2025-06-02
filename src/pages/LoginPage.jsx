import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { auth, db } from '../firebase'; // Import Firebase auth and db
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1 for identifier, 2 for password
  const [formData, setFormData] = useState({
    identifier: '', // Username or Email
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailForAuth, setEmailForAuth] = useState(''); // Store the resolved email for step 2
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!formData.identifier) {
      setError('Please enter your email or username.');
      setLoading(false);
      return;
    }

    try {
      const isEmail = formData.identifier.includes('@');
      let resolvedEmail = formData.identifier;

      if (isEmail && !/\S+@\S+\.\S+/.test(formData.identifier)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      if (!isEmail) {
        // If not an email, assume it's a username and try to find the email in Firestore
        const usersRef = collection(db, 'users');
        // Ensure username is queried in lowercase if stored that way during signup
        const q = query(usersRef, where('username', '==', formData.identifier.toLowerCase())); 
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Username not found. Please check your username or try with email.');
          setLoading(false);
          return;
        }
        resolvedEmail = querySnapshot.docs[0].data().email;
        if (!resolvedEmail) {
            setError('Could not find email associated with this username.');
            setLoading(false);
            return;
        }
      }

      // Verify if the resolved email is registered in Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, resolvedEmail);
      if (methods.length === 0) {
        setError('No account found with this email. Please sign up or check your details.');
        setLoading(false);
        return;
      }
      
      setEmailForAuth(resolvedEmail); // Store resolved email for the password step
      setStep(2);
    } catch (err) {
      console.error('Identifier check error:', err);
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email format provided.');
      } else if (err.code === 'firebase/failed-precondition' || err.code === 'unavailable') { 
        setError('Error querying database. Please check your connection or try again.');
      } else {
        setError('Failed to verify your account. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!formData.password) {
      setError('Please enter your password.');
      setLoading(false);
      return;
    }
    if (!emailForAuth) { // This check ensures email was resolved in step 1
        setError('An unexpected error occurred. Please go back and re-enter your email/username.');
        setLoading(false);
        setStep(1); // Reset to step 1
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, emailForAuth, formData.password);
      // console.log('User logged in successfully');
      navigate('/'); // Redirect to home or dashboard
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid password. Please try again.'); // More specific error for password step
      } else if (err.code === 'auth/too-many-requests'){
        setError('Too many login attempts. Please try again later or reset your password.');
      } else {
        setError('Failed to login. Please try again.');
      }
    }
    setLoading(false);
  };
  
  // Effect to clear password when identifier changes (user goes back to step 1)
  useEffect(() => {
    if (step === 1) {
      setFormData(prev => ({ ...prev, password: '' })); // Clear password field
      setEmailForAuth(''); // Clear resolved email
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 selection:bg-primary-500 selection:text-white">
      <div className="w-full max-w-md bg-dark-card shadow-2xl rounded-xl p-8 space-y-8 transform transition-all duration-500 hover:scale-105">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <FiLogIn className="h-12 w-auto text-primary-500 mx-auto" />
          </Link>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="mt-3 text-gray-400">Login to access your PDFigo dashboard.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm" role="alert">
            <p>{error}</p>
          </div>
        )}

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
                    onClick={() => { setStep(1); setError(''); }}
                    className="text-xs text-primary-400 hover:text-primary-300 focus:outline-none"
                >
                    Change identifier?
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
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Login'}
                <FiLogIn className={`ml-2 h-5 w-5 ${loading ? 'hidden' : ''}`} />
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