import React from 'react';
import { useNavigate } from 'react-router-dom';

import './Banner.css';

import homeimg from '../assets/home.png'
import ma from '../assets/ma.svg'
import fr from '../assets/fr.svg'


const Banner = () => {
  const navigate = useNavigate();

  const navigateToMoro = () => {
    navigate('/Morroco');
  };
  const navigateToFrance = () => {
    navigate('/France');
  };
  return (
    <div className="banner">
      <div className='Listings-choice'>
        <h1>Vous voulez des annonces de <span className='clickable' onClick={navigateToMoro}>Maroc</span > ou de <span className='clickable' onClick={navigateToFrance}>France</span>?</h1>
      </div>
      <img src={homeimg} alt="Banner" />
      

    </div>
  );
};

export default Banner;
