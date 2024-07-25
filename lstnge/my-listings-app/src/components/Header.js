import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const navigateToLogin = () => {
    navigate('/login');
  };

  const navigateToSignup = () => {
    navigate('/signup');
  };

  return (
    <header className="header">
      <nav className="navbar">
        <ul className="navbar-list">
          <li><a href="#">Immobilier</a></li>
          <li><a href="#">Véhicules</a></li>
          <li><a href="#">Location de vacances</a></li>
          <li><a href="#">Emplois</a></li>
          <li><a href="#">Mode</a></li>
          <li><a href="#">Maison & Jardin</a></li>
          <li><a href="#">Électronique</a></li>
          <li><a href="#">Loisirs</a></li>
          <li><a href="#">Autres</a></li>
          <li><img src=''></img></li>
          <li><a href='#' className="France">France</a></li>
        </ul>

        {/* <div className="auth-buttons">
          <button>Déposer une annonce</button>
          <button onClick={navigateToSignup}>Créer un compte</button>
          <button onClick={navigateToLogin}>Se connecter</button>
        </div> */}
        
      </nav>
    </header>
  );
};

export default Header;
