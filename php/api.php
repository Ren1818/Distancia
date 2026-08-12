<?php
// php/api.php - endpoint mínimo (Fase 1). Mantener seguro y simple.
// Útil para futuras funciones: guardar mensajes, analytics simples, etc.

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
if($method === 'GET'){
    echo json_encode([ 'status' => 'ok', 'message' => 'API mínima disponible' ]);
    exit;
}

http_response_code(405);
echo json_encode([ 'status' => 'error', 'message' => 'Method not allowed' ]);
