<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // Adicione os campos permitidos no $fillable
    protected $fillable = [
        'title',
        'description',
        'priority',
        'due_date',
        'user_id'  // Certifique-se de incluir o user_id se estiver sendo salvo
    ];
}
