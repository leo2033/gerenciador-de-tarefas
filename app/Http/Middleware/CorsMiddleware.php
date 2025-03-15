<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $headers = [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Authorization, Content-Type, Accept',
        ];

        // Trata requisições OPTIONS (preflight)
        if ($request->isMethod('OPTIONS')) {
            return response()->json(['message' => 'CORS OK'], Response::HTTP_OK, $headers);
        }

        $response = $next($request);

        // Adiciona os cabeçalhos à resposta usando $response->headers->set()
        foreach ($headers as $key => $value) {
            if (!$response->headers->has($key)) { // Verifica se o cabeçalho já não foi definido
                $response->headers->set($key, $value);
            }
        }

        return $response;
    }
}