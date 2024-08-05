import React, { useState, useContext, useCallback, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import placeholderIcon from "../assets/placeholder.png"; // Import the image
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete icon
import InputAdornment from '@mui/material/InputAdornment';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";

const icon = L.icon({
  iconUrl: placeholderIcon, // Use the imported image
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

const AddProductForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productIsDon, setProductIsDon] = useState(true);
  const [productCountry, setProductCountry] = useState('');
  const [productCity, setProductCity] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [productEmail, setProductEmail] = useState('');
  const [productPhone, setProductPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [donation, setDonation] = useState(false);
  const [productCondition, setProductCondition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mobilePrefix, setMobilePrefix] = useState('+212'); // Default prefix can be set as needed
  const [errors, setErrors] = useState({
    productName: '',
    productCategory: '',
    productDescription: '',
    productPrice: '',
    productCountry: '',
    productCondition: '',
    productImages: '',
    email: '',
    phone : '',
  });

  const [customCategory, setCustomCategory] = useState('');

  const [selectPosition, setSelectPosition] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [listPlace, setListPlace] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    'Immobilier',
    'Vehicules',
    'Telephones',
    'Ordinateurs',
    'Motos',
    'Vetements',
    'Livres',
    'Electromenagers',
    'Astuces Maisons',
    'Autres',
  ];

  const validateStep = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (activeStep === 0) {
      if (!productName) {
        newErrors.productName = 'Veuillez remplir le nom du produit';
        isValid = false;
      } else {
        newErrors.productName = '';
      }

      if (!productCategory) {
        newErrors.productCategory = 'Veuillez sélectionner une catégorie';
        isValid = false;
      } else if (productCategory === 'Autres' && !customCategory) {
        newErrors.productCategory = 'Veuillez remplir la catégorie personnalisée';
        isValid = false;
      } else {
        newErrors.productCategory = '';
      }

      if (!productDescription) {
        newErrors.productDescription = 'Veuillez remplir la description du produit';
        isValid = false;
      } else {
        newErrors.productDescription = '';
      }
    } else if (activeStep === 1) {
      if (productImages.length === 0) {
        newErrors.productImages = 'Veuillez télécharger au moins une image';
        isValid = false;
      } else {
        newErrors.productImages = '';
      }
    } else if (activeStep === 2) {
      if (!productCondition) {
        newErrors.productCondition = 'Veuillez sélectionner l\'état du produit';
        isValid = false;
      } else {
        newErrors.productCondition = '';
      }
    } else if (activeStep === 3) {
      if (!donation && !productPrice) {
        newErrors.productPrice = 'Veuillez remplir le prix du produit';
        isValid = false;
      } else {
        newErrors.productPrice = '';
      }
    } else if (activeStep === 4) {
      if (!productCountry || !productCity) {
        newErrors.productCountry = 'Veuillez sélectionner un pays et une ville';
        isValid = false;
      } else if (productCountry !== 'France' && productCountry !== 'Morocco' && productCountry !== 'Maroc') {
        newErrors.productCountry = 'Le service n\'est pas disponible dans ce pays';
        setErrorMessage('Le service n\'est pas disponible dans ce pays');
        isValid = false;
      } else {
        newErrors.productCountry = '';
        setErrorMessage('');
      }
    } else if (activeStep === 6) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Veuillez remplir un email valide';
        isValid = false;
      } else {
        newErrors.email = '';
      }

      const phoneRegex = /^\d{9,10}$/;
      if (!phone || !phoneRegex.test(phone)) {
        newErrors.phone = 'Veuillez remplir un numéro de téléphone valide (9 ou 10 chiffres)';
        isValid = false;
      } else {
        newErrors.phone = '';
      }
    }


    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = async () => {
    if (validateStep()) {
      await handleAddProduct();
      navigate('/store');
    }
  };

  const handleAddProduct = async () => {
    if (!user) {
      console.error('User is not authenticated');
      return;
    }

    const userId = user._id;
    const formData = new FormData();
    formData.append('id', new Date().getTime().toString());
    formData.append('name', productName);
    formData.append('category', productCategory === 'Autres' ? 'Autres' : productCategory);
    formData.append('customCategory', productCategory === 'Autres' ? customCategory : '');
    formData.append('description', productDescription);
    formData.append('price', donation ? 0 : parseFloat(productPrice));
    formData.append('donation', donation);
    formData.append('isDon', productIsDon);
    formData.append('country', productCountry);
    formData.append('city', productCity);
    formData.append('userId', userId);
    formData.append('condition', productCondition);
    formData.append('email', email);
    formData.append('phone', `${mobilePrefix} ${phone}`);

    for (let i = 0; i < productImages.length; i++) {
      formData.append('images', productImages[i]);
    }
    try {
      const response = await fetch('http://localhost:5001/add-product', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.status === 'ok') {
        console.log('Product added successfully:', data);
        navigate('/Home');
      } else {
        console.error('Error adding product:', data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setErrorMessage('An error occurred while adding the product.');
    }
  };

  const steps = [
    'Détails du produit',
    'Ajout de photos',
    'État du produit',
    'Définir un prix',
    'Informations additionnelles',
    'Autres informations ?',
    'Coordonnées',
    'Révision et soumission'
  ];
  

  const fetchPlaces = useCallback(async (query) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        q: query,
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
  }, []);

  const handlePlaceSelect = (place) => {
    setSelectPosition({
      lat: place.lat,
      lon: place.lon,
      display_name: place.display_name,
    });
    setProductCountry(place.address.country);
    setProductCity(place.address.city || place.address.town || place.address.village);
    setSearchText(place.display_name);
    setListPlace([]);
  
    // Clear the error message when a location is selected
    if (place.address.country === 'France' || place.address.country === 'Morocco') {
      setErrorMessage('');
    } else {
      setErrorMessage('Le service n\'est pas disponible dans ce pays');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value.length > 3) {
      fetchPlaces(value);
    } else {
      setListPlace([]);
    }
  };
  const handleImageUpload = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'koulchikayn'); // Replace with your Cloudinary preset
  
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/ds4qhqy8k/image/upload', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      console.log(data); // Inspect the response data
      if (response.ok) {
        console.log('Image uploaded successfully:', data.url);
        // Update productImages state with the uploaded image URL
        setProductImages(prevImages => [...prevImages, data.secure_url]);
      } else {
        console.error('Upload failed:', data.error.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  
  
  const handleRemoveImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };
  const renderSummary = () => (
    <div>
      <Typography variant="h6" gutterBottom>
        Résumé de votre produit
      </Typography>
      <Typography><strong>Titre :</strong> {productName}</Typography>
      <Typography><strong>Catégorie :</strong> {productCategory === 'Autres' ? customCategory : productCategory}</Typography>
      <Typography><strong>Description :</strong> {productDescription}</Typography>
      <Typography><strong>État :</strong> {productCondition}</Typography>
      <Typography><strong>Prix :</strong> {donation ? 'Gratuit' : productPrice} {donation ? '' : '€'}</Typography>
      <Typography><strong>Pays :</strong> {productCountry}</Typography>
      <Typography><strong>Ville :</strong> {productCity}</Typography>
      <Typography><strong>Email :</strong> {email}</Typography>
      <Typography><strong>Téléphone :</strong> {phone}</Typography>
      <Box mt={2}>
        {productImages.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Images :
            </Typography>
            {productImages.map((image, index) => (
              <img
                key={index}
                src={URL.createObjectURL(image)}
                alt={`Preview ${index}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '10px' }}
              />
            ))}
          </Box>
        )}
      </Box>
    </div>
  );

  return (
    <Box sx={{ width: '70%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div>
        {activeStep === steps.length ? (
          <Typography variant="h5" gutterBottom>
            Merci! Votre produit a été ajouté avec succès.
          </Typography>
        ) : (
          <div>
            {activeStep === 0 && (
              <div>
                <TextField
                  label="Nom du produit"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  error={Boolean(errors.productName)}
                  helperText={errors.productName}
                />
                <TextField
                  select
                  label="Catégorie"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  error={Boolean(errors.productCategory)}
                  helperText={errors.productCategory}
                >
                  {categories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                {productCategory === 'Autres' && (
                  <TextField
                    label="Catégorie personnalisée"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    error={Boolean(errors.customCategory)}
                    helperText={errors.customCategory}
                  />
                )}
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  error={Boolean(errors.productDescription)}
                  helperText={errors.productDescription}
                />
              </div>
            )}
{activeStep === 1 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <input
      accept="image/*"
      id="product-images"
      multiple
      type="file"
      style={{ display: 'none' }}
      onChange={(e) => {
        const files = Array.from(e.target.files);
        setProductImages((prevImages) => [...prevImages, ...files]);
        files.forEach(file => handleImageUpload(file));
      }}
    />
    <label htmlFor="product-images">
      <Button variant="contained" component="span">
        Télécharger des photos
      </Button>
    </label>
    <Box mt={2}>
      {productImages.length > 0 && (
        <Box>
          {productImages.map((image, index) => (
            <Box key={index} sx={{ position: 'relative', display: 'inline-block', mr: 2 }}>
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <IconButton
                onClick={() => handleRemoveImage(index)}
                sx={{ position: 'absolute', top: 0, right: 0, color: theme.palette.error.main }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      {errors.productImages && (
        <Typography color="error" variant="body2">
          {errors.productImages}
        </Typography>
      )}
    </Box>
  </Box>
)}

            {activeStep === 2 && (
              <div>
                <TextField
                  select
                  label="État du produit"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={productCondition}
                  onChange={(e) => setProductCondition(e.target.value)}
                  error={Boolean(errors.productCondition)}
                  helperText={errors.productCondition}
                >
                <MenuItem value="" disabled>Select condition</MenuItem>
                <MenuItem value="Neuf">Neuf</MenuItem>
                <MenuItem value="Comme neuf">Comme neuf</MenuItem>
                <MenuItem value="Bon état">Bon état</MenuItem>
                <MenuItem value="Acceptable">Acceptable</MenuItem>
                <MenuItem value="Pour pièces">Pour pièces</MenuItem>
                </TextField>
              </div>
            )}
            {activeStep === 3 && (
              <div>
                <Switch
                  checked={donation}
                  onChange={() => setDonation(!donation)}
                />
                {donation ? (
                  <Typography>Ce produit est un don.</Typography>
                ) : (
                  <TextField
                    label="Prix"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    error={Boolean(errors.productPrice)}
                    helperText={errors.productPrice}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                    }}
                  />
                )}
              </div>
            )}
{activeStep === 4 && (
  <div>
    <TextField
      label="Rechercher un endroit"
      variant="outlined"
      fullWidth
      margin="normal"
      value={searchText}
      onChange={handleSearch}
    />
    {loading && <Typography>Recherche en cours...</Typography>}
    {error && <Typography color="error">{error}</Typography>}
    {errorMessage && <Typography color="error">{errorMessage}</Typography>}
    <List>
      {listPlace.map((place) => (
        <ListItem
          button
          key={place.place_id}
          onClick={() => handlePlaceSelect(place)}
        >
          <ListItemIcon>
            <img src={placeholderIcon} alt="location icon" width="24" height="24" />
          </ListItemIcon>
          <ListItemText primary={place.display_name} />
        </ListItem>
      ))}
    </List>
    <MapContainer
      center={initialPosition}
      zoom={5}
      style={{ height: "400px", marginTop: "1rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      {selectPosition && (
        <Marker
          position={[selectPosition.lat, selectPosition.lon]}
          icon={icon}
        >
          <Popup>{selectPosition.display_name}</Popup>
        </Marker>
      )}
      <ResetCenterView selectPosition={selectPosition} />
    </MapContainer>
  </div>
)}
{activeStep === 5 && (
              <div>
                <TextField
                  label="Autres informations"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              </div>
            )}
            {activeStep === 6 && (
              <div>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
                {/* Phone  */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <TextField
                select
                label="Préfixe"
                value={mobilePrefix}
                onChange={(e) => setPhone(e.target.value)}
                variant="outlined"
                margin="normal"
                style={{ marginRight: '1rem', width: '150px' }}
                error={Boolean(errors.phone)}
              >
                <MenuItem value="+212">+212</MenuItem>
                <MenuItem value="+33">+33</MenuItem>
                {/* Ajoutez d'autres préfixes ici */}
              </TextField>
              <TextField
                label="Numéro de téléphone"
                variant="outlined"
                fullWidth
                margin="normal"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
              />
            </div>
            {/* End Phone */}
              </div>
            )}
                        {activeStep === steps.length - 1 && renderSummary()} {/* Render the summary on the final step */}
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Retour
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleFinish}>Terminer</Button>
              ) : (
                <Button onClick={handleNext}>Suivant</Button>
              )}
            </Box>
          </div>
        )}
      </div>
    </Box>
  );
};

export default AddProductForm;
