<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Mail;
use App\Models\Task;
use App\Mail\TaskDueSoonMail;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->call(function () {
            $tomorrow = now()->addDay()->toDateString();

            $tasks = Task::with('user')
                ->whereDate('due_date', $tomorrow)
                ->get();

            foreach ($tasks as $task) {
                Mail::to($task->user->email)->send(new TaskDueSoonMail($task));
            }
        })->dailyAt('08:00'); // Executa diariamente às 8h
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
