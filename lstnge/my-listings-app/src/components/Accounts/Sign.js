import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import googleimg from '../../assets/google.svg';
import { FaArrowLeft } from 'react-icons/fa';
import './Sign.css';

const SignIn = () => {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [name, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [mobilePrefix, setMobilePrefix] = useState('+212');
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});
  const [serverVerificationCode, setServerVerificationCode] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const validateStep2 = () => {
    const newErrors = {};
    if (name.length < 3) {
      newErrors.name = 'Le nom d\'utilisateur doit comporter plus de 3 lettres.';
    }
    const mobilePattern = mobilePrefix === '+212' ? /^[0-9]{9}$/ : /^[0-9]{10}$/;
    if (!mobilePattern.test(mobile)) {
      newErrors.mobile = 'Numéro de téléphone invalide.';
    }
    if (!email.includes('@')) {
      newErrors.email = 'Adresse e-mail invalide.';
    }
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,50}$/;
    if (!passwordPattern.test(password)) {
      newErrors.password = 'Le mot de passe doit comporter entre 8 et 50 caractères, avec au moins une lettre minuscule, une lettre majuscule et un chiffre.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && accountType) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      sendVerificationCode();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    if (verificationCode.trim() === serverVerificationCode) {
      handleSubmit();
    } else {
      setErrors({ verificationCode: 'Code de vérification invalide.' });
    }
  };

  const sendVerificationCode = async () => {
    try {
      const response = await fetch('http://localhost:5001/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setServerVerificationCode(String(data.data.verificationCode));
        setStep(3);
      } else {
        console.error(data.data);
      }
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  const handleSubmit = async () => {
    const userData = { name, mobile: mobilePrefix + mobile, email, password };

    try {
      const response = await fetch('http://localhost:5001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setUser({ name, email });
        navigate('/userpage');
      } else {
        console.error(data.data);
      }
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  return (
    <div className="auth-form">
      <h2>Inscription</h2>
      {step === 1 && (
        <div>
          <h3>Compte pour :</h3>
          <label>
            <input
              type="radio"
              name="accountType"
              value="Moi"
              checked={accountType === 'Moi'}
              onChange={(e) => setAccountType(e.target.value)}
            />
            Moi
          </label>
          <label>
            <input
              type="radio"
              name="accountType"
              value="Mon entreprise"
              checked={accountType === 'Mon entreprise'}
              onChange={(e) => setAccountType(e.target.value)}
            />
            Mon entreprise
          </label>
          <button onClick={handleNextStep} disabled={!accountType}>Suivant</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <button onClick={handlePreviousStep}><FaArrowLeft /></button>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Nom d'utilisateur:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div>
              <label>Mobile:</label>
              <select
                value={mobilePrefix}
                onChange={(e) => setMobilePrefix(e.target.value)}
              >
                <option value="+212">+212</option>
                <option value="+33">+33</option>
              </select>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
              {errors.mobile && <span className="error">{errors.mobile}</span>}
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div>
              <label>Mot de passe:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <button type="button" onClick={handleNextStep}>Suivant</button>
          </form>
        </div>
      )}
      {step === 3 && (
        <div>
          <button onClick={handlePreviousStep}><FaArrowLeft /></button>
          <form onSubmit={handleVerification}>
            <div>
              <label>Code de vérification:</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              {errors.verificationCode && <span className="error">{errors.verificationCode}</span>}
            </div>
            <button type="submit">Vérifier et Créer le Compte</button>
          </form>
        </div>
      )}
      <div className="auth-google">
        <img src={googleimg} alt="Google" />
        <span>Continuer avec Google</span>
      </div>
    </div>
  );
};

export default SignIn;
