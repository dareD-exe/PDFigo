import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiUser, FiMail, FiEdit2, FiSave, FiCamera, FiLoader, FiX, FiPhone, FiMapPin, FiSettings, FiCalendar, FiClock } from 'react-icons/fi';
import Notification from '../components/Notification';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicBackground from '../components/CosmicBackground';
import Footer from '../components/Footer';

const presetProfileImages = [
  'https://images.unsplash.com/photo-1748565387500-849a7d3b4989?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1747491681740-22095d6f683d?q=80&w=2872&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1748695115422-17a60e0db33c?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1747995709691-5d0cf015c991?q=80&w=2864&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1742218410105-4a57a1dca01d?q=80&w=2865&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

const ProfilePage = () => {
  const { currentUser, loadingAuth } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editableData, setEditableData] = useState({ // State for editable fields
    fullName: '',
    username: '',
    dob: '',
    mobile: '',
    location: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const storage = getStorage();

  // Add useEffect for document title
  useEffect(() => {
    document.title = 'Profile | PDFigo - Murtuja';
    return () => {
      document.title = 'PDFigo - Murtuja';
    };
  }, []);

  useEffect(() => {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const dbData = userDocSnap.data();
            setUserData(dbData);
          setEditableData({
            fullName: dbData.fullName || currentUser.displayName || '',
            username: dbData.username || '',
            dob: dbData.dob || '',
            mobile: dbData.mobile || '',
            location: dbData.location || '',
          });
            setProfileImageUrl(dbData.profileImageUrl || currentUser.photoURL || '');
          } else {
          // User document doesn't exist (e.g., first time Google login or email/password signup without full profile creation yet)
          setNotification({ message: 'Creating user data in DB.', type: 'info' }); // Info message
          
          const initialUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            fullName: currentUser.displayName || '',
            username: '', // Username is usually set during signup or later
            createdAt: new Date().toISOString(),
            profileImageUrl: currentUser.photoURL || '',
            // Initialize other fields as empty or default
            dob: '',
            mobile: '',
            location: '',
          };

          await setDoc(userDocRef, initialUserData, { merge: true }); // Create document with initial data if it doesn't exist

          setUserData(initialUserData);
          setEditableData({
            fullName: initialUserData.fullName,
            username: initialUserData.username,
            dob: initialUserData.dob,
            mobile: initialUserData.mobile,
            location: initialUserData.location,
          });
          setProfileImageUrl(initialUserData.profileImageUrl);

          }
        } catch (error) {
          console.error("Error fetching or creating user data:", error);
          setNotification({ message: 'Failed to load or initialize profile data.', type: 'error' });
        setUserData({}); // Still set userData to an empty object on error
        } finally {
        setLoading(false);
        // After loading/initializing, check if profile is incomplete (e.g., missing username)
        // and automatically open settings for first-time Google signups or incomplete profiles
        if (currentUser && (!userData?.username && !editableData.username)) {
          // Add a small delay to allow the page to render before the modal pops up
          setTimeout(() => {
            setSettingsOpen(true);
          }, 100);
        }
        }
      };

    if (currentUser) {
      fetchUserData();
    } else {
      // If currentUser is null (logged out)
      setUserData(null);
      setEditableData({ fullName: '', username: '', dob: '', mobile: '', location: '', });
      setProfileImageUrl('');
      setLoading(false); // Not loading if no user
    }
  }, [currentUser]); // Rerun when currentUser changes

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFieldChange = (e) => {
    setEditableData({ ...editableData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!currentUser) {
      setNotification({ message: 'You must be logged in to update your profile.', type: 'error' });
      return;
    }

    setSaving(true);
    setNotification({ message: '', type: '' });
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      let dataToUpdate = {
        ...editableData,
        updatedAt: new Date().toISOString()
      };

      // Validate data before updating
      if (dataToUpdate.username && dataToUpdate.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      // If a new image file was selected (not a preset)
      if (profileImage && !presetProfileImages.includes(profileImageUrl)) {
        const imageRef = ref(storage, `profile_images/${currentUser.uid}/${profileImage.name}`);
        await uploadBytes(imageRef, profileImage);
        const downloadURL = await getDownloadURL(imageRef);
        dataToUpdate.profileImageUrl = downloadURL;
        setProfileImageUrl(downloadURL);
      } else if (profileImageUrl && presetProfileImages.includes(profileImageUrl)) {
        dataToUpdate.profileImageUrl = profileImageUrl;
      }

      // Update the document using setDoc with merge: true
      await setDoc(userDocRef, dataToUpdate, { merge: true });
      
      // Update local state
      setUserData(prev => ({ ...prev, ...dataToUpdate }));
      setNotification({ message: 'Profile updated successfully.', type: 'success' });
      setProfileImage(null);
      setSettingsOpen(false);
    } catch (error) {
      console.error('Profile update error:', error);
      let errorMessage = 'Failed to update profile. ';
      
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to update this profile.';
      } else if (error.code === 'not-found') {
        errorMessage += 'Profile document not found.';
      } else if (error.code === 'unauthenticated') {
        errorMessage += 'Please log in to update your profile.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Assuming timestamp is ISO string or Firestore Timestamp
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate();
    return date.toLocaleDateString(); // Or use a more specific format like 'MM/DD/YYYY'
  };

  if (loadingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
        <CosmicBackground />
        <FiLoader className="animate-spin text-cyan-400 h-12 w-12" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white bg-gradient-to-br from-gray-900 to-black">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col relative overflow-hidden pt-32 px-4">
        <CosmicBackground />
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl mx-auto bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-[0_0_60px_rgba(0,255,255,0.2)] p-8 md:p-10 relative flex-grow"
        >
          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSettingsOpen(true)}
            className="absolute top-5 right-5 text-blue-300 hover:text-cyan-400 text-3xl transition-colors duration-200"
            aria-label="Settings"
          >
            <FiSettings />
          </motion.button>

          <div className="flex flex-col items-center mb-8">
            {/* Profile Photo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative mb-4"
            >
            <img 
                src={profileImageUrl || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(editableData.fullName || userData?.fullName || currentUser.displayName || currentUser.email)}&background=0D8ABC&color=fff&size=128`}
              alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-lg"
            />
              {/* Image change handled in settings modal */}
            </motion.div>

            {/* Name and Username */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-1">{editableData.fullName || userData?.fullName || currentUser.displayName || currentUser.email.split('@')[0]}</h2>
              <p className="text-blue-200 text-lg">@{userData?.username || 'username'}</p>
            </motion.div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-blue-100/90">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="text-sm font-medium text-blue-300 mb-1">Email Address</div>
              <div className="text-white font-semibold break-words">{currentUser.email}</div>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className="text-sm font-medium text-blue-300 mb-1">Date of Birth</div>
              <div className="text-white font-semibold">{formatDate(userData?.dob)}</div>
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="text-sm font-medium text-blue-300 mb-1">Joined</div>
              <div className="text-white font-semibold">{formatDate(userData?.createdAt)}</div>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="text-sm font-medium text-blue-300 mb-1">Mobile Number</div>
              <div className="text-white font-semibold">{userData?.mobile || 'N/A'}</div>
            </motion.div>
             <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <div className="text-sm font-medium text-blue-300 mb-1">Location</div>
              <div className="text-white font-semibold">{userData?.location || 'N/A'}</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Settings Modal */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-gray-900 rounded-xl p-8 w-full max-w-md relative shadow-lg border border-blue-700/50 max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                  onClick={() => setSettingsOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 text-2xl transition-colors duration-200"
                  aria-label="Close"
                >
                  <FiX />
                </motion.button>
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Edit Profile</h3>
                <div className="flex flex-col items-center gap-4 mb-6">
                  {/* Editable Profile Photo */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <img
                      src={profileImageUrl || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(editableData.fullName || userData?.fullName || currentUser.displayName || currentUser.email)}&background=0D8ABC&color=fff&size=128`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 shadow-lg"
                    />
                    <label htmlFor="modalProfileImageInput" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer border-2 border-gray-900 shadow transition">
                      <FiCamera className="w-5 h-5 text-white" />
                    </label>
                    <input
                      type="file"
                      id="modalProfileImageInput"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </motion.div>

                  {/* Preset Images */}
                  <div className="mt-6">
                    <h4 className="text-lg text-blue-200 mb-3">Choose a Preset:</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {presetProfileImages.map((url, index) => (
                        <motion.img
                          key={index}
                          src={url}
                          alt={`Preset ${index + 1}`}
                          className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 ${
                            profileImageUrl === url ? 'border-blue-500' : 'border-transparent'
                          } hover:border-blue-400 transition-colors duration-200`}
                          onClick={() => {
                            setProfileImageUrl(url); // Set the URL directly
                            setProfileImage(null); // Clear any selected file if a preset is chosen
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-1">Screen Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editableData.fullName}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                      placeholder="Your name"
                    />
              </div>
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-1">Username</label>
                <input 
                  type="text" 
                  name="username" 
                      value={editableData.username}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                      placeholder="Username"
                    />
            </div>
                   <div>
                    <label className="block text-blue-300 text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={currentUser.email}
                      disabled // Email is not editable
                      className="w-full px-4 py-2 bg-gray-800/30 border border-gray-700 rounded-md text-gray-500 cursor-not-allowed"
                    />
          </div>
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                      value={editableData.dob}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                   <div>
                    <label className="block text-blue-300 text-sm font-medium mb-1">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      value={editableData.mobile}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                      placeholder="Mobile Number"
                    />
            </div>
                   <div>
                    <label className="block text-blue-300 text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editableData.location}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                      placeholder="Location"
                    />
          </div>
        </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FiLoader className="h-5 w-5 text-white mr-2" />
                    </motion.div>
                  ) : null}
                  Save Changes
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;