// src/components/AllCats.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AllCats.css';
import Vehicules from '../assets/c1.png';
import Motos from '../assets/c2.png';
import Immobilier from '../assets/c3.png';
import Telephones from '../assets/c4.png';
import Ordinateurs from '../assets/c5.png';
import Vetements from '../assets/c6.png';

const categories = [
  { icon: Vehicules, label: 'Vehicules' },
  { icon: Motos, label: 'Motos' },
  { icon: Immobilier, label: 'Immobilier' },
  { icon: Telephones, label: 'Telephones' },
  { icon: Ordinateurs, label: 'Ordinateurs' },
  { icon: Vetements, label: 'Vetements' },
];

const AllCats = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (label) => {
    navigate(`/products/category/${label}`);
  };

  return (
    <div className="categories">
      {categories.map((category, index) => (
        <div key={index} className="category" onClick={() => handleCategoryClick(category.label)}>
          <img src={category.icon} alt={category.label} />
          <span>{category.label}</span>
        </div>
      ))}
    </div>
  );
};

export default AllCats;
