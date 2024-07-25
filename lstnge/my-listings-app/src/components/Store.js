import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import './Store.css';

const Store = () => {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/user/${user._id}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user]);

  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5001/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(product => product._id !== productId));
      } else {
        console.error('Error deleting product:', await response.json());
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="store">
      <h1>My Products</h1>
      <div className="product-list">
        {products.map((product) => (
          <div className="product-item" key={product._id}>
          <Link to={`/Product/${product._id}`} className="btntoprod">
            <img src={`http://localhost:5001/${product.images[0]}`} alt={product.name} />
            </Link>
            <div className="product-details">
              <h3>{product.name}</h3>
              <p>{product.price} DH</p>
              <button className="delete-btn" onClick={() => deleteProduct(product._id)}>Delete</button>
              <Link to={`/edit-product/${product._id}`} className="edit-btn">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;
