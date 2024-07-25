import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useCountry } from '../context/CountryContext';
import { FaRegHeart, FaSearch, FaRegUser } from 'react-icons/fa';
import { RiStore2Line } from "react-icons/ri";
import { GrChat } from "react-icons/gr";
import { AiOutlineShoppingCart } from "react-icons/ai";
import './Uppernav.css';
import axios from 'axios';

const UpperNav = ({ userLoggedIn }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [country, setCountry] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchCountry = async (lat, lng) => {
      try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=ecc7f860f730475f9d7f92f92e8f6c5d`);
        const country = response.data.results[0].components.country;
        setCountry(country);
      } catch (error) {
        console.error('Error fetching country:', error);
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
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    getLocation();
  }, [setCountry]);

  const handleLogout = () => {
    setUser(null);
    navigate('/Home');
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const navigateTo = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  // List of allowed countries
  const allowedCountries = ['Morocco', 'France', 'Maroc'];
  const isAllowedCountry = allowedCountries.includes(country);

  return (
    <>
      <nav className="upper-nav">
        {user ? (<span>En ligne</span>) : (<span>Off ligne</span>)}
        <div className="nav-logo">
          <span onClick={() => navigateTo('/Home')} className="username">KOLCHIKAYN</span>
        </div>
        <div className="country">
          Country: {country ? <span>{country}</span> : <span>Loading...</span>}
        </div>
        <div className={`nav-links ${showMenu ? 'show' : ''}`}>
          <div className="searchholder">
            <input type="text" placeholder="RECHERCHER" />
            <button className="search-button"><FaSearch /></button>
          </div>
          {user ? (
            <>
              <button onClick={() => navigateTo('/Profile')} className="icon-button"><FaRegUser /></button>
              <button onClick={() => navigateTo('/Favoris')} className="icon-button"><FaRegHeart /></button>
              <button onClick={() => navigateTo('/Messages')} className="icon-button"><GrChat /></button>
              <span className="welcome-text">Bienvenue {user ? user.name : ''} !</span>
              <button onClick={() => navigateTo('/userpage/add-product-form')} className="post-ad">Déposer une annonce</button>
              <button onClick={handleLogout} className="logout">Déconnexion</button>
            </>
          ) : (
            <>
              <button 
                onClick={() => isAllowedCountry ? navigateTo('/login') : alert('Service is not available in your country')}
                className="post-ad"
              >
                DÉPOSER UNE ANNONCE
              </button>
              <button 
                onClick={() => isAllowedCountry ? navigateTo('/login') : alert('Service is not available in your country')}
                className="login"
              >
                SE CONNECTER
              </button>
            </>
          )}
        </div>
        <div className="burger-menu" onClick={toggleMenu}>
          <div className={`bar ${showMenu ? 'change' : ''}`}></div>
          <div className={`bar ${showMenu ? 'change' : ''}`}></div>
          <div className={`bar ${showMenu ? 'change' : ''}`}></div>
        </div>
      </nav>
      <div className="categories-bar">
        {['Immobilier', 'Vehicules', 'Motos', 'Telephones', 'Ordinateurs', 'Vetements', 'Books', 'Electromenagers', 'Astuces Maison', 'Autres'].map((category) => (
          <span key={category} onClick={() => navigateTo(`/products/category/${category}`)}>{category}</span>
        ))}
      </div>
    </>
  );
};

export default UpperNav;
