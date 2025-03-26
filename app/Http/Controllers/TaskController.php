<?php

namespace App\Http\Controllers;

use App\Mail\AdminTaskActionMail;
use App\Mail\TaskCompletionReviewedMail;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

/**
 * @OA\Tag(
 *     name="Tarefas",
 *     description="Gerenciamento de tarefas para usuários e administradores"
 * )
 */
class TaskController extends Controller
{
    private function isHoliday(string $date): bool
    {
        $year = date('Y', strtotime($date));
        $response = Http::get("https://brasilapi.com.br/api/feriados/v1/{$year}");

        if ($response->failed()) return false;

        return collect($response->json())->contains('date', $date);
    }

    /**
     * @OA\Get(
     *     path="/api/tasks",
     *     summary="Listar tarefas",
     *     tags={"Tarefas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="priority", in="query", required=false, description="Filtrar por prioridade"),
     *     @OA\Parameter(name="search", in="query", required=false, description="Buscar por título ou descrição"),
     *     @OA\Parameter(name="due_date", in="query", required=false, description="Filtrar por data de vencimento"),
     *     @OA\Parameter(name="user_id", in="query", required=false, description="Filtrar por ID do usuário (apenas admin)"),
     *     @OA\Response(response=200, description="Lista de tarefas")
     * )
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Task::with('user');

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('due_date')) {
            $query->whereDate('due_date', $request->input('due_date'));
        }

        return response()->json($query->get());
    }

    /**
     * @OA\Post(
     *     path="/api/tasks",
     *     summary="Criar tarefa",
     *     tags={"Tarefas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title","priority","due_date"},
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="priority", type="string"),
     *             @OA\Property(property="due_date", type="string"),
     *             @OA\Property(property="user_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tarefa criada"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'required|date|after_or_equal:today',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($this->isHoliday($validated['due_date'])) {
            return response()->json(['error' => 'Não é possível criar tarefas em feriados.'], 422);
        }

        $authUser = auth()->user();
        $userId = $authUser->role === 'admin' && isset($validated['user_id'])
            ? $validated['user_id']
            : $authUser->id;

        $task = Task::create(array_merge($validated, ['user_id' => $userId]));

        if ($authUser->role === 'admin' && $userId !== $authUser->id) {
            Mail::to($task->user->email)->send(new AdminTaskActionMail($task, 'create', $authUser->name));
        }

        return response()->json(['success' => true, 'task' => $task], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/tasks/{id}",
     *     summary="Exibir tarefa",
     *     tags={"Tarefas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="ID da tarefa"),
     *     @OA\Response(response=200, description="Tarefa encontrada"),
     *     @OA\Response(response=403, description="Acesso negado")
     * )
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
     * @OA\Put(
     *     path="/api/tasks/{id}",
     *     summary="Atualizar tarefa",
     *     tags={"Tarefas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="ID da tarefa"),
     *     @OA\RequestBody(@OA\JsonContent(
     *         @OA\Property(property="title", type="string"),
     *         @OA\Property(property="description", type="string"),
     *         @OA\Property(property="priority", type="string"),
     *         @OA\Property(property="due_date", type="string"),
     *         @OA\Property(property="user_id", type="integer")
     *     )),
     *     @OA\Response(response=200, description="Tarefa atualizada"),
     *     @OA\Response(response=403, description="Acesso negado")
     * )
     */
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $authUser = auth()->user();

        if ($authUser->role !== 'admin' && $task->user_id !== $authUser->id) {
            return response()->json(['error' => 'Você não tem permissão para editar esta tarefa'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|required|in:low,medium,high',
            'due_date' => 'sometimes|required|date|after_or_equal:today',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if (isset($validated['due_date']) && $this->isHoliday($validated['due_date'])) {
            return response()->json(['error' => 'Não é possível agendar tarefas para um feriado.'], 422);
        }

        if ($authUser->role === 'admin' && isset($validated['user_id'])) {
            $task->user_id = $validated['user_id'];
        }

        $task->update($validated);

        if ($authUser->role === 'admin' && $task->user_id !== $authUser->id) {
            Mail::to($task->user->email)->send(new AdminTaskActionMail($task, 'update', $authUser->name));
        }

        return response()->json($task);
    }

    /**
     * @OA\Delete(
     *     path="/api/tasks/{id}",
     *     summary="Excluir tarefa",
     *     tags={"Tarefas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="ID da tarefa"),
     *     @OA\Response(response=200, description="Tarefa excluída"),
     *     @OA\Response(response=403, description="Acesso negado")
     * )
     */
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
}