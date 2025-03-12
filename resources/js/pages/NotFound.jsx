import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="container">
            <h1>404 - Página não encontrada</h1>
            <p>O caminho acessado não existe ou houve um erro.</p>
            <button onClick={() => navigate('/')}>Voltar ao Login</button>
        </div>
    );
}

export default NotFound;
