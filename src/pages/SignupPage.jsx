import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiUser, FiCalendar, FiLock, FiArrowRight, FiEye, FiEyeOff, FiUserPlus, FiLoader } from 'react-icons/fi'; // Added FiLoader
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, query, collection, where, getDocs } from 'firebase/firestore'; // Added query, collection, where, getDocs
import Notification from '../components/Notification'; // Import Notification

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    dob: '',
    username: '',
    password: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' }); // Added notification state
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setNotification({ message: '', type: '' }); // Clear notification on change
  };

  // Function to check if username is already taken
  const isUsernameTaken = async (username) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const validateStep = () => {
    switch (step) {
      case 1: // Email
        if (!formData.email) {
          setNotification({ message: 'Please enter your email address.', type: 'error' });
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setNotification({ message: 'Please enter a valid email address.', type: 'error' });
          return false;
        }
        // Email existence is checked by Firebase during createUserWithEmailAndPassword
        break;
      case 2: // Full Name
        if (!formData.fullName) {
          setNotification({ message: 'Please enter your full name.', type: 'error' });
          return false;
        }
        break;
      case 3: // Date of Birth
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
      case 4: // Username
        if (!formData.username) {
          setNotification({ message: 'Please enter a username.', type: 'error' });
          return false;
        }
        if (formData.username.length < 3) {
          setNotification({ message: 'Username must be at least 3 characters long.', type: 'error' });
          return false;
        }
        // Username uniqueness will be checked before submitting in handleNextStep or handleSignup
        break;
      case 5: // Password
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
    setNotification({ message: '', type: '' }); // Clear notification if all good for current step
    return true;
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (step === 4) { // Check username uniqueness before proceeding from username step
      setIsLoading(true);
      const taken = await isUsernameTaken(formData.username);
      setIsLoading(false);
      if (taken) {
        setNotification({ message: 'This username is already taken. Please choose another.', type: 'error' });
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setNotification({ message: '', type: '' });
    setStep(step - 1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);
    setNotification({ message: '', type: '' });

    // Final check for username uniqueness before creating account
    const usernameTaken = await isUsernameTaken(formData.username);
    if (usernameTaken) {
      setNotification({ message: 'This username is already taken. Please choose another.', type: 'error' });
      setIsLoading(false);
      setStep(4); // Go back to username step
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.toLowerCase(), formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email.toLowerCase(),
        fullName: formData.fullName,
        dob: formData.dob,
        username: formData.username.toLowerCase(), // Store username in lowercase
        createdAt: new Date().toISOString(),
      });

      setNotification({ message: 'Signup Successful! Redirecting to login...', type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Delay for user to see success message

    } catch (err) {
      console.error('Error signing up:', err);
      if (err.code === 'auth/email-already-in-use') {
        setNotification({ message: 'This email address is already in use. Please use a different email or login.', type: 'error' });
        setStep(1); // Go back to email step
      } else if (err.code === 'auth/weak-password') {
        setNotification({ message: 'The password is too weak. Please choose a stronger password.', type: 'error' });
      } else {
        setNotification({ message: 'Failed to create account. Please try again. ' + err.message, type: 'error' });
      }
    }
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-1">Let's start with your email</h2>
            <p className="text-gray-400 mb-6 text-sm">We'll use this to verify your account.</p>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-500" />
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
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-dark-border bg-dark-input rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-1">What's your name?</h2>
            <p className="text-gray-400 mb-6 text-sm">This will be displayed on your profile.</p>
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-500" />
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
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-dark-border bg-dark-input rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-1">When's your birthday?</h2>
            <p className="text-gray-400 mb-6 text-sm">We use this for age verification.</p>
            <div>
              <label htmlFor="dob" className="sr-only">Date of Birth</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-dark-border bg-dark-input rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-1">Choose a username</h2>
            <p className="text-gray-400 mb-6 text-sm">Choose something unique and memorable.</p>
            {notification.message && notification.type === 'error' && step === 4 && (
              <div className="mb-4 text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/30">
                {notification.message}
              </div>
            )}
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="your_username"
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-dark-border bg-dark-input rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-1">Set a secure password</h2>
            <p className="text-gray-400 mb-6 text-sm">Make sure it's strong and secure.</p>
            {notification.message && notification.type === 'error' && step === 5 && (
              <div className="mb-4 text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/30">
                {notification.message}
              </div>
            )}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-500" />
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
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-dark-border bg-dark-input rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-300">
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 selection:bg-primary-500 selection:text-white">
      <div className="w-full max-w-lg bg-dark-card shadow-2xl rounded-xl p-8 md:p-12 space-y-8 transform transition-all duration-500 hover:scale-[1.02]">
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: '' })} 
        />
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <FiUserPlus className="h-12 w-auto text-primary-500 mx-auto" />
          </Link>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Create your PDFigo Account</h1>
          <p className="mt-3 text-gray-400">Join us and manage your PDFs like a pro.</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-dark-input rounded-full h-2.5 mb-8">
          <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>

        {/* Step-specific error messages are now rendered within renderStep() */}

        <form onSubmit={step < 5 ? handleNextStep : handleSignup} className="space-y-6">
          {renderStep()}
          <div className="flex items-center justify-between pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={isLoading}
                className="px-6 py-3 border border-dark-border rounded-lg text-sm font-medium text-gray-300 hover:bg-dark-hover hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-bg transition-colors duration-150 disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`ml-auto flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-bg transition-transform transform hover:scale-105 duration-300 ease-out ${step === 1 ? 'w-full' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading && step === 5 ? (
                <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              ) : step < 5 ? 'Next' : 'Create Account'}
              {!isLoading || step < 5 ? <FiArrowRight className="ml-2 inline-block h-5 w-5" /> : null}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-500 hover:text-primary-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;