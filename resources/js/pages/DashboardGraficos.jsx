import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function DashboardGraficos() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [selectedUser]);

  const fetchUsers = async () => {
    const response = await fetch("/api/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const json = await response.json();
    setUsers(json);
  };

  const fetchSummary = async () => {
    const url = selectedUser
      ? `/api/dashboard/tasks-summary?user_id=${selectedUser}`
      : "/api/dashboard/tasks-summary";

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const json = await response.json();
    setData([
      { name: "Pendentes", total: json.pendentes || 0 },
      { name: "Concluídas", total: json.concluidas || 0 },
      { name: "Vencidas", total: json.vencidas || 0 },
    ]);
  };

  const exportPDF = async () => {
    const chart = document.getElementById("grafico-dashboard");
    const canvas = await html2canvas(chart);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 90);
    pdf.save("dashboard-tarefas.pdf");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <select
          className="w-64 p-2 border rounded"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Todos os usuários</option>
          {users.map((user) => (
            <option key={user.id} value={user.id.toString()}>
              {user.name}
            </option>
          ))}
        </select>

        <button className="btn" onClick={exportPDF}>
          📊 Exportar PDF
        </button>
      </div>

      <div id="grafico-dashboard" className="card" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
