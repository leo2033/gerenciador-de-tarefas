<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;

class PasswordResetController extends Controller
{
    /**
     * Envia um código de verificação para o e-mail do usuário.
     */
    public function sendResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $email = $request->input('email');
        $code = random_int(100000, 999999);

        DB::table('password_resets')->updateOrInsert(
            ['email' => $email],
            ['token' => $code, 'created_at' => now()]
        );

        Mail::raw("Seu código de recuperação de senha é: $code", function ($message) use ($email) {
            $message->to($email)
                    ->subject('Código de Recuperação de Senha');
        });

        return response()->json(['message' => 'Código enviado para seu e-mail.']);
    }

    /**
     * Verifica se o código informado é válido.
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|integer'
        ]);

        $email = $request->input('email');
        $code = $request->input('code');

        $record = DB::table('password_resets')
                    ->where('email', $email)
                    ->first();

        if (!$record || $record->token != $code) {
            return response()->json(['error' => 'Código inválido.'], 422);
        }

        return response()->json(['message' => 'Código verificado com sucesso.']);
    }

    /**
     * Permite redefinir a senha caso o código seja válido.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|exists:password_resets,token',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
            ],
        ]);

        $email = $request->input('email');
        $code = $request->input('code');
        $newPassword = $request->input('password');

        $record = DB::table('password_resets')
                    ->where('email', $email)
                    ->where('token', $code)
                    ->first();

        if (!$record) {
            return response()->json(['error' => 'Código inválido.'], 422);
        }

        $user = User::query()->where('email', $email)->first();
        $user->password = Hash::make($newPassword);
        $user->save();

        DB::table('password_resets')->where('email', $email)->delete();

        return response()->json(['message' => 'Senha redefinida com sucesso.']);
    }
}
