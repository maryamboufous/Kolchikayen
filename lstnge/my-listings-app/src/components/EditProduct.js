import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Switch from '@mui/material/Switch';
import './AddProductForm.css';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [product, setProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    productName: '',
    productCategory: '',
    customCategory: '', // New field for custom categories
    productDescription: '',
    productCondition: '', // New field for product condition
    productPrice: '',
    productIsAvailable: true,
    productCountry: 'Morocco',
    productEmail: '', // New field for email
    productPhone: '', // New field for phone
    productImages: []
  });
  const [donation, setDonation] = useState(false); // Donation switch state
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
          setFormValues({
            productName: data.product.name,
            productCategory: data.product.category,
            customCategory: data.product.customCategory || '', // Handle optional custom category
            productDescription: data.product.description,
            productCondition: data.product.condition || '', // Handle optional condition
            productPrice: data.product.price,
            productIsAvailable: data.product.isAvailable,
            productCountry: data.product.country,
            productEmail: data.product.email || '', // Handle optional email
            productPhone: data.product.phone || '', // Handle optional phone
            productImages: data.product.images
          });
          setDonation(data.product.price === 0); // Set donation switch based on price
        } else {
          console.error('Failed to fetch product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDonationChange = (e) => {
    setDonation(e.target.checked);
    setFormValues(prevValues => ({
      ...prevValues,
      productPrice: e.target.checked ? 0 : prevValues.productPrice
    }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error('User is not authenticated');
      return;
    }

    const userId = user._id;
    const formData = new FormData();
    formData.append('id', productId);
    formData.append('name', formValues.productName);
    formData.append('category', formValues.productCategory);
    formData.append('customCategory', formValues.customCategory); // Append custom category
    formData.append('description', formValues.productDescription);
    formData.append('condition', formValues.productCondition); // Append condition
    formData.append('price', parseFloat(formValues.productPrice));
    formData.append('isAvailable', formValues.productIsAvailable);
    formData.append('country', formValues.productCountry);
    formData.append('email', formValues.productEmail); // Append email
    formData.append('phone', formValues.productPhone); // Append phone
    formData.append('userId', userId);

    for (let i = 0; i < formValues.productImages.length; i++) {
      formData.append('images', formValues.productImages[i]);
    }

    try {
      const response = await fetch(`http://localhost:5001/edit-product/${productId}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'ok') {
        console.log('Product updated successfully:', data);
        navigate('/store');
      } else {
        console.error('Error updating product:', data.data);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <form className="add-product-form" onSubmit={handleUpdateProduct}>
      <label>Product Name:</label>
      <input
        type="text"
        name="productName"
        value={formValues.productName}
        onChange={handleChange}
      />

      <label>Product Category:</label>
      <select
        name="productCategory"
        value={formValues.productCategory}
        onChange={handleChange}
      >
        <option value="" disabled>Select a category</option>
        <option value="Immobilier">Immobilier</option>
        <option value="Vehicules">Vehicules</option>
        <option value="Telephones">Telephones</option>
        <option value="Ordinateurs">Ordinateurs</option>
        <option value="Motos">Motos</option>
        <option value="Vetements">Vetements</option>
        <option value="Autres">Autres</option>
      </select>

      {formValues.productCategory === 'Autres' && (
        <>
          <label>Custom Category:</label>
          <input
            type="text"
            name="customCategory"
            value={formValues.customCategory}
            onChange={handleChange}
          />
        </>
      )}

      <label>Product Description:</label>
      <textarea
        name="productDescription"
        value={formValues.productDescription}
        onChange={handleChange}
      />

      <label>Product Condition:</label>
      <input
        type="text"
        name="productCondition"
        value={formValues.productCondition}
        onChange={handleChange}
      />

      <label>Je fais un don:</label>
      <Switch
        checked={donation}
        onChange={handleDonationChange}
      />

      <label>Product Price:</label>
      <input
        type="number"
        name="productPrice"
        value={formValues.productPrice}
        onChange={handleChange}
        disabled={donation}
      />

      <label>Available:</label>
      <input
        type="checkbox"
        name="productIsAvailable"
        checked={formValues.productIsAvailable}
        onChange={handleChange}
      />

      <label>Country:</label>
      <select
        name="productCountry"
        value={formValues.productCountry}
        onChange={handleChange}
      >
        <option value="Morocco">Morocco</option>
        <option value="France">France</option>
      </select>

      <label>Email:</label>
      <input
        type="email"
        name="productEmail"
        value={formValues.productEmail}
        onChange={handleChange}
      />

      <label>Phone:</label>
      <input
        type="tel"
        name="productPhone"
        value={formValues.productPhone}
        onChange={handleChange}
      />

      <label>Product Images:</label>
      <input
        type="file"
        name="productImages"
        multiple
        onChange={(e) => setFormValues(prevValues => ({
          ...prevValues,
          productImages: [...e.target.files]
        }))}
      />

      <button type="submit">Mettre à jour</button>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </form>
  );
};

export default EditProduct;
