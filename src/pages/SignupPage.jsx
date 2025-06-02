import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiUser, FiCalendar, FiLock, FiArrowRight, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { auth, db } from '../firebase'; // Import Firebase auth and db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    dob: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep = () => {
    switch (step) {
      case 1: // Email
        if (!formData.email) {
          setError('Please enter your email address.');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address.');
          return false;
        }
        // In a real app, check if email is already taken
        break;
      case 2: // Full Name
        if (!formData.fullName) {
          setError('Please enter your full name.');
          return false;
        }
        break;
      case 3: // Date of Birth
        if (!formData.dob) {
          setError('Please enter your date of birth.');
          return false;
        }
        // Basic age validation (e.g., must be 13+)
        const today = new Date();
        const birthDate = new Date(formData.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 13) {
            setError('You must be at least 13 years old to sign up.');
            return false;
        }
        break;
      case 4: // Username
        if (!formData.username) {
          setError('Please enter a username.');
          return false;
        }
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters long.');
          return false;
        }
        // In a real app, check if username is already taken
        break;
      case 5: // Password
        if (!formData.password) {
          setError('Please enter a password.');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long.');
          return false;
        }
        // Add more password strength checks if needed (e.g., uppercase, number, symbol)
        break;
      default:
        return true;
    }
    setError('');
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      setError(''); // Clear previous errors
      try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Store additional user details in Firestore
        // Use user.uid as the document ID
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: formData.email,
          fullName: formData.fullName,
          dob: formData.dob,
          username: formData.username,
          createdAt: new Date().toISOString(), // Optional: store creation timestamp
        });

        console.log('Signup successful, user created:', user);
        alert('Signup Successful! Please login.'); // Replace with modal later if needed
        navigate('/login');

      } catch (error) {
        console.error('Error signing up:', error);
        // Handle Firebase errors (e.g., email-already-in-use, weak-password)
        if (error.code === 'auth/email-already-in-use') {
          setError('This email address is already in use. Please use a different email or login.');
        } else if (error.code === 'auth/weak-password') {
          setError('The password is too weak. Please choose a stronger password.');
        } else {
          setError('Failed to create account. Please try again. ' + error.message);
        }
      }
    }
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
            <p className="text-gray-400 mb-6 text-sm">This will be your unique identifier on PDFigo.</p>
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
            <p className="text-gray-400 mb-6 text-sm">Make sure it's at least 8 characters long.</p>
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
      <div className="w-full max-w-md bg-dark-card shadow-2xl rounded-xl p-8 space-y-8 transform transition-all duration-500 hover:scale-105">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <svg className="h-12 w-auto text-primary-500 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 18H17V16H7V18Z" fill="currentColor" /><path d="M17 14H7V12H17V14Z" fill="currentColor" /><path d="M7 10H11V8H7V10Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" /></svg>
          </Link>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Create your PDFigo Account</h1>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={step < 5 ? handleNextStep : handleSignup} className="space-y-6">
          {renderStep()}

          <div className={`flex ${step > 1 ? 'justify-between' : 'justify-end'} items-center pt-2`}>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-4 py-2 border border-dark-border rounded-lg text-sm font-medium text-gray-300 hover:bg-dark-input focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-bg transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-bg transition-transform transform hover:scale-105 duration-300 ease-out"
            >
              {step < 5 ? 'Next' : 'Sign Up'} 
              {step < 5 ? <FiArrowRight className="ml-2 h-5 w-5" /> : <FiUserPlus className="ml-2 h-5 w-5" />}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;