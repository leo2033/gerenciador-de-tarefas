import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import Relatorio from "./pages/Relatorio";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";

import "../css/app.css";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        const checkToken = () => setToken(localStorage.getItem("token"));
        window.addEventListener("storage", checkToken);
        return () => window.removeEventListener("storage", checkToken);
    }, []);

    return (
        <Router>
            <Routes>

                {/* Página inicial redireciona dependendo do token */}
                <Route path="/" element={token ? <Navigate to="/tasks" /> : <Login setToken={setToken} />} />

                {/* Acesso livre */}
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Rotas protegidas */}
                <Route path="/tasks" element={token ? <Tasks /> : <Navigate to="/login" />} />
                <Route path="/relatorio" element={token ? <Relatorio /> : <Navigate to="/login" />} />

                {/* Página não encontrada */}
                <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
            </Routes>
        </Router>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

export default App;
