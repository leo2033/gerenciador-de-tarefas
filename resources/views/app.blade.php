<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>React Laravel</title>
    @viteReactRefresh
    @vite(['resources/js/app.jsx']) {{-- Garante que o React é compilado --}}
</head>
<body>
    <div id="root"></div>
</body>
</html>
