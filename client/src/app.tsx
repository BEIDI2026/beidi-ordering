import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import HomePage from './pages/HomePage/HomePage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import CartPage from './pages/CartPage/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage/OrderSuccessPage';
import AdminPage from './pages/AdminPage/AdminPage';
import AdminProductsPage from './pages/AdminProductsPage/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage/AdminOrdersPage';
import AdminSiteConfigPage from './pages/AdminSiteConfigPage/AdminSiteConfigPage';
import AdminLoginPage from './pages/AdminLoginPage/AdminLoginPage';
import { AuthProvider } from './contexts/AuthContext';

const RoutesComponent = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="order-success" element={<OrderSuccessPage />} />
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/products" element={<AdminProductsPage />} />
          <Route path="admin/orders" element={<AdminOrdersPage />} />
          <Route path="admin/site-config" element={<AdminSiteConfigPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default RoutesComponent;
