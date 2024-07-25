import React from 'react';
import { BrowserRouter as Router,Routes, Route, Switch } from 'react-router-dom';
import Header from './Header';
import Banner from './Banner';
import Categories from './Categories';
import Listings from './Listings';
import Uppernav from './Uppernav';
import Greenline from './Greenline';

import './Home.css';

const Home = () => {
  return (
    
    <div className="home">
      <Banner />
      <Categories />
      <Greenline/>
      <Listings />
    </div>
  );
};

export default Home;
