import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "/resources/css/app.css";


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const textResponse = await res.text();
            console.log("Resposta da API:", textResponse);

            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (error) {
                throw new Error("A resposta da API não é um JSON válido.");
            }

            if (!res.ok) {
                throw new Error(data?.error || 'Erro ao fazer login');
            }

            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                console.log("Token armazenado:", data.access_token);
                navigate('/tasks');
            } else {
                throw new Error("Nenhum token recebido da API.");
            }
        } catch (error) {
            console.error('Erro ao logar:', error);
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
            <p>Não tem uma conta? <button onClick={() => navigate('/register')}>Cadastre-se</button></p>
        </div>
    );
}

export default Login;
