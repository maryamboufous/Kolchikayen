import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import './Cart.css'; 
import heartEmpty from '../assets/heart_empty.png';
import heartLike from '../assets/like.png';

const Cart = () => {
  const { user, cartItemCount, setCartItemCount, likedProducts, setLikedProducts } = useContext(UserContext);
  const [cartProducts, setCartProducts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCartProducts = async () => {
      if (!user || !user._id) {
        setError('User is not logged in.');
        return;
      }
      try {
        const response = await fetch(`http://localhost:5001/user/${user._id}/cart-products?complete=true`);
        if (response.ok) {
          const data = await response.json();
          setCartProducts(data);
        } else {
          setError(`Failed to fetch cart products: ${response.statusText}`);
        }
      } catch (error) {
        setError(`Error fetching cart products: ${error.message}`);
      }
    };
    fetchCartProducts();
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
          isLiked
            ? prevLikedProducts.filter((id) => id !== productId)
            : [...prevLikedProducts, productId]
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5001/user/${user._id}/cart-products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartProducts((prev) => prev.filter((product) => product._id !== productId));
        setCartItemCount((prevCount) => prevCount - 1);
      } else {
        setError('Failed to remove product from cart');
      }
    } catch (error) {
      setError('Error removing product from cart');
    }
  };

  const navigateToBuy =() =>{
    navigate('/Buy');
  }

  return (
    <div className="cart">
      <h1>Votre Panier</h1>
      {error && <p className="error">{error}</p>}
      <div className="cart-items">
        {cartProducts.length > 0 ? (
          cartProducts.map((product) => (
            <div className="cart-item" key={product._id}>
              <Link to={`/Product/${product._id}`} className="btntoprod">
                <img
                  src={`http://localhost:5001/${product.images[0]}`}
                  alt={product.name}
                  className="cart-item-image"
                />
              </Link>
              <div className="heart-icon" onClick={() => toggleLike(product._id)}>
                <img
                  src={likedProducts.includes(product._id) ? heartLike : heartEmpty}
                  alt="like button"
                />
              </div>
              <div className="cart-item-details">
                <h3>{product.name}</h3>
                <p>{product.price} DH</p>

                <button className="btn btn-danger" onClick={navigateToBuy}>Acheter</button>

                <button className="btn btn-danger" onClick={() => handleRemoveFromCart(product._id)}>
                  Annuler
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No products in cart yet.</p>
        )}
      </div>
    </div>
  );
};

export default Cart;
