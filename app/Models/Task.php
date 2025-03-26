<?php
/**
 * App\Models\User
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User create(array $attributes = [])
 * @method static \Illuminate\Database\Eloquent\Builder|User find($id)
 */

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
        'user_id',
        'status',
        'completion_request',
        'completion_comment',
        'admin_comment',
    ];

    /**
     * Relacionamento: Uma tarefa pertence a um usuário.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
