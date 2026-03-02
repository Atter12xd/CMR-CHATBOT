# Servidor - WhatsApp (Baileys / Contabo)

El proyecto ya **no usa** webhooks de Meta/Facebook ni PHP/Node para recibir mensajes de WhatsApp.

La integración WhatsApp se hace con **Baileys** en el **servidor Contabo**:

- **Dashboard (Vercel)** → llama al API del servidor Contabo para generar QR y estado.
- **Servidor Contabo** → corre Baileys (multi-sesión), recibe y envía mensajes, escribe en Supabase.

Ver el plan completo y el código del backend en la raíz del repo:

- **`integracionwazapp.md`** – arquitectura, flujo QR, API Contabo, despliegue y Nginx.

Variables de entorno en el frontend:

- `PUBLIC_BAILEYS_API_URL`: URL del API en Contabo (ej. `https://api.wazapp.ai` o `http://86.48.30.26:3001`).
