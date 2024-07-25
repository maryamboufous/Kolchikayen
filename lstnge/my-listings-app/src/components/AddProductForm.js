import React, { useState, useContext } from 'react';
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
import { useTheme } from '@mui/material/styles';

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
  const [productCountry, setProductCountry] = useState('Morocco');
  const [productImages, setProductImages] = useState([]);
  const [productEmail, setProductEmail] = useState('');
  const [productPhone, setProductPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [donation, setDonation] = useState(false);
  const [productCondition, setProductCondition] = useState('');
  // ///////////////
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
//////////////////////////////////
  const [errors, setErrors] = useState({
    productName: '',
    productCategory: '',
    productDescription: '',
    productPrice: '',
    productCountry: '',
    productCondition: '',
    productImages: '',
  });

  const [customCategory, setCustomCategory] = useState('');

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
      } else if (productCategory === 'Autres') {
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
    } else if (activeStep === 6) {
      if (!email) {
        newErrors.email = 'Veuillez remplir l\'email';
        isValid = false;
      } else {
        newErrors.email = '';
      }

      if (!phone) {
        newErrors.phone = 'Veuillez remplir le numéro de téléphone';
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
      navigate('/Home');
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
    formData.append('category', productCategory === 'Autres' ? customCategory : productCategory);
    formData.append('description', productDescription);
    formData.append('price', donation ? 0 : parseFloat(productPrice));
    formData.append('donation', donation); // Ensure donation is appended
    formData.append('isDon', productIsDon);
    formData.append('country', productCountry);
    formData.append('userId', userId);
    formData.append('condition', productCondition);
    formData.append('email', email);
    formData.append('phone', phone);
  
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
      } else {
        console.error('Error adding product:', data.data);
        setErrorMessage('Error adding product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setErrorMessage('Error adding product');
    }
  };
  

  const steps = [
    'Détails du produit',
    'Ajout de photos',
    'État du produit',
    'Définir un prix',
    'Informations additionnelles',
    'Autres informations',
    'Coordonnées',
    'Autres détails',
    'Révision et soumission'
  ];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Titre"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              error={Boolean(errors.productName)}
              helperText={errors.productName}
              required
            />
            <TextField
              label="Catégorie"
              select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              error={Boolean(errors.productCategory)}
              helperText={errors.productCategory}
              required
            >
              <MenuItem value="" disabled>Select a category</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            {productCategory === 'Autres' && (
              <TextField
                label="Catégorie personnalisée"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                error={Boolean(errors.productCategory)}
                helperText={errors.productCategory}
                required
              />
            )}
            <TextField
              label="Description"
              multiline
              rows={4}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              error={Boolean(errors.productDescription)}
              helperText={errors.productDescription}
              required
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="contained" component="label">
              Ajouter des photos
              <input type="file" multiple hidden onChange={(e) => setProductImages([...e.target.files])} />
            </Button>
            {errors.productImages && <Typography color="error">{errors.productImages}</Typography>}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="État du produit"
              select
              value={productCondition}
              onChange={(e) => setProductCondition(e.target.value)}
              error={Boolean(errors.productCondition)}
              helperText={errors.productCondition}
              required
            >
              <MenuItem value="" disabled>Select a condition</MenuItem>
              <MenuItem value="Neuf">Neuf</MenuItem>
              <MenuItem value="Bon">Bon</MenuItem>
              <MenuItem value="Satisfaisant">Satisfaisant</MenuItem>
            </TextField>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Je fais un don?</Typography>
              <Switch checked={donation} onChange={(e) => setDonation(e.target.checked)} />
            </Box>
            <TextField
              label="Prix"
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              error={Boolean(errors.productPrice)}
              helperText={errors.productPrice}
              disabled={donation}
              required={!donation}
            />
          </Box>
        );
      case 4:
      case 5:
      case 8:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Pays"
              value={productCountry}
              onChange={(e) => setProductCountry(e.target.value)}
              error={Boolean(errors.productCountry)}
              helperText={errors.productCountry}
              required
            />
          </Box>
        );
      case 6:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              required
            />
            <TextField
              label="Téléphone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              required
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length ? (
          <Typography sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
            All steps completed - you&apos;re finished
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AddProductForm;
