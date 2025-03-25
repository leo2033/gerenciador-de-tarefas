import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/app.css";

function Tasks() {
    const navigate = useNavigate();
    const [token] = useState(localStorage.getItem("token") || "");
    const [tasks, setTasks] = useState([]);
    const [taskData, setTaskData] = useState({ id: "", title: "", description: "", priority: "medium", due_date: "", user_id: "" });
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
                Authorization: `Bearer ${token}`
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

    return (
        <div className="container">
            <div className="header">
                <h2>Olá, {userName}</h2>
                <button className="logout-button" onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                }}>Sair</button>
            </div>

            <h2>Gerenciador de Tarefas</h2>
            <button onClick={handleAddTask}>Nova Tarefa</button>

            {/* Filtros */}
            <div className="filters">
                {userRole === "admin" && (
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                        <option value="">Todos os usuários</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                )}
                <input type="text" placeholder="Buscar por título" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                    <option value="">Todas Prioridades</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
                <input type="date" value={filters.due_date} onChange={(e) => setFilters({ ...filters, due_date: e.target.value })} />
                <button onClick={fetchTasks}>Filtrar</button>
            </div>

            {/* Lista de tarefas */}
            {tasks.length === 0 ? <p>Nenhuma tarefa</p> : (
                tasks.map(task => (
                    <div className="task-item" key={task.id}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <p>Prioridade: {formatPriority(task.priority)}</p>
                        <p>Vencimento: {formatDate(task.due_date)}</p>
                        <p>Status: {task.status}</p>
                        {task.user && <p>Usuário: {task.user.name}</p>}
                        {task.completion_request && <p className="highlight">⚠️ Solicitação de conclusão pendente</p>}
                        {task.completion_comment && <p><strong>Comentário:</strong> {task.completion_comment}</p>}

                        <div className="task-buttons">
                            {(userRole === "admin" || parseInt(userId) === task.user_id) && (
                                <>
                                    <button onClick={() => handleEdit(task)}>Editar</button>
                                    <button onClick={() => handleDelete(task.id)}>Excluir</button>
                                </>
                            )}
                            {userRole !== "admin" && parseInt(userId) === task.user_id && !task.completion_request && (
                                <button onClick={() => openCompletionModal(task.id)}>Solicitar Conclusão</button>
                            )}
                            {userRole === "admin" && task.completion_request && (
                                <button onClick={() => openApproveRejectModal(task)}>Analisar Solicitação</button>
                            )}
                        </div>
                    </div>
                ))
            )}

            {/* Modal: Criar/Editar tarefa */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{showModal === "add" ? "Nova Tarefa" : "Editar Tarefa"}</h2>
                        <input type="text" placeholder="Título" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} />
                        <textarea placeholder="Descrição" value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} />
                        <select value={taskData.priority} onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}>
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                        </select>
                        <input type="date" value={taskData.due_date} onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })} />
                        {userRole === "admin" && (
                            <select value={taskData.user_id} onChange={(e) => setTaskData({ ...taskData, user_id: e.target.value })}>
                                <option value="">Selecione um usuário</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        )}
                        <button onClick={handleSaveTask}>Salvar</button>
                        <button onClick={() => setShowModal(null)}>Cancelar</button>
                    </div>
                </div>
            )}

            {/* Modal: Solicitação de conclusão */}
            {commentModal === "requestCompletion" && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Solicitar Conclusão</h3>
                        <textarea value={completionComment} onChange={(e) => setCompletionComment(e.target.value)} placeholder="Descreva o que foi feito..." />
                        <button onClick={() => handleRequestCompletion(completionTaskId, completionComment)}>Enviar</button>
                        <button onClick={() => setCommentModal(null)}>Cancelar</button>
                    </div>
                </div>
            )}

            {/* Modal: Aprovar ou recusar */}
            {approveRejectModalOpen && selectedTaskForReview && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Analisar Solicitação</h3>
                        <p><strong>{selectedTaskForReview.title}</strong></p>
                        <p>{selectedTaskForReview.completion_comment}</p>
                        <button onClick={handleApprove}>Aprovar</button>
                        <button onClick={handleReject}>Recusar</button>
                        <button onClick={() => setApproveRejectModalOpen(false)}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tasks;
