<?php

namespace App\Http\Controllers;

use App\Mail\AdminTaskActionMail;
use App\Mail\TaskCompletionReviewedMail;
use App\Repositories\Interfaces\TaskRepositoryInterface;
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
    protected TaskRepositoryInterface $taskRepository;

    public function __construct(TaskRepositoryInterface $taskRepository)
    {
        $this->taskRepository = $taskRepository;
    }

    private function isHoliday(string $date): bool
    {
        $year = date('Y', strtotime($date));
        $response = Http::get("https://brasilapi.com.br/api/feriados/v1/{$year}");

        if ($response->failed()) {
            return false;
        }

        return collect($response->json())->contains('date', $date);
    }

    public function index(Request $request)
    {
        return response()->json($this->taskRepository->filterTasks($request));
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

        $task = $this->taskRepository->createTaskWithAuthUser($request);

        return response()->json(['success' => true, 'task' => $task], 201);
    }

    public function show($id)
    {
        $task = $this->taskRepository->findAuthorized($id);

        if (!$task) return response()->json(['error' => 'Acesso negado'], 403);

        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
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

        $updated = $this->taskRepository->updateTaskWithAuthUser($id, $request);

        if (isset($updated['error'])) {
            return response()->json(['error' => $updated['error']], 403);
        }

        return response()->json($updated['task']);
    }

    public function destroy($id)
    {
        $result = $this->taskRepository->deleteTaskWithAuthUser($id);

        if (isset($result['error'])) {
            return response()->json(['error' => $result['error']], 403);
        }

        return response()->json(['message' => 'Tarefa excluída com sucesso']);
    }

    public function requestCompletion(Request $request, $id)
    {
        $request->validate([
            'completion_comment' => 'required|string|min:3',
        ]);

        $result = $this->taskRepository->requestCompletion($id, $request);

        if (isset($result['error'])) {
            return response()->json(['error' => $result['error']], 403);
        }

        return response()->json(['success' => true, 'message' => 'Solicitação de conclusão enviada com sucesso.']);
    }

    public function reviewCompletion(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:concluida,pendente',
            'admin_comment' => 'nullable|string',
        ]);

        $result = $this->taskRepository->reviewCompletion($id, $request);

        if (isset($result['error'])) {
            return response()->json(['error' => $result['error']], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Revisão de conclusão realizada.',
            'task' => $result['task']
        ]);
    }
}
