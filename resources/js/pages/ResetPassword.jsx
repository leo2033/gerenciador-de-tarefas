import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const { state } = useLocation();
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: state.email, code: state.code, password, password_confirmation: confirmPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao redefinir senha");

            navigate("/login");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="container">
            <h2>Redefinir Senha</h2>
            <form onSubmit={handleResetPassword}>
                <input type="password" placeholder="Nova Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type="password" placeholder="Confirmar Senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="submit">Alterar Senha</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default ResetPassword;
