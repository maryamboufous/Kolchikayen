import React from 'react';
import { useNavigate } from 'react-router-dom';
import './countryListings.css';
import Listings from './Listings';



const MoroListings = () => {
    
  return (
    <div  className='countryListings'>
      <Listings />

    </div>
  );
};

export default MoroListings;
