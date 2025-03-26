<?php

namespace App\Repositories;

use App\Models\Task;
use App\Repositories\Interfaces\TaskRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Mail\AdminTaskActionMail;
use Illuminate\Support\Facades\Mail;
use App\Mail\TaskCompletionReviewedMail;

class TaskRepository implements TaskRepositoryInterface
{
    public function all()
    {
        return Task::all();
    }

    public function find(int $id)
    {
        return Task::findOrFail($id);
    }

    public function create(array $data)
    {
        return Task::create($data);
    }

    public function update(int $id, array $data)
    {
        $task = Task::findOrFail($id);
        $task->update($data);
        return $task;
    }

    public function delete(int $id)
    {
        return Task::destroy($id);
    }

    public function filterTasks(Request $request)
    {
        $user = Auth::user();
        $query = Task::with('user');

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        } elseif ($request->filled('user_id')) {
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

        return $query->get();
    }

    public function createTaskWithAuthUser(Request $request)
{
    $authUser = Auth::user();
    $userId = $authUser->role === 'admin' && $request->filled('user_id')
        ? $request->user_id
        : $authUser->id;

    $task = Task::create([
        'title' => $request->title,
        'description' => $request->description,
        'priority' => $request->priority,
        'due_date' => $request->due_date,
        'user_id' => $userId,
    ]);

    $task->load('user');

    if ($authUser->role === 'admin' && $userId !== $authUser->id) {
        Mail::to($task->user->email)->send(new AdminTaskActionMail($task, 'create', $authUser->name));
    }

    return $task;
}

public function findAuthorized(int $id)
{
    $task = Task::with('user')->find($id);

    if (!$task) {
        return null;
    }

    $user = Auth::user();

    if ($user->role !== 'admin' && $task->user_id !== $user->id) {
        return null;
    }

    return $task;
}

public function updateTaskWithAuthUser(int $id, Request $request)
{
    $task = Task::findOrFail($id);
    $authUser = Auth::user();

    if ($authUser->role !== 'admin' && $task->user_id !== $authUser->id) {
        return ['error' => 'Você não tem permissão para editar esta tarefa'];
    }

    if ($authUser->role === 'admin' && $request->filled('user_id')) {
        $task->user_id = $request->user_id;
    }

    $task->update($request->only(['title', 'description', 'priority', 'due_date']));
    $task->load('user');

    if ($authUser->role === 'admin' && $task->user_id !== $authUser->id) {
        Mail::to($task->user->email)->send(new AdminTaskActionMail($task, 'update', $authUser->name));
    }

    return ['task' => $task];
}

public function deleteTaskWithAuthUser(int $id)
{
    $task = Task::findOrFail($id);
    $authUser = Auth::user();

    if ($authUser->role !== 'admin' && $task->user_id !== $authUser->id) {
        return ['error' => 'Você não tem permissão para excluir esta tarefa'];
    }

    $task->load('user');
    $clone = clone $task; // clona antes de deletar

    $task->delete();

    if ($authUser->role === 'admin' && $clone->user_id !== $authUser->id) {
        Mail::to($clone->user->email)->send(new AdminTaskActionMail($clone, 'delete', $authUser->name));
    }

    return ['success' => true];
}

public function requestCompletion(int $id, Request $request)
{
    $task = Task::findOrFail($id);
    $authUserId = Auth::id();

    if ($task->user_id !== $authUserId) {
        return ['error' => 'Você não pode solicitar conclusão desta tarefa'];
    }

    $task->update([
        'completion_request' => true,
        'completion_comment' => $request->completion_comment,
    ]);

    return ['success' => true];
}
public function reviewCompletion(int $id, Request $request)
{
    $task = Task::findOrFail($id);
    $admin = Auth::user();

    if ($admin->role !== 'admin') {
        return ['error' => 'Apenas administradores podem revisar conclusões.'];
    }

    $task->update([
        'status' => $request->status,
        'completion_request' => false,
        'admin_comment' => $request->status === 'pendente' ? $request->admin_comment : null,
    ]);

    $task->load('user');

    Mail::to($task->user->email)->send(new TaskCompletionReviewedMail($task, $request->status));

    return ['task' => $task];
}

}
