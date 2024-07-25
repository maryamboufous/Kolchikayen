// src/components/SecondaryNav.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './SecondaryNav.css';

const SecondaryNav = () => {
  return (
    <nav className="secondary-nav">
      <NavLink to="/Profile" className={({ isActive }) => (isActive ? 'active' : '')}>Profile</NavLink>
      <NavLink to="/Cart" className={({ isActive }) => (isActive ? 'active' : '')}>Cart</NavLink>
      <NavLink to="/store" className={({ isActive }) => (isActive ? 'active' : '')}>Shop</NavLink>
      <NavLink to="/Favoris" className={({ isActive }) => (isActive ? 'active' : '')}>Favoris</NavLink>
    </nav>
  );
};

export default SecondaryNav;
