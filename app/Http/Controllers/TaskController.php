<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    /**
     * ✅ Listar todas as tarefas do usuário autenticado
     * ✅ Admin pode ver todas as tarefas ou filtrar por usuário específico
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Task::query();

        // ✅ Se não for admin, filtra apenas as tarefas do próprio usuário
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        // ✅ Se for admin, permite filtrar por usuário específico
        if ($user->role === 'admin' && $request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // ✅ Filtro por prioridade
        if ($request->has('priority') && !empty($request->priority)) {
            $query->where('priority', $request->priority);
        }

        // ✅ Filtro por título ou descrição (busca case-insensitive)
        if ($request->has('search') && !empty($request->search)) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%$search%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%$search%"]);
            });
        }

        // ✅ Filtro por data de vencimento
        if ($request->has('due_date') && !empty($request->due_date)) {
            $query->whereDate('due_date', $request->due_date);
        }

        // ✅ Log para depuração
        Log::info('📌 Parâmetros de busca:', $request->all());

        return response()->json($query->with('user')->get());
    }

    /**
     * ✅ Criar uma nova tarefa
     * ✅ Admin pode criar para qualquer usuário
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'priority' => 'required|in:low,medium,high',
                'due_date' => 'required|date|after_or_equal:today', // ❌ Bloqueia datas passadas
                'user_id' => 'nullable|exists:users,id' // ✅ Permite admin criar tarefas para outros usuários
            ]);

            $userId = auth()->user()->role === 'admin' && $request->has('user_id') ? $request->user_id : auth()->id();

            $task = Task::create([
                'title' => $request->title,
                'description' => $request->description,
                'priority' => $request->priority,
                'due_date' => $request->due_date,
                'user_id' => $userId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tarefa criada com sucesso',
                'task' => $task
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erro ao salvar tarefa',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Mostrar uma única tarefa
     */
    public function show($id)
    {
        $task = Task::with('user')->findOrFail($id);

        if (auth()->user()->role !== 'admin' && $task->user_id !== auth()->id()) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        return response()->json($task);
    }

    /**
     * ✅ Atualizar uma tarefa existente
     * ✅ Admin pode editar qualquer tarefa
     */
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $user = auth()->user();

        // ✅ Admin pode editar qualquer tarefa
        if ($user->role !== 'admin' && $task->user_id !== $user->id) {
            return response()->json(['error' => 'Você não tem permissão para editar esta tarefa'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|required|in:low,medium,high',
            'due_date' => 'sometimes|required|date|after_or_equal:today',
            'user_id' => 'nullable|exists:users,id' // ✅ Permite admin mudar o dono da tarefa
        ]);

        // ✅ Admin pode mudar a tarefa de dono
        if ($user->role === 'admin' && $request->has('user_id')) {
            $task->user_id = $request->user_id;
        }

        $task->update($request->only(['title', 'description', 'priority', 'due_date']));

        return response()->json($task);
    }

    /**
     * ✅ Excluir uma tarefa existente
     * ✅ Admin pode excluir qualquer tarefa
     */
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $user = auth()->user();

        // ✅ Admin pode excluir qualquer tarefa
        if ($user->role !== 'admin' && $task->user_id !== $user->id) {
            return response()->json(['error' => 'Você não tem permissão para excluir esta tarefa'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Tarefa excluída com sucesso']);
    }

    /**
     * ✅ Filtrar tarefas por usuário (Apenas Admin)
     */
    public function tasksByUser($user_id, Request $request)
    {
        $user = auth()->user();

        // ✅ Apenas admins podem visualizar tarefas de outros usuários
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        // ✅ Verifica se o usuário existe antes de buscar as tarefas
        if (!User::find($user_id)) {
            return response()->json(['error' => 'Usuário não encontrado'], 404);
        }

        // ✅ Inicializa a query filtrando as tarefas do usuário especificado
        $query = Task::where('user_id', $user_id);

        // ✅ Aplica os filtros (prioridade, título/descrição e data)
        if ($request->has('priority') && !empty($request->priority)) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%$search%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%$search%"]);
            });
        }

        if ($request->has('due_date') && !empty($request->due_date)) {
            $query->whereDate('due_date', $request->due_date);
        }

        // ✅ Log para depuração
        Log::info("🔍 Buscando tarefas do usuário $user_id com filtros: ", $request->all());

        return response()->json($query->get());
    }
}
