import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao enviar email");

            setMessage("Código enviado! Verifique seu email.");
            setTimeout(() => navigate("/verify-code", { state: { email } }), 2000);
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="container">
            <h2>Esqueci minha senha</h2>
            <form onSubmit={handleForgotPassword}>
                <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Enviar Código</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default ForgotPassword;
