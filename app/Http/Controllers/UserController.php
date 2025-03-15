<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Retorna a lista de usuários (somente para administradores).
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado. Apenas administradores podem listar usuários.'], 403);
        }

        // Retorna somente ID e nome para evitar exposição desnecessária de dados
        return response()->json(User::select('id', 'name')->get());
    }

    /**
     * Retorna os detalhes de um usuário específico (somente para administradores).
     */
    public function show($id)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado. Apenas administradores podem visualizar detalhes de usuários.'], 403);
        }

        $userData = User::find($id);

        if (!$userData) {
            return response()->json(['error' => 'Usuário não encontrado.'], 404);
        }

        return response()->json($userData);
    }

    /**
     * Atualiza os dados de um usuário (somente para administradores).
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado. Apenas administradores podem editar usuários.'], 403);
        }

        $userData = User::find($id);

        if (!$userData) {
            return response()->json(['error' => 'Usuário não encontrado.'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'sometimes|required|in:user,admin',
        ]);

        $userData->update($request->all());

        return response()->json(['message' => 'Usuário atualizado com sucesso.', 'user' => $userData]);
    }

    /**
     * Exclui um usuário (somente para administradores).
     */
    public function destroy($id)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado. Apenas administradores podem excluir usuários.'], 403);
        }

        $userData = User::find($id);

        if (!$userData) {
            return response()->json(['error' => 'Usuário não encontrado.'], 404);
        }

        $userData->delete();

        return response()->json(['message' => 'Usuário excluído com sucesso.']);
    }
}
