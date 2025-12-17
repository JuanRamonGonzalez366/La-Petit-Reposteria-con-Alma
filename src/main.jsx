import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import "./i18n";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./context/CartContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider> {/* ✅ Context global */}
      <BrowserRouter>
        <App />
        {/* Contenedor global de notificaciones */}
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
)
