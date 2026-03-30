import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);