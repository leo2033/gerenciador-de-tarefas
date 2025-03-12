<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
