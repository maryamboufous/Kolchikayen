// src/components/RouteGuard.js
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

const RouteGuard = ({ children }) => {
  const { user } = useContext(UserContext);
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true); // To handle loading state
  const location = useLocation();

  useEffect(() => {
    const fetchCountry = async (lat, lng) => {
      try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=ecc7f860f730475f9d7f92f92e8f6c5d`);
        const fetchedCountry = response.data.results[0].components.country;
        setCountry(fetchedCountry);
        localStorage.setItem('country', fetchedCountry); // Store country information
        setLoading(false); // Finished loading
      } catch (error) {
        console.error('Error fetching country:', error);
        setLoading(false); // Finished loading even on error
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchCountry(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error('Error getting location:', error);
            setLoading(false); // Finished loading even on error
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        setLoading(false); // Finished loading if geolocation is not supported
      }
    };

    const storedCountry = localStorage.getItem('country');
    if (storedCountry) {
      setCountry(storedCountry);
      setLoading(false); // Skip loading if country is already stored
    } else {
      getLocation();
    }
  }, []);

  const allowedCountries = ['Morocco', 'France', 'Maroc'];
  const isAllowedCountry = allowedCountries.includes(country);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while fetching location
  }

  if (!isAllowedCountry && ['/login', '/signup', '/Favoris', '/Cart', '/Buy', '/Profile', '/Messages', '/userpage/add-product-form', '/store', '/edit-product/:productId'].includes(location.pathname)) {
    return <Navigate to="/Home" />;
  }

  return children;
};

export default RouteGuard;
