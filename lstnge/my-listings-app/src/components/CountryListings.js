import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import './Listings.css';
import heartEmpty from '../assets/heart_empty.png';
import heartLike from '../assets/like.png';
import { Link } from 'react-router-dom';

const CountryListings = () => {
  const { country } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/country/${country}`);
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [country]);

  return (
    <div className="listings">
      <h1>Liste des Produits de {country}</h1>
      <div className="listing-items">
        {products.length === 0 ? (
          <p>Aucun produit trouvé pour ce produit.</p>
        ) : (
          products.map((product) => (
            <div className="listing-item" key={product._id}>
              <Link to={`/Product/${product._id}`} className="btntoprod">
                <img src={product.images[0]} alt={product.name} />
                <div className="listing-details">
                  <h3>{product.name}</h3>
                  <p>{product.price} €</p>
                  <p>
                    <small className="text-muted">Publié par {product.userId ? product.userId.name : 'Unknown'}</small>
                  </p>
                  <p>
                    <small className="text-muted">Ajouté il y a {moment(product.createdAt).fromNow()}</small>
                  </p>
                </div>
              </Link>
              <div className="heart-icon">
                <img src={heartEmpty} alt="like button" />
              </div>
              <button>Ajouter au panier:</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CountryListings;
