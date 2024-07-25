import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      // Fetch liked products when user changes
      fetchLikedProducts(user._id);
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const fetchLikedProducts = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5001/user/${userId}/liked-products`);
      if (response.ok) {
        const data = await response.json();
        setLikedProducts(data);
      } else {
        console.error('Failed to fetch liked products');
      }
    } catch (error) {
      console.error('Error fetching liked products:', error);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, cartItemCount, setCartItemCount, likedProducts, setLikedProducts }}>
      {children}
    </UserContext.Provider>
  );
};
