import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/app.css";

function Tasks() {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [taskData, setTaskData] = useState({
    id: "",
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    user_id: "",
  });
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ priority: "", due_date: "", search: "" });
  const [selectedUser, setSelectedUser] = useState("");
  const [showModal, setShowModal] = useState(null);
  const [commentModal, setCommentModal] = useState(null);
  const [completionComment, setCompletionComment] = useState("");
  const [completionTaskId, setCompletionTaskId] = useState(null);
  const [approveRejectModalOpen, setApproveRejectModalOpen] = useState(false);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState(null);

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchUserInfo();
    fetchTasks();
  }, [token]);

  const fetchUserInfo = async () => {
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUserRole(data.role);
    setUserId(data.id);
    setUserName(data.name);
    if (data.role === "admin") fetchUsers();
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
  };

  const fetchTasks = async () => {
    let url = new URL("/api/tasks", window.location.origin);
    Object.entries(filters).forEach(([key, value]) => value && url.searchParams.append(key, value));
    if (selectedUser) url.searchParams.append("user_id", selectedUser);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(data);
  };

  const handleAddTask = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0];
    setTaskData({
      id: "",
      title: "",
      description: "",
      priority: "medium",
      due_date: formattedDate,
      user_id: userRole === "admin" ? "" : userId,
    });
    setShowModal("add");
  };

  const handleEdit = (task) => {
    setTaskData({ ...task });
    setShowModal("edit");
  };

  const handleSaveTask = async () => {
    if (!taskData.title || !taskData.due_date || (userRole === "admin" && !taskData.user_id && showModal === "add")) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const isEdit = showModal === "edit";
    const res = await fetch(isEdit ? `/api/tasks/${taskData.id}` : "/api/tasks", {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Erro ao salvar tarefa");
    fetchTasks();
    setShowModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir esta tarefa?")) return;
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  const openCompletionModal = (taskId) => {
    setCompletionTaskId(taskId);
    setCompletionComment("");
    setCommentModal("requestCompletion");
  };

  const handleRequestCompletion = async (taskId, comment) => {
    if (!comment.trim()) {
      alert("Por favor, insira um comentário.");
      return;
    }

    const res = await fetch(`/api/tasks/${taskId}/request-completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completion_comment: comment }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert("Solicitação enviada!");
    fetchTasks();
    setCommentModal(null);
  };

  const openApproveRejectModal = (task) => {
    setSelectedTaskForReview(task);
    setApproveRejectModalOpen(true);
  };

  const handleApprove = async () => {
    const res = await fetch(`/api/tasks/${selectedTaskForReview.id}/review-completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "concluida", admin_comment: "" }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert("Tarefa marcada como concluída.");
    fetchTasks();
    setApproveRejectModalOpen(false);
  };

  const handleReject = async () => {
    const comment = prompt("Informe o motivo da recusa:");
    if (!comment) return;
    const res = await fetch(`/api/tasks/${selectedTaskForReview.id}/review-completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "pendente", admin_comment: comment }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert("Solicitação recusada.");
    fetchTasks();
    setApproveRejectModalOpen(false);
  };

  const formatPriority = (p) => ({ low: "Baixa", medium: "Média", high: "Alta" }[p] || p);
  const formatDate = (d) => new Intl.DateTimeFormat("pt-BR").format(new Date(d));

  const isOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today && due.toDateString() !== today.toDateString();
  };

  return (
    <div className="tasks-container">
      <div className="header">
        <h2 className="greeting">Olá, {userName}</h2>
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Sair
        </button>
      </div>

      <h1 className="page-title">Gerenciador de Tarefas</h1>

      <div className="actions">
        <button className="btn btn-primary" onClick={handleAddTask}>
          Nova Tarefa
        </button>
        {userRole === "admin" && (
          <button
            className="btn btn-report"
            onClick={() => navigate("/relatorio")}
          >
            📊 Acessar Relatório por Gráfico
          </button>
        )}
      </div>

      <div className="filters-section">
        {userRole === "admin" && (
          <div className="filter-item">
            <label htmlFor="user-filter">Todos os usuários</label>
            <select
              id="user-filter"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Todos os usuários</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="filter-item">
          <label htmlFor="search-filter">Buscar por título</label>
          <input
            type="text"
            id="search-filter"
            placeholder="Buscar por título"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="filter-item">
          <label htmlFor="priority-filter">Prioridade</label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">Todas Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="date-filter">Data de Vencimento</label>
          <input
            type="date"
            id="date-filter"
            value={filters.due_date}
            onChange={(e) => setFilters({ ...filters, due_date: e.target.value })}
          />
        </div>
        <button className="btn btn-filter" onClick={fetchTasks}>
          Filtrar
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="no-tasks">Nenhuma tarefa encontrada.</p>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div
              className={`task-card ${
                task.status === "concluida"
                  ? "task-completed"
                  : isOverdue(task.due_date)
                  ? "task-overdue"
                  : ""
              } priority-${task.priority}`}
              key={task.id}
            >
              <h3 className="task-title">{task.title}</h3>
              <p className="task-description">{task.description}</p>
              <div className="task-details">
                <p>
                  <strong>Prioridade:</strong>{" "}
                  <span className={`priority-label priority-${task.priority}`}>
                    {formatPriority(task.priority)}
                  </span>
                </p>
                <p>
                  <strong>Vencimento:</strong> {formatDate(task.due_date)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-label status-${task.status}`}>
                    {task.status}
                  </span>
                </p>
                {task.user && (
                  <p>
                    <strong>Usuário:</strong> {task.user.name}
                  </p>
                )}
                {task.completion_request && (
                  <p className="highlight">
                    ⚠️ Solicitação de conclusão pendente
                  </p>
                )}
                {typeof task.completion_comment === "string" &&
                  task.completion_comment.trim() !== "" && (
                    <p>
                      <strong>Comentário:</strong> {task.completion_comment}
                    </p>
                  )}
              </div>
              <div className="task-actions">
                {(userRole === "admin" || parseInt(userId) === task.user_id) && (
                  <>
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(task)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(task.id)}
                    >
                      Excluir
                    </button>
                  </>
                )}
                {userRole !== "admin" &&
                  parseInt(userId) === task.user_id &&
                  !task.completion_request && (
                    <button
                      className="btn btn-request"
                      onClick={() => openCompletionModal(task.id)}
                    >
                      Solicitar Conclusão
                    </button>
                  )}
                {userRole === "admin" && task.completion_request && (
                  <button
                    className="btn btn-review"
                    onClick={() => openApproveRejectModal(task)}
                  >
                    Analisar Solicitação
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Adicionar/Editar Tarefa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{showModal === "add" ? "Nova Tarefa" : "Editar Tarefa"}</h2>
            <div className="form-group">
              <label className="form-label">Título</label>
              <input
                className="form-input"
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="Título da tarefa"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                placeholder="Descrição da tarefa"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prioridade</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data de Vencimento</label>
              <input
                type="date"
                className="form-input"
                value={taskData.due_date}
                onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
              />
            </div>
            {userRole === "admin" && showModal === "add" && (
              <div className="form-group">
                <label className="form-label">Atribuir a</label>
                <select
                  value={taskData.user_id}
                  onChange={(e) => setTaskData({ ...taskData, user_id: e.target.value })}
                >
                  <option value="">Selecione um usuário</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveTask}>
                Salvar
              </button>
              <button
                className="btn btn-delete"
                onClick={() => setShowModal(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Solicitar Conclusão */}
      {commentModal === "requestCompletion" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Solicitar Conclusão</h2>
            <div className="form-group">
              <label className="form-label">Comentário</label>
              <textarea
                value={completionComment}
                onChange={(e) => setCompletionComment(e.target.value)}
                placeholder="Insira um comentário sobre a conclusão da tarefa"
                rows="4"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleRequestCompletion(completionTaskId, completionComment)}
              >
                Enviar
              </button>
              <button
                className="btn btn-delete"
                onClick={() => setCommentModal(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;