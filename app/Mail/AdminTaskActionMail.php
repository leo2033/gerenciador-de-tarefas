<?php

namespace App\Mail;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminTaskActionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $task;
    public $action;
    public $adminName;

    /**
     * Cria uma nova instância da mensagem.
     */
    public function __construct(Task $task, string $action, string $adminName)
    {
        $this->task = $task;
        $this->action = $action;
        $this->adminName = $adminName;
    }

    /**
     * Constrói o e-mail com base na ação.
     */
    public function build()
    {
        $subject = match ($this->action) {
            'create' => 'Uma nova tarefa foi criada para você!',
            'update' => 'Sua tarefa foi atualizada por um administrador!',
            'delete' => 'Uma de suas tarefas foi excluída por um administrador!',
            default => 'Notificação sobre sua tarefa',
        };

        return $this->subject($subject)
                    ->view('emails.admin-task-action');
    }
}
