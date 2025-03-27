import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "../../css/app.css";

function Relatorio() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const [token] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchTasks();
    fetchUsers();
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [selectedUser]);

  const fetchUsers = async () => {
    const res = await fetch("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
  };

  const fetchTasks = async () => {
    let url = new URL("/api/tasks", window.location.origin);
    if (selectedUser) {
      url.searchParams.append("user_id", selectedUser);
    }
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(data);
  };

  const getStatusCounts = () => {
    const hoje = new Date();
    let pendente = 0;
    let concluida = 0;
    let atrasada = 0;

    tasks.forEach((task) => {
      const vencimento = new Date(task.due_date);
      if (task.status === "concluida") {
        concluida++;
      } else if (task.status === "pendente" && vencimento < hoje) {
        atrasada++;
      } else if (task.status === "pendente") {
        pendente++;
      }
    });

    return [
      { status: "A Fazer", total: pendente },
      { status: "Concluídas", total: concluida },
      { status: "Atrasadas", total: atrasada },
    ];
  };

  const data = getStatusCounts();

  const COLORS = {
    "A Fazer": "#34D399",
    "Concluídas": "#3B82F6",
    "Atrasadas": "#EF4444",
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Relatório de Tarefas", 20, 20);

    doc.setFontSize(12);
    const statusCounts = getStatusCounts();
    let yPosition = 40;
    statusCounts.forEach((item) => {
      doc.text(`${item.status}: ${item.total} Tarefas`, 20, yPosition);
      yPosition += 10;
    });

    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth() - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(imgData, "PNG", 20, yPosition + 10, pdfWidth, pdfHeight);
    }

    doc.save("relatorio_tarefas.pdf");
  };

  return (
    <div className="report-page">
      <div className="report-container">
        <div className="header">
          <h1 className="page-title">Relatório de Tarefas</h1>
          <button className="btn btn-back" onClick={() => navigate("/")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar
          </button>
        </div>

        <div className="actions">
          <div className="filter-item">
            <label htmlFor="user-filter" className="form-label">
              Filtrar por Usuário
            </label>
            <select
              id="user-filter"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="form-input"
            >
              <option value="">Todos os Usuários</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-report" onClick={handleDownloadPDF}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Baixar Relatório PDF
          </button>
        </div>

        <div className="chart-container" ref={chartRef}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="status" tick={{ fill: "#4B5563", fontSize: 14 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#4B5563", fontSize: 14 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: 14 }} />
              <Bar
                dataKey="total"
                name="Total de Tarefas"
                barSize={60}
                radius={[8, 8, 0, 0]}
                label={{
                  position: "top",
                  fill: "#374151",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Relatorio;