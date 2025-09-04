import { createRoot } from "react-dom/client";
import "./index.css";
import Main from "./pages/App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StrictMode } from "react";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Login/Register.jsx";
import User from "./pages/Profile/User.jsx";
import Packages from "./pages/Packages/Packages.jsx";
import RecipePage from "./pages/Packages/Receipt.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<User />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/order/:id" element={<RecipePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
