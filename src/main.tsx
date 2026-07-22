import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ensureSimpleAcademicDemoData } from "./services/mockBackend/demoSeed";

import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

import "./index.css";

document.documentElement.lang = "es";
ensureSimpleAcademicDemoData();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);