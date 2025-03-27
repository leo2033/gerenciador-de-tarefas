import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="page-title">Esqueci minha senha</h2>
      {message && (
        <p className={message.includes("Erro") ? "error" : "success"}>
          {message}
        </p>
      )}

      <form onSubmit={handleForgotPassword}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            E-mail:
          </label>
          <input
            type="email"
            id="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Carregando..." : "Enviar Código"}
        </button>
      </form>

      <p className="link-text">
        Voltar para o login?{" "}
        <button onClick={() => navigate("/login")} className="link-button">
          Faça login
        </button>
      </p>
    </div>
  );
}

export default ForgotPassword;