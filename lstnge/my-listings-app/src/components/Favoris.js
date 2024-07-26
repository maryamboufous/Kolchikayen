import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import heartEmpty from '../assets/heart_empty.png';
import heartLike from '../assets/like.png';
import './Favoris.css';

const Favoris = () => {
  const { user, cartItemCount, setCartItemCount, likedProducts, setLikedProducts } = useContext(UserContext);
  const [likedProductsData, setLikedProductsData] = useState([]);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        const response = await fetch(`http://localhost:5001/user/${user._id}/liked-products?complete=true`);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched liked products data:", data);
          setLikedProductsData(data || []);
        } else {
          console.error('Failed to fetch liked products');
        }
      } catch (error) {
        console.error('Error fetching liked products:', error);
      }
    };

    if (user) {
      fetchLikedProducts();
    }
  }, [user]);

  const handleUnlike = async (productId) => {
    if (!productId) {
      console.error("Product ID is null or undefined");
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/unlike-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id, productId }),
      });

      if (response.ok) {
        setLikedProductsData((prev) => prev.filter((product) => product?._id !== productId));
        setLikedProducts((prev) => prev.filter((id) => id !== productId));
      } else {
        console.error('Failed to unlike product');
      }
    } catch (error) {
      console.error('Error unliking product:', error);
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
        console.log('Product added to cart successfully');
        setCartItemCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="favoris">
      <h1>Produits Favoris</h1>
      <div className="favoris-items">
        {likedProductsData.length > 0 ? (
          likedProductsData.map((product) => {
            if (!product) {
              console.error("Product is null or undefined", product);
              return null;
            }

            return (
              <div className="favoris-item" key={product._id}>
                <Link to={`/Product/${product._id}`} className="btntoprod">
                  <img
                    src={`http://localhost:5001/product-image/${product._id}/0`} 
                    alt={product.name}
                    className="favoris-item-image"
                  />
                  <div className="favoris-item-details">
                    <h3>{product.name}</h3>
                    <p>{product.price} DH</p>
                    <p>
                      <small className="text-muted">Publié par {product.userId ? product.userId.name : 'Unknown'}</small>
                    </p>
                  </div>
                </Link>
                <div className="heart-icon" onClick={() => handleUnlike(product._id)}>
                  <img src={heartLike} alt="like button" />
                </div>
                <button className="btn btn-info" onClick={() => addToCart(product._id)}>
                  Ajouter au panier
                </button>
              </div>
            );
          })
        ) : (
          <p>No favorite products found.</p>
        )}
      </div>
    </div>
  );
};

export default Favoris;
