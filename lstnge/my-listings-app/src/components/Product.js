import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useParams, useNavigate } from 'react-router-dom';
import './Product.css';
import userimg from '../assets/user-img.webp';
import whatsappimg from '../assets/whatsapp.svg';
import messageimg from '../assets/message.svg';
import phoneimg from '../assets/phone.svg';
import heartEmpty from '../assets/heart_empty.png';
import heartLike from '../assets/like.png';

const Product = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const { user, cartItemCount, setCartItemCount, likedProducts, setLikedProducts } = useContext(UserContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
        } else {
          console.error('Failed to fetch product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  const navigateToProfile = (userId) => {
    // navigate(`/profile/${userId}`);
    navigate('');
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
        console.log('Product added to cart successfully');
        setCartItemCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const navigateToBuy = () => {
    navigate(`/Buy/${productId}`);
  };

  const toggleLike = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }

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

  if (!product) {
    return <div>En cours...</div>;
  }

  return (
    <div className="Product_container">
      <div className="product-images">
        {product.images.map((image, index) => (
          <img key={index} src={image} alt={`Product ${index}`} />
        ))}
      </div>
      <div className="first-informations">
        <div className="title-box">
          <p className="title">{product.name}</p>
          <p className='title'>{product.country}</p>
        </div>
        <div className="price">
          <p>{product.price} €</p>
        </div>
        <div className="title-box">
          <p className="title">{product.category}</p>
        </div>
      </div>
      <div className="seller-informations">
        <div className="seller-img">
          By {product.userId.name}
          <img
            onClick={() => navigateToProfile(product.userId._id)}
            src={product.userId.profileImage || userimg}
            alt="User Profile"
          />
        </div>
        <div className="contact-info">
          <a href="#"><img src={whatsappimg} alt="WhatsApp" /></a>
          <a href="#"><img src={messageimg} alt="Message" /></a>
          <a href="#"><img src={phoneimg} alt="Phone" /></a>
        </div>
        <button className='btn btn-info' onClick={() => addToCart(product._id)}>
          Ajouter au panier
        </button>
        <button className="btn btn-danger" onClick={navigateToBuy}>Acheter</button>
        <div className="heart-icon" onClick={() => toggleLike(product._id)}>
          <img src={likedProducts.includes(product._id) ? heartLike : heartEmpty} alt="like button" />
        </div>
      </div>
      <div className="third-informations">
        <h1>Description</h1>
        <p>{product.description}</p>
      </div>
    </div>
  );
};

export default Product;
