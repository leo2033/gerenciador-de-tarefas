<?php

namespace App\Http\Controllers;

use App\Mail\AdminTaskActionMail;
use App\Mail\TaskCompletionReviewedMail;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class TaskController extends Controller
{
    /**
     * Verifica se a data é um feriado nacional via BrasilAPI
     */
    private function isHoliday(string $date): bool
    {
        $year = date('Y', strtotime($date));
        $response = Http::get("https://brasilapi.com.br/api/feriados/v1/{$year}");

        if ($response->failed()) return false;

        return collect($response->json())->contains('date', $date);
    }

    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Task::with('user');

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        if ($user->role === 'admin' && $request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('due_date')) {
            $query->whereDate('due_date', $request->due_date);
        }

        return response()->json($query->get());
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

        if ($this->isHoliday($request->due_date)) {
            return response()->json(['error' => 'Não é possível criar tarefas em feriados.'], 422);
        }

        $authUser = auth()->user();
        $userId = $authUser->role === 'admin' && $request->filled('user_id') ? $request->user_id : $authUser->id;

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
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($request->filled('due_date') && $this->isHoliday($request->due_date)) {
            return response()->json(['error' => 'Não é possível agendar tarefas para um feriado.'], 422);
        }

        if ($authUser->role === 'admin' && $request->filled('user_id')) {
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

        $clone = clone $task;
        $owner = $task->user;

        $task->delete();

        if ($authUser->role === 'admin' && $owner->id !== $authUser->id) {
            Mail::to($owner->email)->send(new AdminTaskActionMail($clone, 'delete', $authUser->name));
        }

        return response()->json(['message' => 'Tarefa excluída com sucesso']);
    }

    public function tasksByUser($user_id, Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        if (!User::find($user_id)) {
            return response()->json(['error' => 'Usuário não encontrado'], 404);
        }

        $query = Task::where('user_id', $user_id);

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('due_date')) {
            $query->whereDate('due_date', $request->due_date);
        }

        return response()->json($query->get());
    }

    public function requestCompletion(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        if ($task->user_id !== auth()->id()) {
            return response()->json(['error' => 'Você não pode solicitar conclusão desta tarefa'], 403);
        }

        $request->validate([
            'completion_comment' => 'required|string|min:3',
        ]);

        $task->update([
            'completion_request' => true,
            'completion_comment' => $request->completion_comment,
        ]);

        return response()->json(['success' => true, 'message' => 'Solicitação de conclusão enviada com sucesso.']);
    }

    // No TaskController, adicione logging mais detalhado
public function reviewCompletion(Request $request, $id)
{
    \Log::info('Revisão de conclusão iniciada', [
        'task_id' => $id,
        'status' => $request->status
    ]);

    try {
        $task = Task::findOrFail($id);
        $admin = auth()->user();
    
        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Apenas administradores podem revisar conclusões.'], 403);
        }
    
        $request->validate([
            'status' => 'required|in:concluida,pendente',
            'admin_comment' => 'nullable|string',
        ]);
    
        $task->update([
            'status' => $request->status,
            'completion_request' => false,
            'admin_comment' => $request->status === 'pendente' ? $request->admin_comment : null,
        ]);
    
        // Debug completo antes de enviar e-mail
        \Log::info('Preparando envio de e-mail', [
            'task_id' => $task->id,
            'user_email' => $task->user->email,
            'user_name' => $task->user->name
        ]);

        try {
            Mail::to($task->user->email)->send(new TaskCompletionReviewedMail($task, $request->status));
            \Log::info('E-mail enviado com sucesso');
        } catch (\Exception $e) {
            \Log::error('Erro no envio de e-mail', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    
        return response()->json([
            'success' => true, 
            'message' => 'Revisão de conclusão realizada.', 
            'task' => $task
        ]);
    } catch (\Exception $e) {
        \Log::error('Erro na revisão de conclusão', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Erro interno do servidor', 
            'message' => $e->getMessage()
        ], 500);
    }
}
}
