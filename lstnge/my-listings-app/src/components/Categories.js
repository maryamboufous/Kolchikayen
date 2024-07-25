import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';
import Vehicules from '../assets/car.jpg';
import Motos from '../assets/moto.webp';
import Immobilier from '../assets/house.jpg';
import Telephones from '../assets/phone.jpg';
import Ordinateurs from '../assets/ordi.webp';
import Vetements from '../assets/clothes.jpg';
import Books from '../assets/book.jpg';
import Electro from '../assets/electro.jpg';
import Maison from '../assets/maison.jpg';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const categories = [
  { icon: Vehicules, label: 'Vehicules' },
  { icon: Motos, label: 'Motos' },
  { icon: Immobilier, label: 'Immobilier' },
  { icon: Telephones, label: 'Telephones' },
  { icon: Ordinateurs, label: 'Ordinateurs' },
  { icon: Vetements, label: 'Vetements' },
  { icon: Books, label: 'Books' },
  { icon: Electro, label: 'Electro' },
  { icon: Maison, label: 'Maison' },
];

const Categories = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesToShow = 5; // Number of slides to show at once

  const handleCategoryClick = (label) => {
    navigate(`/products/category/${label}`);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => Math.max(prevSlide - 1, 0));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => Math.min(prevSlide + 1, categories.length - slidesToShow));
  };

  return (
    <div className="categories">
      <div className="categories-title">
        <h1>Que cherchez-vous?</h1>
        <button onClick={() => navigate('/Allcategories')}>Voir plus</button>
      </div>
      <div className="categories-slider">
        <div className="slider-wrapper" style={{ transform: `translateX(${-currentSlide * (100 / slidesToShow)}%)` }}>
          {categories.map((category, index) => (
            <div key={index} className="slide">
              <img
                src={category.icon}
                alt={category.label}
                onClick={() => handleCategoryClick(category.label)}
              />
            </div>
          ))}
        </div>
        {currentSlide > 0 && (
          <button className="slider-btn prev" onClick={goToPrevSlide}>
            <FaChevronLeft />
          </button>
        )}
        {currentSlide + slidesToShow < categories.length && (
          <button className="slider-btn next" onClick={goToNextSlide}>
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default Categories;
