import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'Erro ao registrar');
            }
    
            alert('Registro feito com sucesso! Faça login para continuar.');
            navigate('/login'); // Redireciona para login
    
        } catch (error) {
            console.error('Erro ao registrar:', error);
            alert(error.message);
        }
    };
    

    return (
        <div className="container">
            <h2>Cadastro</h2>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Cadastrar</button>
            </form>
            <p>Já tem uma conta? <button onClick={() => navigate('/login')}>Faça login</button></p>
        </div>
    );
}

export default Register;
