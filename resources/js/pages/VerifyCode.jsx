import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyCode() {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const { state } = useLocation();
    const navigate = useNavigate();

    const handleVerifyCode = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: state.email, code }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Código inválido");

            navigate("/reset-password", { state: { email: state.email, code } });
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="container">
            <h2>Verifique seu código</h2>
            <form onSubmit={handleVerifyCode}>
                <input
                    type="text"
                    placeholder="Digite o código recebido"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                <button type="submit">Validar Código</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default VerifyCode;
