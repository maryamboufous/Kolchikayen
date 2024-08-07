import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete icon
import InputAdornment from '@mui/material/InputAdornment';
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import placeholderIcon from "../assets/placeholder.png";
import { useTheme } from '@mui/material/styles';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";

const icon = L.icon({
  iconUrl: placeholderIcon,
  iconSize: [38, 38],
});

const initialPosition = [51.505, -0.09];

function ResetCenterView({ selectPosition }) {
  const map = useMap();

  useEffect(() => {
    if (selectPosition) {
      map.setView(
        L.latLng(selectPosition.lat, selectPosition.lon),
        map.getZoom(),
        { animate: true }
      );
    }
  }, [selectPosition, map]);

  return null;
}

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const [product, setProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    productName: '',
    productCategory: '',
    customCategory: '',
    productDescription: '',
    productCondition: '',
    productPrice: '',
    productCountry: '',
    productCity: '',
    productEmail: '',
    productPhone: '',
    productImages: []
  });
  const [donation, setDonation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectPosition, setSelectPosition] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [listPlace, setListPlace] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobilePrefix, setMobilePrefix] = useState('+212'); // Default prefix

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/${productId}`);
        const data = await response.json();
        if (data.status === 'ok') {
          const productData = data.product;
          setProduct(productData);
          const [prefix, ...phoneParts] = productData.phone.split(' ');
          setMobilePrefix(prefix || '+212'); // Default to +212 if no prefix
          setFormValues({
            productName: productData.name,
            productCategory: productData.category,
            customCategory: productData.customCategory || '',
            productDescription: productData.description,
            productCondition: productData.condition || '',
            productPrice: productData.price,
            productCountry: productData.address?.country || '',
            productCity: productData.address?.city || '',
            productEmail: productData.email || '',
            productPhone: productData.phone ? productData.phone.split(' ')[1] : '',
                        productImages: productData.images || []
            });
            setDonation(productData.donation || false);
            setSearchText(`${productData.address?.city || ''}, ${productData.address?.country || ''}`);
            if (productData.phone) {
              const phoneParts = productData.phone.split(' ');
              setMobilePrefix(phoneParts[0] || '+212'); // Default to +212 if no prefix is found
              setFormValues(prevValues => ({
                ...prevValues,
                productPhone: phoneParts.slice(1).join(' ') || ''
              }));
            }
          } else {
            setErrorMessage(data.message);
          }
        } catch (error) {
          setErrorMessage('An error occurred while fetching the product details.');
        }
      };
    
      fetchProduct();
    }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    setFormValues({ ...formValues, productImages: [...formValues.productImages, ...Array.from(files)] });
  };

  const handleReplaceImage = (event, index) => {
    const files = event.target.files;
    const updatedImages = [...formValues.productImages];
    updatedImages[index] = files[0];
    setFormValues({ ...formValues, productImages: updatedImages });
  };

  const handleRemoveImage = (index) => {
    setFormValues({ ...formValues, productImCartes: formValues.productImages.filter((_, i) => i !== index) });
  };

  const handlePlaceSelect = (place) => {
    setSelectPosition({
      lat: place.lat,
      lon: place.lon,
      display_name: place.display_name,
    });
    setFormValues({
      ...formValues,
      productCountry: place.address.country || '',
      productCity: place.address.city || place.address.town || place.address.village || ''
    });
    setSearchText(place.display_name);
    setListPlace([]);
  
    if (place.address.country === 'France' || place.address.country === 'Morocco'|| place.address.country === 'Maroc') {
      setErrorMessage('');
    } else {
      setErrorMessage('Le service n\'est pas disponible dans ce pays');
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value.length > 3) {
      setLoading(true);
      setError("");
      try {
        const params = {
          q: value,
          format: "json",
          addressdetails: 1,
          polygon_geojson: 0,
        };
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${NOMINATIM_BASE_URL}${queryString}`);
        if (!response.ok) {
          throw new Error("Une erreur s'est produite");
        }
        const data = await response.json();
        setListPlace(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setListPlace([]);
    }
  };

  const handleUpdateProduct = async () => {
    if (!user) {
      console.error('Vous devew vous authentifier !');
      return;
    }
  
    const userId = user._id;
    const formData = new FormData();
    formData.append('name', formValues.productName);
    formData.append('category', formValues.productCategory === 'Autres' ? 'Autres' : formValues.productCategory);
    formData.append('customCategory', formValues.productCategory === 'Autres' ? formValues.customCategory : '');
    formData.append('description', formValues.productDescription);
    formData.append('price', donation ? 0 : parseFloat(formValues.productPrice));
    formData.append('donation', donation);
    formData.append('country', formValues.productCountry);
    formData.append('city', formValues.productCity);
    formData.append('userId', userId);
    formData.append('condition', formValues.productCondition);
    formData.append('email', formValues.productEmail);
    formData.append('phone', `${mobilePrefix} ${formValues.productPhone}`);  
    // Convert existing images to JSON string
    const existingImagesJson = JSON.stringify(formValues.productImages.filter(image => typeof image === 'string'));
    formData.append('existingImages', existingImagesJson);
  
    formValues.productImages.forEach(image => {
      if (image instanceof File) {
        formData.append('images', image, image.name);
      }
    });
  
    try {
      const response = await fetch(`http://localhost:5001/edit-product/${productId}`, {
        method: 'PUT',
        body: formData,
      });
  
      const data = await response.json();
      if (data.status === 'ok') {
        navigate('/store', { state: { refresh: true } }); // Notify the store component
      } else {
        console.error('Error updating product:', data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('An error occurred while updating the product:', error);
      setErrorMessage('An error occurred while updating the product.');
    }
  };
  
  return (
    <Box sx={{ width: '70%' }}>
      {product && (
        <div>
          <TextField
            label="Nom du produit"
            variant="outlined"
            fullWidth
            margin="normal"
            name="productName"
            value={formValues.productName}
            onChange={handleInputChange}
          />
          <TextField
            select
            label="Catégorie"
            variant="outlined"
            fullWidth
            margin="normal"
            name="productCategory"
            value={formValues.productCategory}
            onChange={handleInputChange}
          >
            <MenuItem value="Immobilier">Immobilier</MenuItem>
            <MenuItem value="Vehicules">Véhicules</MenuItem>
            <MenuItem value="Telephone">Telephones</MenuItem>
            <MenuItem value="Ordinateurs">Ordinateurs</MenuItem>
            <MenuItem value="Motos">Motos</MenuItem>
            <MenuItem value="Livres">Livres</MenuItem>
            <MenuItem value="Vetements">Vêtements</MenuItem>
            <MenuItem value="Electromenagers">Electromenagers</MenuItem>
            <MenuItem value="Astuces Maison">Astuces Maison</MenuItem>
            <MenuItem value="Autres">Autres</MenuItem>
          </TextField>
          {formValues.productCategory === 'Autres' && (
            <TextField
              label="Catégorie personnalisée"
              variant="outlined"
              fullWidth
              margin="normal"
              name="customCategory"
              value={formValues.customCategory}
              onChange={handleInputChange}
            />
          )}
          <TextField
            label="Déscription"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            name="productDescription"
            value={formValues.productDescription}
            onChange={handleInputChange}
          />
          <TextField
            select
            label="Condition"
            variant="outlined"
            fullWidth
            margin="normal"
            name="productCondition"
            value={formValues.productCondition}
            onChange={handleInputChange}
          >
                <MenuItem value="Neuf">Neuf</MenuItem>
                <MenuItem value="Comme neuf">Comme neuf</MenuItem>
                <MenuItem value="Bon état">Bon état</MenuItem>
                <MenuItem value="Acceptable">Acceptable</MenuItem>
                <MenuItem value="Pour pièces">Pour pièces</MenuItem>
          </TextField>
          <Switch
            checked={donation}
            onChange={() => setDonation(!donation)}
            name="donation"
            color="primary"
          />
          <label>Je fais un don</label>
          <TextField
            label="Prix"
            variant="outlined"
            fullWidth
            margin="normal"
            name="productPrice"
            type="number"
            value={donation ? '' : formValues.productPrice}
            onChange={handleInputChange}
            disabled={donation}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            name="productEmail"
            value={formValues.productEmail}
            onChange={handleInputChange}
          />
<TextField
  label="Numéro de téléphone"
  variant="outlined"
  fullWidth
  margin="normal"
  name="productPhone"
  value={formValues.productPhone}
  onChange={handleInputChange}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <TextField
          select
          value={mobilePrefix}
          onChange={(e) => setMobilePrefix(e.target.value)}
          variant="standard"
          sx={{ width: 60, border: 'none', '& fieldset': { border: 'none' } }}
        >
          <MenuItem value="+212">+212</MenuItem>
          <MenuItem value="+33">+33</MenuItem>
        </TextField>
      </InputAdornment>
    ),
  }}
/>
          <TextField
            label="Pays et Ville"
            variant="outlined"
            fullWidth
            margin="normal"
            name="searchText"
            value={searchText}
            onChange={handleSearch}
          />
          {listPlace.length > 0 && (
            <ul>
              {listPlace.map((item) => (
                <li key={item.place_id} onClick={() => handlePlaceSelect(item)}>
                  {item.display_name}
                </li>
              ))}
            </ul>
          )}
          <MapContainer
            center={initialPosition}
            zoom={13}
            style={{ height: "400px", marginBottom: "20px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {selectPosition && (
              <Marker position={[selectPosition.lat, selectPosition.lon]} icon={icon}>
                <Popup>{selectPosition.display_name}</Popup>
              </Marker>
            )}
            <ResetCenterView selectPosition={selectPosition} />
          </MapContainer>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <div>
            <label>Ajouter des images</label>
            <input type="file" multiple onChange={handleImageUpload} />
            <div>
              {formValues.productImages.map((image, index) => (
                <div key={index}>
                  {typeof image === 'string' ? (
                    <img src={image} alt={`product-${index}`} style={{ width: 100, height: 100 }} />
                  ) : (
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`product-${index}`}
                      style={{ width: 100, height: 100 }}
                    />
                  )}
                  <input type="file" onChange={(e) => handleReplaceImage(e, index)} />
                  <IconButton onClick={() => handleRemoveImage(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
          <Button variant="contained" color="primary" onClick={handleUpdateProduct}>
            Modifier le produit
          </Button>
        </div>
      )}
    </Box>
  );
};

export default EditProduct;
