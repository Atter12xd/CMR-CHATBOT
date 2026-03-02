# Setup Baileys (WhatsApp) + siguientes pasos

## Lo que ya está hecho

### 1. Proyecto y código
- **Backend Baileys** en la carpeta `wazapp-baileys/` del repo: Node.js + Express + Baileys, multi-sesión por organización.
- **Dashboard (front):** integración con el API de Baileys: flujo “Generar QR y conectar” en Configuración, sin Meta/Facebook.
- **Servicio front** `src/services/whatsapp-baileys.ts`: llama a `POST /api/whatsapp/qr/generate`, `GET /api/whatsapp/qr/status/:clientId`, `POST /api/whatsapp/qr/disconnect`.

### 2. Base de datos (Supabase)
- Migración ejecutada: tabla `whatsapp_sessions` y columna opcional `organizations.whatsapp_client_id`.
- El backend escribe en `whatsapp_sessions` al conectar; el dashboard sigue usando `whatsapp_integrations` para mostrar estado.

### 3. Servidor Contabo (86.48.30.26)
- Código en `/root/wazapp-baileys/` con `.env` (PORT, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY).
- `npm install`, `npm run build`, servicio systemd **wazapp-baileys** activo.
- El API responde en **http://86.48.30.26:3001** (health, QR generate, status, disconnect).

### 4. Bloqueo actual en el navegador
- La página del dashboard es **HTTPS** (https://www.wazapp.ai/configuracion).
- El API está en **HTTP** (http://86.48.30.26:3001).
- El navegador bloquea esas peticiones (**Mixed Content**), por eso sale “Failed to fetch” al generar el QR.

---

## Siguientes pasos (para desbloquear el QR)

Para que el dashboard pueda llamar al API sin Mixed Content, el API debe servirse por **HTTPS** en un subdominio, por ejemplo **api.wazapp.ai**.

### Paso 1: DNS (quien tenga GoDaddy / el dominio wazapp.ai)

En el panel del dominio **wazapp.ai** (GoDaddy u otro), crear un registro:

| Tipo | Nombre  | Valor        | TTL  |
|------|---------|-------------|------|
| A    | `api`   | 86.48.30.26 | 600  |

Resultado: **api.wazapp.ai** → IP del servidor Contabo.

(Esperar unos minutos a que propague el DNS.)

---

### Paso 2: Nginx + SSL en el servidor Contabo

Conectar por SSH al servidor y ejecutar:

```bash
# Instalar Nginx y Certbot (si no están)
apt update && apt install -y nginx certbot python3-certbot-nginx

# Crear sitio para el API
nano /etc/nginx/sites-available/wazapp-api
```

Pegar este contenido y guardar:

```nginx
server {
    listen 80;
    server_name api.wazapp.ai;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar sitio y obtener certificado HTTPS:

```bash
ln -sf /etc/nginx/sites-available/wazapp-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d api.wazapp.ai
```

(Seguir las preguntas de certbot: email, aceptar términos. Certbot configurará HTTPS automáticamente.)

Comprobar:

```bash
curl -s https://api.wazapp.ai/health
```

Debe devolver algo como: `{"status":"ok","sessions":0,"timestamp":"..."}`

---

### Paso 3: Variable de entorno en el dashboard (Vercel)

En el proyecto de Vercel donde está desplegado **wazapp.ai**:

- **Variables de entorno:**
  - Nombre: `PUBLIC_BAILEYS_API_URL`
  - Valor: `https://api.wazapp.ai`
- Guardar y **redeploy** del proyecto.

---

### Paso 4: Probar en el dashboard

1. Entrar a **https://www.wazapp.ai/configuracion**
2. Ir a la sección de WhatsApp y pulsar **“Generar QR y conectar”**
3. Debería mostrarse el QR sin “Failed to fetch”; escanear con WhatsApp (Vincular dispositivo)
4. Al conectar, el dashboard debería mostrar “WhatsApp conectado”

---

## Resumen de URLs y servicios

| Qué              | Dónde / URL |
|------------------|-------------|
| Dashboard        | https://www.wazapp.ai (Vercel) |
| API Baileys (objetivo) | https://api.wazapp.ai (Nginx → Node en :3001) |
| API Baileys (actual, solo HTTP) | http://86.48.30.26:3001 |
| Servicio en servidor | `systemctl status wazapp-baileys` |
| Logs del backend | `journalctl -u wazapp-baileys -f` |

---

## Mensaje sugerido para el supervisor (DNS)

Puedes enviar algo así a quien tenga la cuenta de GoDaddy:

> Hola, para terminar la integración de WhatsApp en wazapp.ai necesito que en el DNS del dominio **wazapp.ai** agregues un registro tipo **A**:
> - **Nombre/host:** api  
> - **Valor/apunta a:** 86.48.30.26  
> - **TTL:** por defecto  
> Con eso quedará configurado **api.wazapp.ai** para el servidor. Gracias.

---

*Documento generado a partir del setup realizado. Si algo falla (certbot, Nginx, CORS), revisar logs con `journalctl -u wazapp-baileys -f` en el servidor.*
