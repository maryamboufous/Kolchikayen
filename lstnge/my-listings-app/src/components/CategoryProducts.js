import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CategoryProducts.css'; // Create and style this CSS file as needed

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

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

  return (
    <div className="category-products">
      <h1>Produits en {category}</h1>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="product-item">
              <Link to={`/Product/${product._id}`} className="btntoprod">
                <img src={`http://localhost:5001/product-image/${product._id}/0`} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.price} DH</p>
                <p>{product.description}</p>
              </Link>
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
