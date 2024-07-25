// src/UserPage.js
import React from 'react';
import Header from './components/Header';
import Banner from './components/Banner';
import Categories from './components/Categories';
import Listings from './components/Listings';
import Uppernav from './components/Uppernav';
import Greenline from './components/Greenline';

const UserPage = () => {
  return (
    <div className="user-page">
      <Uppernav userLoggedIn={true} />
      <Header />
      <Banner />
      <Categories />
      <Greenline />
      <Listings />
    </div>
  );
};

export default UserPage;
