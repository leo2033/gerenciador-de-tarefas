<!-- resources/views/emails/task-completion-reviewed.blade.php -->

<p>Olá, {{ $task->user->name }}!</p>

@if ($status === 'concluida')
    <p>Sua solicitação de conclusão da tarefa <strong>{{ $task->title }}</strong> foi aprovada.</p>
@else
    <p>Sua solicitação de conclusão da tarefa <strong>{{ $task->title }}</strong> foi recusada.</p>
    @if ($task->admin_comment)
        <p><strong>Justificativa do administrador:</strong> {{ $task->admin_comment }}</p>
    @endif
@endif
