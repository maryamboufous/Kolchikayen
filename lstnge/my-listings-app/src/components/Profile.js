import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import SecondaryNav from './SecondaryNav';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(UserContext);

  const [userData, setUserData] = useState({
    name: '',
    lastName: '',
    dateOfBirth: '',
    mobile: '',
    address: '',
    postalCode: '',
    country: 'France',
    email: '',
    announcements: [],
    profileImage: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [profileImageFile, setProfileImageFile] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user._id) {
        console.error('User ID is missing');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/users/${user._id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData({
            ...data.user,
            dateOfBirth: data.user.dateOfBirth ? new Date(data.user.dateOfBirth).toISOString().split('T')[0] : '',
          });
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e) => {
    setProfileImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const updatedData = { ...userData };

    if (passwordData.newPassword) {
      updatedData.newPassword = passwordData.newPassword;
    }

    try {
      const response = await fetch(`http://localhost:5001/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        setUserData({
          ...userData,
          ...data.user,
          dateOfBirth: data.user.dateOfBirth ? new Date(data.user.dateOfBirth).toISOString().split('T')[0] : '',
        });
        setPasswordData({
          newPassword: '',
          confirmPassword: '',
        });
        alert('Profile updated successfully');
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }

    if (profileImageFile) {
      const formData = new FormData();
      formData.append('profileImage', profileImageFile);
      formData.append('userId', user._id);

      try {
        const response = await fetch('http://localhost:5001/upload-profile-image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.status === 'ok') {
          setUserData((prevData) => ({
            ...prevData,
            profileImage: data.user.profileImage,
          }));
          alert('Profile image updated successfully');
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error uploading profile image:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Profile</h1>
      {userData ? (
        <div className="profileHeader">
          <div className="profileImage">
            {userData.profileImage ? (
              <img src={userData.profileImage} alt="Profile" />
            ) : (
              <div className="placeholderImage">No Image</div>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="profileField">
              <label>Nom:</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="profileField">
              <label>Prénom:</label>
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="profileField">
              <label>Date de naissance:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={userData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div className="profileField">
              <label>Mobile:</label>
              <input
                type="text"
                name="mobile"
                value={userData.mobile}
                onChange={handleInputChange}
              />
            </div>
            <div className="profileField">
              <label>Adresse:</label>
              <input
                type="text"
                name="address"
                value={userData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="profileField">
              <label>Code Postal:</label>
              <input
                type="text"
                name="postalCode"
                value={userData.postalCode}
                onChange={handleInputChange}
              />
            </div>
            <div className="profileField">
              <label>Pays:</label>
              <select
                name="country"
                value={userData.country}
                onChange={handleInputChange}
              >
                <option value="France">France</option>
                <option value="Morocco">Maroc</option>
              </select>
            </div>
            <div className="profileField">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="profileField">
              <label>Nouveau mot de passe:</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="profileField">
              <label>Confirmer mot de passe:</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="profileField">
              <label>Profile Image:</label>
              <input type="file" name="profileImage" onChange={handleProfileImageChange} />
            </div>
            <button type="submit">Mettre à jour</button>
          </form>
        </div>
      ) : (
        <div>En cours...</div>
      )}
    </div>
  );
};

export default Profile;
