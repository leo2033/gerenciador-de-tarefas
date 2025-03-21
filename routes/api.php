<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PasswordResetController;


Route::post('/forgot-password', [PasswordResetController::class, 'sendResetCode']);
Route::post('/verify-code', [PasswordResetController::class, 'verifyCode']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetCode']);
Route::post('/verify-code', [PasswordResetController::class, 'verifyCode']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);


// 🔹 Rotas de autenticação
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 🔹 Grupo de rotas protegidas por autenticação JWT
Route::middleware(['auth:api'])->group(function () {
    
    // ✅ 🔹 Rota para obter informações do usuário logado
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ✅ 🔹 Rotas de tarefas (usuários comuns só podem acessar suas próprias tarefas)
    Route::prefix('/tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);   // Lista as tarefas do usuário logado
        Route::post('/', [TaskController::class, 'store']);  // Criar nova tarefa
        Route::get('/{id}', [TaskController::class, 'show']); // Ver uma tarefa específica
        Route::put('/{id}', [TaskController::class, 'update']); // Editar uma tarefa
        Route::delete('/{id}', [TaskController::class, 'destroy']); // Excluir tarefa
    });

    // ✅ 🔹 Rotas para Administradores (acesso a todas as tarefas)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/tasks/user/{user_id}', [TaskController::class, 'tasksByUser']); // Tarefas por usuário
        Route::get('/users', [UserController::class, 'index']); // Listar todos os usuários
        Route::get('/users/{id}', [UserController::class, 'show']); // Ver detalhes de um usuário
        Route::put('/users/{id}', [UserController::class, 'update']); // Atualizar usuário
        Route::delete('/users/{id}', [UserController::class, 'destroy']); // Deletar usuário
    });
});
