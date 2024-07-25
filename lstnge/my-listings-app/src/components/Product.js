import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css'; // Correct path for Swiper styles
import './Product.css';
import userimg from '../assets/user-img.webp';
import whatsappimg from '../assets/whatsapp.svg';
import messageimg from '../assets/message.svg';
import phoneimg from '../assets/phone.svg';

const Product = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const { user,cartItemCount, setCartItemCount } = useContext(UserContext);


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
    navigate(`/Profile/${userId}`);
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
        setCartItemCount((prevCount) => prevCount + 1); // Increment cart item count
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const navigateToBuy =() =>{
    navigate('/Buy');
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="Product_container">
      <div className="Product_slider">
        <Swiper spaceBetween={50} slidesPerView={1}>
          {product.images.map((image, index) => (
            <SwiperSlide key={index}>
              <img src={`http://localhost:5001/${image}`} alt={`Product ${index + 1}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="first-informations">
        <div className="title-box">
          <p className="title">{product.name}</p>
        </div>
        <div className="price">
          <p>{product.price} DH</p>
        </div>
      </div>
      <div className="seller-informations">
        <div className="seller-img">
          By {product.userId.name}
          <img
            onClick={() => navigateToProfile(product.userId._id)}
            src={userimg}
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

      </div>
      <div className="third-informations">
        <h1>Description</h1>
        <p>{product.description}</p>
      </div>
    </div>
  );
};

export default Product;
