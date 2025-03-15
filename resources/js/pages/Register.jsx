import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");  
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch("/api/register", { // ✅ Usando proxy do Vite
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Erro ao registrar");
            }

            alert("Cadastro realizado com sucesso! Faça login.");
            navigate("/login"); // ✅ Redireciona para o login
        } catch (error) {
            console.error("Erro ao registrar:", error);
            setError(error.message);
        }
    };

    return (
        <div className="container">
            <h2>Cadastro</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleRegister}>
                <input 
                    type="text" 
                    placeholder="Nome" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Senha (mín. 8 caracteres, 1 número, 1 símbolo)" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                </select>
                <button type="submit">Cadastrar</button>
            </form>
            <p>Já tem uma conta? <button onClick={() => navigate("/login")}>Faça login</button></p>
        </div>
    );
}

export default Register;
