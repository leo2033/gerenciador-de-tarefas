<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Notificação de Tarefa</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f8f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <h2 style="color: #333;">Olá {{ $task->user->name }},</h2>

        @if ($action === 'create')
            <p style="font-size: 16px;">O administrador <strong>{{ $adminName }}</strong> criou uma nova tarefa para você:</p>
        @elseif ($action === 'update')
            <p style="font-size: 16px;">O administrador <strong>{{ $adminName }}</strong> atualizou uma das suas tarefas:</p>
        @elseif ($action === 'delete')
            <p style="font-size: 16px;">O administrador <strong>{{ $adminName }}</strong> excluiu uma das suas tarefas:</p>
        @endif

        @if ($action !== 'delete')
            <ul style="font-size: 16px; line-height: 1.6;">
                <li><strong>Título:</strong> {{ $task->title }}</li>
                <li><strong>Descrição:</strong> {{ $task->description }}</li>
                <li><strong>Prioridade:</strong> {{ ucfirst($task->priority) }}</li>
                <li><strong>Data de vencimento:</strong> {{ \Carbon\Carbon::parse($task->due_date)->format('d/m/Y') }}</li>
            </ul>
        @else
            <p style="font-size: 16px;"><strong>Título da tarefa excluída:</strong> {{ $task->title }}</p>
        @endif

        <p style="margin-top: 30px; font-size: 14px; color: #777;">Atenciosamente,<br>Equipe do Gerenciador de Tarefas</p>
    </div>
</body>
</html>
