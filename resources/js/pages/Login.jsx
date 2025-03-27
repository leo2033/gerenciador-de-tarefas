import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/app.css"; // Correct path to resources/css/app.css

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

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta inesperada do servidor.");
      }

      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data?.error || "E-mail ou senha inválidos.";
        throw new Error(errorMessage);
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("role", data.user.role);
      setToken(data.access_token);
      navigate("/tasks");
    } catch (error) {
      setError(error.message || "Erro ao fazer login.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="page-title">Login</h2>
      {error && (
        <p className="error">
          {error}
        </p>
      )}
      <form onSubmit={handleLogin}>
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
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Senha:
          </label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Entrar
        </button>
      </form>

      <p className="link-text">
        Esqueceu sua senha?{" "}
        <button
          onClick={() => navigate("/forgot-password")}
          className="link-button"
        >
          Recuperar Senha
        </button>
      </p>

      <p className="link-text">
        Não tem uma conta?{" "}
        <button
          onClick={() => navigate("/register")}
          className="link-button"
        >
          Cadastre-se
        </button>
      </p>
    </div>
  );
}

export default Login;