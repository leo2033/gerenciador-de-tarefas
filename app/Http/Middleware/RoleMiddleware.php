<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role)
    {
        // Verifica se o usuário está autenticado
        if (!Auth::check()) {
            return response()->json(['error' => 'Não autenticado'], 401);
        }

        $user = Auth::user();

        // Verifica se o método hasRole existe antes de chamá-lo
        if (!method_exists($user, 'hasRole')) {
            return response()->json(['error' => 'Método hasRole() não encontrado no User model'], 500);
        }

        // Se o usuário não tem a role necessária, retorna erro
        if (!$user->hasRole($role)) {
            return response()->json(['error' => 'Acesso negado. Permissão insuficiente.'], 403);
        }

        return $next($request);
    }
}
