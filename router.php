<?php
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

if (preg_match('/\.(css|js|jpg|png|gif|ico|svg)$/i', $path)) {
    return false;
}

switch (true) {
    case $path === '/':
        include __DIR__ . '/pages/index.html';
        break;
    case $path === '/wishlist':
        include __DIR__ . '/pages/wishList.html';
        break;
    case strpos($path, '/pages/book') === 0:
        include __DIR__ . '/pages/book.html';
        break;
    default:
        http_response_code(404);
        include __DIR__ . '/pages/404.html';
        break;
}