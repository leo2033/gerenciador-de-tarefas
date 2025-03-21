<h1>Lembrete de Tarefa</h1>
<p>Olá, {{ $task->user->name }}!</p>

<p>A tarefa <strong>"{{ $task->title }}"</strong> está com vencimento para <strong>{{ \Carbon\Carbon::parse($task->due_date)->format('d/m/Y') }}</strong>.</p>

<p>Não se esqueça de concluí-la!</p>

<p>— Gerenciador de Tarefas</p>
