import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Banner.css';
import homeimg from '../assets/home.png';

const Banner = () => {
  const navigate = useNavigate();

  const navigateToMorocco = () => {
    navigate('/country/Morocco');
  };

  const navigateToFrance = () => {
    navigate('/country/France');
  };

  return (
    <div className="banner">
      <div className='Listings-choice'>
        <h1>Vous voulez des annonces de <span className='clickable' onClick={navigateToMorocco}>Maroc</span> ou de <span className='clickable' onClick={navigateToFrance}>France</span>?</h1>
      </div>
      <img src={homeimg} alt="Banner" />
    </div>
  );
};

export default Banner;
