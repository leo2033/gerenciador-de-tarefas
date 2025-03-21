<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminTaskActionMail;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Task::query();

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        if ($user->role === 'admin' && $request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

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

        Log::info('📌 Parâmetros de busca:', $request->all());

        return response()->json($query->with('user')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'required|date|after_or_equal:today',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $authUser = auth()->user();
        $userId = $authUser->role === 'admin' && $request->has('user_id')
            ? $request->user_id
            : $authUser->id;

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority,
            'due_date' => $request->due_date,
            'user_id' => $userId,
        ]);

        if ($authUser->role === 'admin' && $userId !== $authUser->id) {
            Mail::to($task->user->email)->send(new AdminTaskActionMail($task, 'create', $authUser->name));
        }

        return response()->json(['success' => true, 'task' => $task], 201);
    }

    public function show($id)
    {
        $task = Task::with('user')->findOrFail($id);

        if (auth()->user()->role !== 'admin' && $task->user_id !== auth()->id()) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $authUser = auth()->user();

        if ($authUser->role !== 'admin' && $task->user_id !== $authUser->id) {
            return response()->json(['error' => 'Você não tem permissão para editar esta tarefa'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|required|in:low,medium,high',
            'due_date' => 'sometimes|required|date|after_or_equal:today',
            'user_id' => 'nullable|exists:users,id'
        ]);

        if ($authUser->role === 'admin' && $request->has('user_id')) {
            $task->user_id = $request->user_id;
        }

        $task->update($request->only(['title', 'description', 'priority', 'due_date']));

        if ($authUser->role === 'admin' && $task->user_id !== $authUser->id) {
            Mail::to($task->user->email)->send(new AdminTaskActionMail($task, 'update', $authUser->name));
        }

        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $authUser = auth()->user();

        if ($authUser->role !== 'admin' && $task->user_id !== $authUser->id) {
            return response()->json(['error' => 'Você não tem permissão para excluir esta tarefa'], 403);
        }

        $owner = $task->user;
        $clone = clone $task;

        $task->delete();

        if ($authUser->role === 'admin' && $owner->id !== $authUser->id) {
            Mail::to($owner->email)->send(new AdminTaskActionMail($clone, 'delete', $authUser->name));
        }

        return response()->json(['message' => 'Tarefa excluída com sucesso']);
    }

    public function tasksByUser($user_id, Request $request)
    {
        $authUser = auth()->user();

        if ($authUser->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        if (!User::find($user_id)) {
            return response()->json(['error' => 'Usuário não encontrado'], 404);
        }

        $query = Task::where('user_id', $user_id);

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

        Log::info("🔍 Buscando tarefas do usuário $user_id com filtros: ", $request->all());

        return response()->json($query->get());
    }
}
