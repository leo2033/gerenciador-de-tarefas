import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setToken }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Erro ao fazer login");
            }

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user_id", data.user.id);
            localStorage.setItem("role", data.user.role);
            setToken(data.access_token); // Notifica o App.jsx da mudança de token

            navigate("/tasks");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLogin}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Senha" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Entrar</button>
            </form>

            <p>
                Esqueceu sua senha?{" "}
                <button onClick={() => navigate("/forgot-password")}>Recuperar Senha</button>
            </p>

            <p>
                Não tem uma conta?{" "}
                <button onClick={() => navigate("/register")}>Cadastre-se</button>
            </p>
        </div>
    );
}

export default Login;
