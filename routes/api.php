<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\HolidayController;

// Rota para feriados
Route::get('/holidays', [HolidayController::class, 'getHolidays']);

// 🔹 Rotas públicas com limitação de requisições
Route::middleware(['throttle:10,1'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetCode']);
    Route::post('/verify-code', [PasswordResetController::class, 'verifyCode']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

// 🔹 Grupo de rotas protegidas por autenticação JWT com rate limit
Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
    Route::post('/tasks/{id}/request-completion', [TaskController::class, 'requestCompletion']);
    Route::post('/tasks/{id}/review-completion', [TaskController::class, 'reviewCompletion'])->middleware('role:admin');

    // ✅ 🔹 Rota para obter informações do usuário logado
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ✅ 🔹 Rotas de tarefas (usuários comuns só podem acessar suas próprias tarefas)
    Route::prefix('/tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);
        Route::post('/', [TaskController::class, 'store']);
        Route::get('/{id}', [TaskController::class, 'show']);
        
        // Corrigindo a rota de atualização
        Route::put('/{id}', [TaskController::class, 'update']); // Corrigido para '/tasks/{id}'

        Route::delete('/{id}', [TaskController::class, 'destroy']);
    });

    // ✅ 🔹 Rotas para Administradores (acesso a todas as tarefas)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/tasks/user/{user_id}', [TaskController::class, 'tasksByUser']);
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});
