import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

/*
  BrowserRouter is used to provide client-side routing capabilities 
  to our React application. It enables us to use declarative routing 
  with the <Route> and <Link> components from react-router-dom.

  - It listens for changes to the URL and renders the corresponding UI.
  - Allows for nested routing within components using <Routes>.
  - Ensures the application maintains a single-page feel without 
    full page refreshes.

  In this application:
  - <App /> component is wrapped with BrowserRouter to enable routing
    functionality across different pages defined in <Routes />.
*/
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
