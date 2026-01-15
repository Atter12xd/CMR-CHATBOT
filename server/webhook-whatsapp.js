// Webhook handler para WhatsApp - Para usar en tu servidor
// Puede ser Node.js/Express, PHP, Python, etc.

// Este archivo es un ejemplo para Node.js/Express
// Si usas otro lenguaje, adapta la lógica

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

// Middleware para parsear JSON
app.use(express.json({ verify: (req, res, buf) => {
  req.rawBody = buf.toString('utf8');
}}));

// Configuración
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fsnolvozwcnbyuradiru.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mi_token_secreto_123';

// GET: Verificación del webhook (Meta envía esto)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification:', { mode, token: token ? '***' : null, challenge: challenge ? '***' : null });

  if (mode === 'subscribe' && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verificado exitosamente');
    res.status(200).send(challenge);
  } else {
    console.error('Verificación fallida:', { mode, tokenReceived: token ? '***' : null });
    res.status(403).send('Verification failed');
  }
});

// POST: Recibir eventos de WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const body = req.rawBody || JSON.stringify(req.body);

    console.log('Webhook POST recibido');
    console.log('Signature:', signature ? 'present' : 'missing');

    // Reenviar a Supabase Edge Function si está configurado
    if (SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
      
      try {
        const response = await axios.post(supabaseWebhookUrl, body, {
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            ...(signature && { 'x-hub-signature-256': signature }),
          },
        });

        console.log('Evento reenviado a Supabase:', response.status);
      } catch (error) {
        console.error('Error reenviando a Supabase:', error.message);
        // Continuar aunque falle el reenvío
      }
    }

    // Responder 200 OK a Meta (importante: siempre responder 200)
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(200).send('OK'); // Siempre responder 200 a Meta
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WhatsApp Webhook Server',
    endpoints: {
      webhook: '/webhook'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp Webhook Server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});
