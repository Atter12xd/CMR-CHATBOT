# 📱 Guía de Usuario - Integración WhatsApp Business

## Bienvenido al Sistema de Chat CMR

Esta guía te ayudará a conectar tu número de WhatsApp Business y comenzar a gestionar tus conversaciones de forma profesional.

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Conexión de WhatsApp](#conexión-de-whatsapp)
3. [Gestión de Conversaciones](#gestión-de-conversaciones)
4. [Envío de Mensajes](#envío-de-mensajes)
5. [Métricas y Análisis](#métricas-y-análisis)
6. [Solución de Problemas](#solución-de-problemas)

---

## 📌 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Una cuenta de WhatsApp Business API (no la app regular de WhatsApp Business)
- ✅ Un número de teléfono dedicado para WhatsApp Business
- ✅ Acceso a Meta Business Manager
- ✅ Tu organización creada en CMR Chatbot

### ¿Qué es WhatsApp Business API?

WhatsApp Business API es la versión empresarial de WhatsApp que permite:
- Gestionar múltiples agentes
- Integración con sistemas CRM
- Automatización con bots
- Envío de notificaciones y actualizaciones

**⚠️ Importante**: La app WhatsApp Business (verde) no es lo mismo que WhatsApp Business API. Necesitas WhatsApp Business API.

---

## 🔗 Conexión de WhatsApp

### Paso 1: Ir a Configuración

1. Inicia sesión en tu cuenta de CMR Chatbot
2. Ve al menú lateral y haz clic en **"Configuración"**
3. Busca la sección **"Integración de WhatsApp Business"**

### Paso 2: Iniciar Conexión

1. Haz clic en el botón **"Conectar WhatsApp Business"**
2. Ingresa tu número de teléfono en formato internacional:
   - Ejemplo: `+51987654321` (Perú)
   - Ejemplo: `+34612345678` (España)
   - Ejemplo: `+1234567890` (USA)

3. Haz clic en **"Iniciar Conexión"**

### Paso 3: Verificar Número

1. Recibirás un código de verificación de 6 dígitos
2. Ingresa el código en el campo correspondiente
3. Haz clic en **"Verificar"**

### Paso 4: ¡Listo!

Una vez verificado, verás un mensaje de confirmación verde que dice:
**"¡WhatsApp conectado exitosamente!"**

Tu número ahora está conectado y listo para recibir mensajes.

---

## 💬 Gestión de Conversaciones

### Vista de Chats

La página de **Chats** muestra todas tus conversaciones en un diseño tipo WhatsApp Web:

```
┌─ Lista de Chats ─────────┬─ Ventana de Chat ──────────┐
│ 🔍 Buscar...             │  Juan Pérez                │
│                          │  ──────────────────────────│
│ 👤 Juan Pérez   12:30 PM │                            │
│    ✓✓ Gracias...      🔴1│  Mensajes aquí...          │
│                          │                            │
│ 👤 María López  11:45 AM │                            │
│    Bot: ¿En qué...       │                            │
└──────────────────────────┴────────────────────────────┘
```

### Características de la Lista de Chats

#### 🔍 Búsqueda
- Busca por nombre de contacto
- Busca por contenido de mensajes
- Busca por email

#### 🎯 Filtros
Haz clic en el ícono de filtro para:
- **Por Plataforma**: WhatsApp, Facebook, Web
- **Por Estado**: Activos, Esperando, Resueltos

#### 👁️ Indicadores Visuales
- **Punto verde**: Conversación activa
- **Punto amarillo**: Esperando respuesta
- **Punto gris**: Resuelta
- **Número rojo**: Mensajes sin leer
- **Badge "Bot activo"**: Bot respondiendo automáticamente

### Abrir una Conversación

1. Haz clic en cualquier chat de la lista
2. La ventana de chat se abrirá a la derecha (o en pantalla completa en móvil)
3. Verás todo el historial de mensajes

---

## 📤 Envío de Mensajes

### Enviar Mensaje de Texto

1. Escribe tu mensaje en el campo de texto inferior
2. Presiona **Enter** o haz clic en el botón de enviar (✈️)
3. El mensaje se enviará inmediatamente

**Tip**: Usa **Shift + Enter** para agregar saltos de línea sin enviar

### Enviar Imágenes o Documentos

1. Haz clic en el botón de clip (📎) junto al campo de texto
2. Selecciona tu archivo:
   - **Imágenes**: JPG, PNG, WEBP (máx. 16MB)
   - **Documentos**: PDF, DOCX, XLSX (máx. 100MB)
3. Agrega una descripción opcional
4. Haz clic en **"Enviar"**

El archivo se subirá y enviará automáticamente a través de WhatsApp.

### Estados de Mensajes

Cada mensaje muestra su estado con iconos:

| Icono | Estado | Significado |
|-------|--------|-------------|
| ⏳ | Enviando | El mensaje se está procesando |
| ✓ | Enviado | WhatsApp recibió el mensaje |
| ✓✓ | Entregado | El mensaje llegó al dispositivo del cliente |
| ✓✓ (azul) | Leído | El cliente leyó el mensaje |
| ❌ | Fallido | Error al enviar (haz clic para ver detalles) |

---

## 📊 Métricas y Análisis

### Dashboard de Conexión

Ve a **Configuración** para ver el dashboard de tu conexión de WhatsApp.

#### Información Técnica

- **Número**: Tu número de WhatsApp conectado
- **Phone Number ID**: Identificador único en Meta
- **Business Account ID**: Tu cuenta empresarial
- **Estado API**: Estado actual de la conexión

#### Métricas del Día

El dashboard muestra 5 métricas clave actualizadas en tiempo real:

1. **📤 Mensajes Enviados**
   - Total de mensajes enviados hoy por tu equipo
   
2. **💬 Mensajes Recibidos**
   - Total de mensajes recibidos de clientes hoy
   
3. **✅ Tasa de Entrega**
   - Porcentaje de mensajes que llegaron al dispositivo del cliente
   - Meta recomendada: >95%
   
4. **👁️ Tasa de Lectura**
   - Porcentaje de mensajes leídos por los clientes
   - Indica engagement y calidad de mensajes
   
5. **⏱️ Tiempo de Respuesta**
   - Promedio de minutos que tardas en responder
   - Menor tiempo = mejor experiencia del cliente

**Tip**: Haz clic en el botón de actualizar (🔄) para recargar las métricas

---

## 🆘 Solución de Problemas

### No recibo mensajes

**Posibles causas**:
- ✅ Verifica que el webhook esté configurado correctamente en Meta
- ✅ Verifica que tu número esté conectado (Estado: "Conectado")
- ✅ Revisa que el número de WhatsApp sea correcto

**Solución**:
1. Ve a Configuración
2. Si el estado es "Error", haz clic en "Desconectar"
3. Vuelve a conectar tu número

### Los mensajes no se envían

**Posibles causas**:
- ❌ Conexión perdida
- ❌ Número bloqueado por WhatsApp
- ❌ Fuera de ventana de 24 horas

**Solución**:
1. Verifica el estado de conexión en Configuración
2. Si el mensaje falla, verás un ícono ❌ rojo
3. Haz clic en el mensaje para ver el error específico

### Las métricas no se actualizan

**Solución**:
1. Haz clic en el botón de actualizar (🔄) en el dashboard
2. Recarga la página con F5
3. Si persiste, cierra sesión y vuelve a iniciar

### Error: "Tipo de archivo no soportado"

**Solución**:
- Para imágenes: Usa JPG, PNG o WEBP
- Para documentos: Usa PDF, DOCX o XLSX
- Verifica que el archivo no exceda el tamaño máximo:
  - Imágenes: 16MB
  - Documentos: 100MB

---

## 📞 Soporte Adicional

### ¿Necesitas ayuda?

Si encuentras algún problema no cubierto en esta guía:

1. **Revisa los logs**: En la consola del navegador (F12) puede haber información útil
2. **Contacta soporte**: support@cmr-chatbot.com
3. **Documentación técnica**: Ver `DOCUMENTACION_TECNICA.md`

---

## ✨ Mejores Prácticas

### Para Mejor Rendimiento

1. **Responde rápido**: Tiempo de respuesta bajo mejora la satisfacción
2. **Usa plantillas**: Crea respuestas rápidas para preguntas frecuentes
3. **Aprovecha el bot**: Configura respuestas automáticas para consultas comunes
4. **Revisa métricas**: Analiza tus métricas diariamente para mejorar

### Para Cumplir con WhatsApp

1. **No hagas spam**: Envía solo mensajes relevantes
2. **Obtén consentimiento**: Los clientes deben optar por recibir mensajes
3. **Respeta la privacidad**: No compartas datos de clientes
4. **Responde dentro de 24h**: Ventana de servicio de WhatsApp

---

## 🎉 Próximos Pasos

Ahora que tienes WhatsApp conectado:

1. ✅ Configura tu bot en **Entrenar Bot**
2. ✅ Explora **Productos** para catálogo
3. ✅ Configura **Métodos de Pago** para ventas
4. ✅ Revisa **Pedidos** para gestionar ventas

---

**Última actualización**: 15 Enero 2026  
**Versión**: 2.0

¿Preguntas? Contáctanos en support@cmr-chatbot.com
