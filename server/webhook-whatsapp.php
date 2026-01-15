<?php
// Webhook handler para WhatsApp - Versión PHP
// Para usar en servidor con PHP

// Configuración
$SUPABASE_URL = getenv('SUPABASE_URL') ?: 'https://fsnolvozwcnbyuradiru.supabase.co';
$SUPABASE_SERVICE_ROLE_KEY = getenv('SUPABASE_SERVICE_ROLE_KEY');
$WHATSAPP_WEBHOOK_VERIFY_TOKEN = getenv('WHATSAPP_WEBHOOK_VERIFY_TOKEN') ?: 'mi_token_secreto_123';

// GET: Verificación del webhook (Meta envía esto)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mode = $_GET['hub.mode'] ?? null;
    $token = $_GET['hub.verify_token'] ?? null;
    $challenge = $_GET['hub.challenge'] ?? null;

    error_log("Webhook verification: mode=$mode, token=" . ($token ? '***' : 'null'));

    if ($mode === 'subscribe' && $token === $WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
        error_log('Webhook verificado exitosamente');
        http_response_code(200);
        header('Content-Type: text/plain');
        echo $challenge;
        exit;
    } else {
        error_log('Verificación fallida');
        http_response_code(403);
        header('Content-Type: text/plain');
        echo 'Verification failed';
        exit;
    }
}

// POST: Recibir eventos de WhatsApp
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? null;
    $body = file_get_contents('php://input');
    
    error_log('Webhook POST recibido');
    error_log('Signature: ' . ($signature ? 'present' : 'missing'));

    // Reenviar a Supabase Edge Function si está configurado
    if ($SUPABASE_SERVICE_ROLE_KEY) {
        $supabaseWebhookUrl = "$SUPABASE_URL/functions/v1/whatsapp-webhook";
        
        $ch = curl_init($supabaseWebhookUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $SUPABASE_SERVICE_ROLE_KEY,
            'apikey: ' . $SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type: application/json',
            ...($signature ? ['x-hub-signature-256: ' . $signature] : []),
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        error_log("Evento reenviado a Supabase: HTTP $httpCode");
    }

    // Responder 200 OK a Meta (importante: siempre responder 200)
    http_response_code(200);
    header('Content-Type: text/plain');
    echo 'OK';
    exit;
}

// Health check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['hub.mode'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'message' => 'WhatsApp Webhook Server',
        'endpoints' => [
            'webhook' => '/webhook-whatsapp.php'
        ]
    ]);
    exit;
}
