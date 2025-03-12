import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import '../css/app.css'; // Arquivo CSS principal


function App() {
    const token = localStorage.getItem("token");

    return (
        <Router>
            <Routes>
                {/* Se o usuário não estiver autenticado, redireciona para o login */}
                <Route path="/" element={token ? <Navigate to="/tasks" /> : <Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/tasks" element={token ? <Tasks /> : <Navigate to="/login" />} />
                
                {/* Página 404 */}
                <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
            </Routes>
        </Router>
    );
}

// Renderiza a aplicação dentro do "root"
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

export default App;
