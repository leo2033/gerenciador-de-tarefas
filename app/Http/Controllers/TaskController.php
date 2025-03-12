<?php
namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
{
    $query = Task::where('user_id', auth()->id()); // Filtrar apenas as tarefas do usuário logado

    // Filtrar por prioridade
    if ($request->has('priority') && !empty($request->priority)) {
        $query->where('priority', $request->priority);
    }

    // Filtrar por data de vencimento
    if ($request->has('due_date') && !empty($request->due_date)) {
        $query->whereDate('due_date', $request->due_date);
    }

    // Filtrar por busca no título ou descrição
    if ($request->has('search') && !empty($request->search)) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%$search%")
              ->orWhere('description', 'like', "%$search%");
        });
    }

    // Retornar os resultados filtrados
    return response()->json($query->get());
}


    public function store(Request $request)
{
    try {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'required|date',
        ]);

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority,
            'due_date' => $request->due_date,
            'user_id' => auth()->id(),
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


    public function show($id)
    {
        $task = Task::where('user_id', auth()->id())->findOrFail($id);
        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = Task::where('user_id', auth()->id())->findOrFail($id);
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|required|in:low,medium,high',
            'due_date' => 'sometimes|required|date',
        ]);

        $task->update($request->all());
        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = Task::where('user_id', auth()->id())->findOrFail($id);
        $task->delete();
        return response()->json(null, 204);
    }
}