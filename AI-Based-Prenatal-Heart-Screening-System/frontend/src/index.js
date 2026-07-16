import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './components/index.css';
import App from './App';

// Set background image from public folder
document.body.style.background = 'url("back.jpg") no-repeat center center fixed';
document.body.style.backgroundSize = "cover";
document.body.style.height = "100%";
document.body.style.margin = "0";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

