import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {StrictMode} from "react";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <App /> } />
            </Routes>
        </BrowserRouter>
    </StrictMode>

)
