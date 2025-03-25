<h2>Olá {{ $task->user->name }},</h2>

@if ($status === 'concluida')
    <p>A tarefa <strong>"{{ $task->title }}"</strong> foi marcada como <strong>concluída</strong> pelo administrador {{ $adminName }}.</p>
@else
    <p>Sua solicitação de conclusão da tarefa <strong>"{{ $task->title }}"</strong> foi <strong>recusada</strong> pelo administrador {{ $adminName }}.</p>
    @if($task->admin_comment)
        <p><strong>Motivo:</strong> {{ $task->admin_comment }}</p>
    @endif
@endif

<p>Atenciosamente,<br>Equipe do Gerenciador de Tarefas</p>
