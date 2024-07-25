import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import './Listings.css';
import { Link } from 'react-router-dom';
import heartEmpty from '../assets/heart_empty.png';
import heartLike from '../assets/like.png';

const Listings = () => {
  const [products, setProducts] = useState([]);
  const { user, cartItemCount, setCartItemCount, likedProducts, setLikedProducts } = useContext(UserContext);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const toggleLike = async (productId) => {
    const isLiked = likedProducts.includes(productId);

    try {
      const response = await fetch(`http://localhost:5001/${isLiked ? 'unlike' : 'like'}-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id, productId }),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        setLikedProducts((prevLikedProducts) =>
          isLiked ? prevLikedProducts.filter((id) => id !== productId) : [...prevLikedProducts, productId]
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:5001/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id, productId }),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        setCartItemCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="listings">
      <h1>Liste des Produits</h1>
      <div className="listing-items">
        {products.map((product) => (
          <div className="listing-item" key={product._id}>
            <Link to={`/Product/${product._id}`} className="btntoprod">
              <img src={`http://localhost:5001/${product.images[0]}`} alt={product.name} />
              <div className="listing-details">
                <h3>{product.name}</h3>
                <p>{product.price} DH</p>
                <p>
                  <small className="text-muted">Publié par {product.userId ? product.userId.name : 'Unknown'}</small>
                </p>
              </div>
            </Link>
            <div className="heart-icon" onClick={() => toggleLike(product._id)}>
              <img src={likedProducts.includes(product._id) ? heartLike : heartEmpty} alt="like button" />
            </div>
            <button className='btn btn-info' onClick={() => addToCart(product._id)}>
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listings;
