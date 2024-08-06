// Buy.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Buy.css';

const Buy = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

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

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="buy-container">
      <h1>Veuillez contacter le vendeur pour acheter, voici lES informations dont vous aurez besoin</h1>
      <div className="product-details">      <h4>{product.name}</h4>

        <p><strong>Description:</strong> {product.description}</p>
        <p><strong>Price:</strong> ${product.price}</p>
        <p><strong>Condition:</strong> {product.condition}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Email:</strong> {product.email}</p>
        <p><strong>Phone:</strong> {product.phone}</p>
        <div className="product-images">
          {product.images.map((image, index) => (
            <img key={index} src={image} alt={`Product ${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Buy;
