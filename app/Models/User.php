<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Verifica se o usuário tem um determinado papel.
     */
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    /**
     * Relacionamento: Um usuário pode ter muitas tarefas.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'user_id');
    }
}
