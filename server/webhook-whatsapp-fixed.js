const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

const LOG_FILE = process.env.WEBHOOK_LOG_FILE || path.join(__dirname, 'webhook.log');

function log(msg, level = 'info') {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}\n`;
  console.log(line.trim());
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch (e) {
    // ignore
  }
}

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fsnolvozwcnbyuradiru.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mi_token_secreto_123';
const SUPABASE_WEBHOOK_URL = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/whatsapp-webhook`;

// GET /webhook?ping=1 — prueba que el servidor recibe y que el reenvío a Supabase funciona
app.get('/webhook', (req, res) => {
  const ping = req.query.ping || req.query.health;
  if (ping === '1' || ping === 'true') {
    log('GET /webhook?ping=1 — ping local OK');
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      log('SUPABASE_SERVICE_ROLE_KEY no configurado, no se puede probar Supabase', 'warn');
      return res.status(200).json({ ok: true, source: 'local', supabase: 'skipped' });
    }
    axios
      .get(`${SUPABASE_WEBHOOK_URL}?ping=1`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        timeout: 10000,
      })
      .then((r) => {
        log('Supabase ping OK: ' + r.status);
        res.status(200).json({ ok: true, source: 'local', supabase: 'ok', status: r.status });
      })
      .catch((err) => {
        log('Supabase ping ERROR: ' + (err.message || err.response?.status), 'error');
        if (err.response) log({ status: err.response.status, data: err.response.data }, 'error');
        res.status(200).json({ ok: true, source: 'local', supabase: 'error', error: err.message });
      });
    return;
  }

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  log('Webhook verification: mode=' + mode + ' token=' + (token ? '***' : 'null'));

  if (mode === 'subscribe' && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    log('Webhook verificado exitosamente');
    res.status(200).send(challenge);
  } else {
    log('Verificación fallida', 'warn');
    res.status(403).send('Verification failed');
  }
});

// POST /webhook — eventos de WhatsApp (Meta)
app.post('/webhook', async (req, res) => {
  log('=== Webhook POST recibido ===');
  log('Headers: ' + JSON.stringify(req.headers, null, 2));

  try {
    const signature = req.headers['x-hub-signature-256'];
    const body = req.rawBody || JSON.stringify(req.body || {});

    log('Body length=' + body.length + ' signature=' + (signature ? 'yes' : 'no'));
    log('Body preview: ' + body.substring(0, 500));

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      log('SUPABASE_SERVICE_ROLE_KEY no configurado — no se reenvía a Supabase', 'warn');
      res.status(200).send('OK');
      return;
    }

    log('Reenviando a Supabase: ' + SUPABASE_WEBHOOK_URL);

    try {
      const response = await axios.post(SUPABASE_WEBHOOK_URL, body, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          ...(signature ? { 'x-hub-signature-256': signature } : {}),
        },
        timeout: 15000,
        validateStatus: () => true,
      });
      log('Supabase respuesta: status=' + response.status + ' data=' + JSON.stringify(response.data || {}).slice(0, 200));
      if (response.status >= 400) {
        log({ status: response.status, data: response.data }, 'error');
      }
    } catch (err) {
      log('Error reenviando a Supabase: ' + (err.message || err), 'error');
      if (err.response) {
        log('Response status=' + err.response.status + ' data=' + JSON.stringify(err.response.data), 'error');
      }
      if (err.code) log('Axios code: ' + err.code, 'error');
    }

    res.status(200).send('OK');
  } catch (e) {
    log('Error procesando webhook: ' + (e && e.message) + ' ' + (e && e.stack), 'error');
    res.status(200).send('OK');
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WhatsApp Webhook Server',
    logFile: LOG_FILE,
    endpoints: {
      webhook: '/webhook',
      ping: '/webhook?ping=1',
    },
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  log('WhatsApp Webhook Server running on port ' + PORT);
  log('Webhook URL: http://0.0.0.0:' + PORT + '/webhook');
  log('Log file: ' + LOG_FILE);
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    log('SUPABASE_SERVICE_ROLE_KEY no configurado — configura .env o variables de entorno', 'warn');
  }
});
