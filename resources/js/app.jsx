import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import '../css/app.css';

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
                <Route path="/" element={token ? <Navigate to="/tasks" /> : <Login setToken={setToken} />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register />} />

                {/* 🔒 Rotas protegidas */}
                <Route path="/tasks" element={token ? <Tasks /> : <Navigate to="/login" />} />

                {/* Recuperação de Senha */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* 404 */}
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
