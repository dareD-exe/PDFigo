import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiCamera, FiLoader } from 'react-icons/fi';
import Notification from '../components/Notification';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'username', 'dob'
  const [formData, setFormData] = useState({ username: '', dob: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const storage = getStorage();

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const dbData = userDocSnap.data();
            setUserData(dbData);
            setFormData({ username: dbData.username || '', dob: dbData.dob || '' });
            setProfileImageUrl(dbData.profileImageUrl || '');
          } else {
            setNotification({ message: 'User data not found.', type: 'error' });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setNotification({ message: 'Failed to load profile data.', type: 'error' });
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [currentUser]);

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async (fieldToSave) => {
    if (!currentUser) return;
    setSaving(true);
    setNotification({ message: '', type: '' });
    const userDocRef = doc(db, 'users', currentUser.uid);
    let dataToUpdate = {};
    let successMessage = '';

    try {
      if (fieldToSave === 'profileImage' && profileImage) {
        setUploading(true);
        const imageRef = ref(storage, `profile_images/${currentUser.uid}/${profileImage.name}`);
        await uploadBytes(imageRef, profileImage);
        const downloadURL = await getDownloadURL(imageRef);
        dataToUpdate.profileImageUrl = downloadURL;
        setProfileImageUrl(downloadURL); // Update displayed image URL
        successMessage = 'Profile image updated successfully.';
        setUploading(false);
      } else if (fieldToSave === 'username') {
        if (!formData.username.trim()) {
          setNotification({ message: 'Username cannot be empty.', type: 'error' });
          setSaving(false);
          return;
        }
        // Add username uniqueness check if necessary here
        dataToUpdate.username = formData.username.trim();
        successMessage = 'Username updated successfully.';
      } else if (fieldToSave === 'dob') {
        dataToUpdate.dob = formData.dob;
        successMessage = 'Date of birth updated successfully.';
      }

      if (Object.keys(dataToUpdate).length > 0) {
        await updateDoc(userDocRef, dataToUpdate);
        setUserData(prev => ({ ...prev, ...dataToUpdate }));
        setNotification({ message: successMessage, type: 'success' });
      }
      setEditingField(null);
      setProfileImage(null); // Reset file input after upload
    } catch (error) {
      console.error(`Error updating ${fieldToSave}:`, error);
      setNotification({ message: `Failed to update ${fieldToSave}.`, type: 'error' });
      setUploading(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <FiLoader className="animate-spin text-primary-500 h-12 w-12" />
      </div>
    );
  }

  if (!currentUser || !userData) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 text-white">
        <p>Please log in to view your profile.</p>
        {/* Optionally, add a link to login page */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-4 md:p-8 selection:bg-primary-500 selection:text-white">
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />
      <div className="max-w-2xl mx-auto bg-dark-card shadow-2xl rounded-xl p-6 md:p-10 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary-400 mb-8">My Profile</h1>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <img 
              src={profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || currentUser.email)}&background=0D8ABC&color=fff&size=128`}
              alt="Profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary-500 shadow-lg"
            />
            <label htmlFor="profileImageInput" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FiCamera className="h-8 w-8 text-white" />
            </label>
            <input type="file" id="profileImageInput" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
          {profileImage && (
            <button 
              onClick={() => handleSave('profileImage')}
              disabled={uploading || saving}
              className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center transition-colors disabled:opacity-50"
            >
              {uploading ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />} Upload Image
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Email (Display Only) */}
          <div className="flex items-center justify-between p-3 bg-dark-input rounded-lg">
            <div className="flex items-center">
              <FiMail className="h-5 w-5 text-primary-400 mr-3" />
              <span className="text-gray-400">Email:</span>
            </div>
            <span className="font-medium">{currentUser.email}</span>
          </div>

          {/* Username */}
          <div className="p-3 bg-dark-input rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiUser className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-400">Username:</span>
              </div>
              {editingField === 'username' ? (
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-white focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <span className="font-medium">{userData.username || 'Not set'}</span>
              )}
              {editingField === 'username' ? (
                <button onClick={() => handleSave('username')} disabled={saving} className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50">
                  {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                </button>
              ) : (
                <button onClick={() => handleEdit('username')} className="p-2 text-primary-400 hover:text-primary-300">
                  <FiEdit2 />
                </button>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="p-3 bg-dark-input rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiCalendar className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-400">Date of Birth:</span>
              </div>
              {editingField === 'dob' ? (
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob}
                  onChange={handleChange}
                  className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-white focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <span className="font-medium">{userData.dob || 'Not set'}</span>
              )}
              {editingField === 'dob' ? (
                <button onClick={() => handleSave('dob')} disabled={saving} className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50">
                  {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                </button>
              ) : (
                <button onClick={() => handleEdit('dob')} className="p-2 text-primary-400 hover:text-primary-300">
                  <FiEdit2 />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;