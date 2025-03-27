import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
          return;
        }
        throw new Error(data?.message || data?.error || "Erro ao registrar");
      }

      alert("Cadastro realizado com sucesso! Faça login.");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao registrar:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="page-title">Cadastro</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Nome:
          </label>
          <input
            type="text"
            id="name"
            placeholder="Digite seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
          {fieldErrors.name && <p className="error">{fieldErrors.name[0]}</p>}
        </div>

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
          {fieldErrors.email && <p className="error">{fieldErrors.email[0]}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Senha:
          </label>
          <input
            type="password"
            id="password"
            placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número, 1 símbolo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
          {fieldErrors.password && <p className="error">{fieldErrors.password[0]}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="role">
            Função:
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="form-input"
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Carregando..." : "Cadastrar"}
        </button>
      </form>

      <p className="link-text">
        Já tem uma conta?{" "}
        <button onClick={() => navigate("/login")} className="link-button">
          Faça login
        </button>
      </p>
    </div>
  );
}

export default Register;