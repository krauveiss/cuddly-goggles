import { createRoot } from 'react-dom/client'
import './index.css'
import Main from './pages/App'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {StrictMode} from "react";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Login/Register.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <Main /> } />
                <Route path="/login" element={ <Login /> } />
                <Route path="/register"  element={ <Register /> } />
            </Routes>
        </BrowserRouter>
    </StrictMode>

)
