# CMR Chatbot - Sistema de Gestión de Conversaciones y Pedidos

Sistema CMR (Customer Relationship Management) profesional para gestión de chatbots, conversaciones en vivo y pedidos. Desarrollado con Astro y React.

## 🚀 Características

- 💬 **Chats en Vivo**: Visualiza y gestiona conversaciones en tiempo real
- 📦 **Gestión de Pedidos**: Administra pedidos desde el mismo panel
- 📊 **Dashboard**: Estadísticas y métricas en tiempo real
- 🎨 **Interfaz Moderna**: Diseño profesional similar a Intercom/Zendesk
- 📱 **Responsive**: Funciona perfectamente en móviles y tablets
- 🔌 **Integraciones**: Preparado para conectar con Facebook Messenger y WhatsApp

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── components/      # Componentes React reutilizables
│   ├── data/           # Datos mock y utilidades
│   ├── layouts/        # Layouts de Astro
│   └── pages/          # Páginas de la aplicación
├── public/             # Archivos estáticos
└── package.json
```

## 🎯 Páginas Principales

- **/** - Vista principal de chats
- **/chats** - Gestión de conversaciones
- **/pedidos** - Gestión de pedidos
- **/dashboard** - Panel de estadísticas
- **/configuracion** - Configuración e integraciones

## 🎨 Tecnologías

- **Astro** - Framework web moderno
- **React** - Biblioteca de UI
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos modernos
- **TypeScript** - Tipado estático

## 📝 Notas

Esta es una versión demo con datos simulados. Para producción, necesitarás:

1. Conectar con APIs reales (Facebook Messenger, WhatsApp)
2. Implementar autenticación
3. Configurar base de datos
4. Agregar WebSockets para mensajes en tiempo real

## 📄 Licencia

MIT






