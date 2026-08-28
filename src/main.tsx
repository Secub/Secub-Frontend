import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initAuth } from "./services/auth/authProvider";
import { ensureSimpleAcademicDemoData } from "./services/mockBackend/demoSeed";

import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";

import "./index.css";

document.documentElement.lang = "es";
initAuth();
ensureSimpleAcademicDemoData();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);