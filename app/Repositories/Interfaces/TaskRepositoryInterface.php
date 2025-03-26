<?php

namespace App\Repositories\Interfaces;

use Illuminate\Http\Request;

interface TaskRepositoryInterface
{
    public function all();
    public function find(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);

    public function filterTasks(Request $request);
    public function createTaskWithAuthUser(Request $request);
    public function findAuthorized(int $id);
    public function updateTaskWithAuthUser(int $id, Request $request);
    public function deleteTaskWithAuthUser(int $id);
    public function requestCompletion(int $id, Request $request);
    public function reviewCompletion(int $id, Request $request);
}
