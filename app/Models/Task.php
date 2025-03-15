<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'priority',
        'due_date',
        'user_id'
    ];

    /**
     * Relacionamento: Uma tarefa pertence a um usuário.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
