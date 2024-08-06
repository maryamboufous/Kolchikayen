import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import moment from 'moment';
import heartEmpty from '../assets/heart_empty.png';
import heartLike from '../assets/like.png';
import './CategoryProducts.css'; // Ensure this CSS file is created and updated

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const { user, cartItemCount, setCartItemCount, likedProducts, setLikedProducts } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/category/${category}`);
        const result = await response.json();
        
        if (result.status === 'ok' && Array.isArray(result.products)) {
          setProducts(result.products);
        } else {
          console.error('Unexpected data format:', result);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products by category:', error);
        setProducts([]);
      }
    };

    fetchProductsByCategory();
  }, [category]);

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
    <div className="category-products">
      <h1>Produits en {category}</h1>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="product-item">
              <Link to={`/Product/${product._id}`} className="btntoprod">
                <img src={`http://localhost:5001/product-image/${product._id}/0`} alt={product.name} />
                <div className="listing-details">
                  <h3>{product.name}</h3>
                  <p>{product.price} DH</p>
                  <p>
                    <small className="text-muted">Publié par {product.userId ? product.userId.name : 'Unknown'}</small>
                  </p>
                  <p>
                    <small className="text-muted">Ajouté il y a {moment(product.createdAt).fromNow()}</small>
                  </p>
                </div>
              </Link>
              <div className="heart-icon" onClick={() => toggleLike(product._id)}>
                <img src={likedProducts.includes(product._id) ? heartLike : heartEmpty} alt="like button" />
              </div>
              <button onClick={() => addToCart(product._id)}>Add to Cart</button>
            </div>
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
