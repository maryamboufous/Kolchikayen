import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Accounts/Login';
import Sign from './components/Accounts/Sign';
import AllCats from './components/AllCats';
import Product from './components/Product';
import Profile from './components/Profile';
import AddProductForm from './components/AddProductForm';
import Favoris from './components/Favoris';
import Messages from './components/Messages';
import Store from './components/Store';
import EditProduct from './components/EditProduct';
import CategoryProducts from './components/CategoryProducts';
import Cart from './components/Cart';
import Buy from './components/Buy';
import CountryListings from './components/CountryListings';
import { UserProvider } from './context/UserContext';
import { CountryProvider } from './context/CountryContext';
import Uppernav from './components/Uppernav';
import SecondaryNav from './components/SecondaryNav';
import RouteGuard from './components/RouteGuard';
import './App.css';

const App = () => {
  const location = useLocation();

  const showSecondaryNav = location.pathname.startsWith('/Profile') ||
                           location.pathname.startsWith('/Cart') ||
                           location.pathname.startsWith('/store') ||
                           location.pathname.startsWith('/Favoris');

  return (
    <div className="app">
      <UserProvider>
        <CountryProvider>
          <Uppernav userLoggedIn={true} />
          {showSecondaryNav && <SecondaryNav />}
          <Routes>
            <Route path="/Home" element={<Home />} />
            <Route path="/login" element={<RouteGuard><Login /></RouteGuard>} />
            <Route path="/signup" element={<RouteGuard><Sign /></RouteGuard>} />
            <Route path="/country/:country" element={<CountryListings />} />
            <Route path="/Product/:productId" element={<Product />} />
            <Route path="/Profile" element={<RouteGuard><Profile /></RouteGuard>} />
            <Route path="/Favoris" element={<RouteGuard><Favoris /></RouteGuard>} />
            <Route path="/Cart" element={<RouteGuard><Cart /></RouteGuard>} />
            <Route path="/Buy/:productId" element={<RouteGuard><Buy /></RouteGuard>} />
            <Route path="/" element={<Home />} />
            <Route path="/Messages" element={<RouteGuard><Messages /></RouteGuard>} />
            <Route path="/Allcategories" element={<AllCats />} />
            <Route path="/userpage" element={<Home />} />
            <Route path="/userpage/add-product-form" element={<RouteGuard><AddProductForm /></RouteGuard>} />
            <Route path="/store" element={<RouteGuard><Store /></RouteGuard>} />
            <Route path="/edit-product/:productId" element={<RouteGuard><EditProduct /></RouteGuard>} />
            <Route path="/all-categories" element={<AllCats />} />
            <Route path="/products/category/:category" element={<CategoryProducts />} />
          </Routes>
        </CountryProvider>
      </UserProvider>
    </div>
  );
};

export default App;
