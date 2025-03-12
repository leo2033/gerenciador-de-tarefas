import React, { useState, useEffect } from "react";
import "/resources/css/app.css";


function Tasks() {
    const [token] = useState(localStorage.getItem("token") || "");
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(null);
    const [taskData, setTaskData] = useState({ title: "", description: "", priority: "medium", due_date: "" });
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [filters, setFilters] = useState({ priority: "", due_date: "", search: "" });

    useEffect(() => {
        if (token) {
            fetchTasks();
        } else {
            window.location.href = "/login";
        }
    }, [token]);

    const fetchTasks = async () => {
        try {
            let url = new URL("http://localhost:8000/api/tasks");

            if (filters.priority) url.searchParams.append("priority", filters.priority);
            if (filters.due_date) url.searchParams.append("due_date", filters.due_date);
            if (filters.search) url.searchParams.append("search", filters.search);

            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Erro ao buscar tarefas");

            const data = await res.json();
            const formattedTasks = data.map(task => ({
                ...task,
                due_date: new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
            }));

            setTasks(formattedTasks);
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
        }
    };

    return (
        <div className="container">
            <h2>Gerenciador de Tarefas</h2>
            <button onClick={() => setShowModal("add")}>Nova Tarefa</button>

            <div className="filters">
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
            </div>

            {tasks.length === 0 ? <p>Nenhuma tarefa encontrada</p> : tasks.map((task) => (
                <div key={task.id} className="task-item">
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <p>Prioridade: {task.priority}</p>
                    <p>Vencimento: {task.due_date}</p>
                </div>
            ))}
        </div>
    );
}

export default Tasks;
