import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "/resources/css/app.css";

function Tasks() {
    const navigate = useNavigate();
    const [token] = useState(localStorage.getItem("token") || "");
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(null); // "add" ou "edit"
    const [taskData, setTaskData] = useState({ 
        id: "", 
        title: "", 
        description: "", 
        priority: "medium", 
        due_date: "",
        user_id: ""
    });
    const [filters, setFilters] = useState({ priority: "", due_date: "", search: "" });
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        if (token) {
            fetchUserInfo();
            fetchTasks();
        } else {
            navigate("/login");
        }
    }, [token, navigate]);

    // Obter informações do usuário logado
    const fetchUserInfo = async () => {
        try {
            const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Erro ao obter informações do usuário");
            const data = await res.json();
            setUserName(data.name);
            setUserRole(data.role);
            setUserId(data.id);
            
            // Busca outros usuários apenas se for admin
            if (data.role === "admin") {
                fetchUsers();
            }
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
        }
    };

    // Busca todas as tarefas com os filtros aplicados
    const fetchTasks = async () => {
        try {
            let url = new URL("/api/tasks", window.location.origin);
            if (filters.priority) url.searchParams.append("priority", filters.priority);
            if (filters.due_date) url.searchParams.append("due_date", filters.due_date);
            if (filters.search) url.searchParams.append("search", filters.search);
            if (selectedUser) url.searchParams.append("user_id", selectedUser);

            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`Erro ao buscar tarefas: ${res.status}`);

            const data = await res.json();
            setTasks(data);
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
        }
    };

    // Busca todos os usuários (para admin)
    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Erro ao buscar usuários");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    };

    // Deleta uma tarefa
    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) return;
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Erro ao excluir tarefa");
            alert("Tarefa excluída!");
            fetchTasks();
        } catch (error) {
            console.error("Erro ao excluir tarefa:", error);
        }
    };

    // Abre o modal para adicionar nova tarefa
    const handleAddTask = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        
        setTaskData({ 
            id: "", 
            title: "", 
            description: "", 
            priority: "medium", 
            due_date: formattedDate,
            user_id: userRole === "admin" ? "" : userId
        });
        setShowModal("add");
    };

    // Abre o modal de edição de tarefa
    const handleEdit = (task) => {
        setTaskData({ 
            ...task,
            user_id: task.user_id || ""
        });
        setShowModal("edit");
    };

    // Salva a tarefa (nova ou editada)
    const handleSaveTask = async () => {
        try {
            // Validação dos campos obrigatórios
            if (!taskData.title) {
                alert("O título é obrigatório");
                return;
            }
            
            if (!taskData.due_date) {
                alert("A data de vencimento é obrigatória");
                return;
            }
            
            if (userRole === "admin" && !taskData.user_id && showModal === "add") {
                alert("Selecione um usuário para a tarefa");
                return;
            }

            // Determina se é uma criação ou edição
            const isEdit = showModal === "edit";
            const method = isEdit ? "PUT" : "POST";
            const url = isEdit ? `/api/tasks/${taskData.id}` : "/api/tasks";
            
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(taskData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro ao salvar tarefa");
            }
            
            alert(isEdit ? "Tarefa atualizada com sucesso!" : "Tarefa criada com sucesso!");
            setShowModal(null);
            fetchTasks();
        } catch (error) {
            console.error("Erro ao salvar tarefa:", error);
            alert(error.message || "Erro ao salvar tarefa");
        }
    };

    // Formata a exibição da prioridade
    const formatPriority = (priority) => {
        const translations = {
            low: "Baixa",
            medium: "Média",
            high: "Alta"
        };
        return translations[priority] || priority;
    };

    // Formata a data para exibição
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    return (
        <div className="container">
            <div className="header">
                <h2>Olá, {userName || "Usuário"}!</h2>
                <button className="logout-button" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
                    Logout
                </button>
            </div>

            <h2>Gerenciador de Tarefas</h2>

            <button onClick={handleAddTask}>Nova Tarefa</button>

            {/* Filtros */}
            <div className="filters">
                {userRole === "admin" && (
                    <select 
                        value={selectedUser} 
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">Todos os Usuários</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                )}
                <input 
                    type="text" 
                    placeholder="Buscar título ou descrição" 
                    value={filters.search} 
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <select 
                    value={filters.priority} 
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                    <option value="">Todas Prioridades</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
                <input 
                    type="date" 
                    className="date-input" 
                    value={filters.due_date} 
                    onChange={(e) => setFilters({ ...filters, due_date: e.target.value })}
                />
                <button onClick={fetchTasks}>Filtrar</button>
                <button onClick={() => {
                    setFilters({ priority: "", due_date: "", search: "" });
                    setSelectedUser("");
                    fetchTasks();
                }}>Limpar Filtros</button>
            </div>

            {/* Listagem de tarefas */}
            {tasks.length === 0 ? 
                <p>Nenhuma tarefa encontrada</p> 
                : 
                tasks.map((task) => (
                    <div key={task.id} className="task-item">
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <p>Prioridade: {formatPriority(task.priority)}</p>
                        <p>Vencimento: {formatDate(task.due_date)}</p>
                        {task.user && <p>Usuário: {task.user.name || "Desconhecido"}</p>}

                        {(userRole === "admin" || task.user_id === parseInt(userId)) && (
                            <>
                                <button onClick={() => handleEdit(task)}>Editar</button>
                                <button onClick={() => handleDelete(task.id)}>Excluir</button>
                            </>
                        )}
                    </div>
                ))
            }

            {/* Modal para Adicionar/Editar Tarefa */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{showModal === "add" ? "Nova Tarefa" : "Editar Tarefa"}</h2>
                        
                        <input 
                            type="text" 
                            value={taskData.title} 
                            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} 
                            placeholder="Título da tarefa"
                        />
                        
                        <textarea 
                            value={taskData.description} 
                            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} 
                            placeholder="Descrição da tarefa"
                            style={{ width: "calc(100% - 20px)", minHeight: "100px", margin: "10px auto", padding: "10px" }}
                        ></textarea>
                        
                        <select 
                            value={taskData.priority} 
                            onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                        >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                        </select>
                        
                        <input 
                            type="date" 
                            className="date-input"
                            value={taskData.due_date} 
                            onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                        />
                        
                        {userRole === "admin" && (
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
                        )}
                        
                        <button onClick={handleSaveTask}>
                            {showModal === "add" ? "Criar" : "Salvar"}
                        </button>
                        <button onClick={() => setShowModal(null)}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tasks;