import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

function Relatorio() {
  const navigate = useNavigate();
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
      headers: { Authorization: `Bearer ${token}` }
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
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTasks(data);
  };

  const getStatusCounts = () => {
    const hoje = new Date();
    let pendente = 0;
    let concluida = 0;
    let atrasada = 0;

    tasks.forEach(task => {
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
      { status: "Atrasadas", total: atrasada }
    ];
  };

  const data = getStatusCounts();

  // Calculate the total number of tasks
  const totalTasks = data.reduce((sum, entry) => sum + entry.total, 0);

  // Define colors for each status
  const COLORS = {
    "A Fazer": "#34D399", // Green
    "Concluídas": "#3B82F6", // Blue
    "Atrasadas": "#EF4444" // Red
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relatório de Tarefas</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Voltar para Tarefas
        </button>
      </div>

      <div className="mb-4">
        <label className="font-semibold mr-2">Filtrar por usuário:</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todos os usuários</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      {/* Display the total number of tasks */}
      <div className="mb-4">
        <p className="text-lg font-semibold">
          Total de Tarefas: {totalTasks}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />

          {/* Single Bar component with dynamic colors and labels */}
          <Bar
            dataKey="total"
            name="Total"
            label={{
              position: "inside",
              fill: "#ffffff",
              fontSize: 14,
              fontWeight: "bold"
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Relatorio;