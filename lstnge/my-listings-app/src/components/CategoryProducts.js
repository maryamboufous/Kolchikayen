// src/components/CategoryProducts.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import './CategoryProducts.css'; // Create and style this CSS file as needed

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/category/${category}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products by category:', error);
      }
    };

    fetchProductsByCategory();
  }, [category]);

  return (
    <div className="category-products">
      <h1>Produits en {category}</h1>
      <div className="product-list">
        {products.map((product) => (
          <div key={product._id} className="product-item">
            <Link to={`/Product/${product._id}`} className="btntoprod">

            <img src={`http://localhost:5001/${product.images[0]}`} alt={product.name} />
              <h3>{product.name}</h3>
            <p>{product.price} DH</p>
            <p>{product.description}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProducts;
