<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function taskSummary(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso não autorizado'], 403);
        }

        $query = Task::query();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $pendentes = (clone $query)->where('status', 'pendente')->where('due_date', '>=', Carbon::today())->count();
        $concluidas = (clone $query)->where('status', 'concluida')->count();
        $vencidas = (clone $query)->where('status', 'pendente')->where('due_date', '<', Carbon::today())->count();

        return response()->json([
            'pendentes' => $pendentes,
            'concluidas' => $concluidas,
            'vencidas' => $vencidas,
        ]);
    }
}
