<?php

namespace App\Mail;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskCompletionReviewedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $task;
    public $status;

    /**
     * Create a new message instance.
     */
    public function __construct(Task $task, string $status)
    {
        $this->task = $task;
        $this->status = $status;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->status === 'concluida'
            ? 'Sua solicitação de conclusão foi aprovada!'
            : 'Sua solicitação de conclusão foi recusada.';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.task-completion-reviewed',
            with: [
                'task' => $this->task,
                'status' => $this->status
            ]
        );
    }
}