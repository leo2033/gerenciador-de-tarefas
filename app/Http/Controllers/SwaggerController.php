<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Gerenciador de Tarefas - API",
 *     version="1.0.0",
 *     description="Documentação da API para gerenciamento de tarefas.",
 *     @OA\Contact(
 *         email="seuemail@dominio.com",
 *         name="Seu Nome"
 *     )
 * )
 * 
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Servidor da API"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
class SwaggerController extends Controller
{
    // Apenas para carregar as anotações Swagger globais
}
