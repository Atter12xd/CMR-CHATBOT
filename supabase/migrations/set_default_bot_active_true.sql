-- Por defecto los chats tienen el bot activo (hasta que el usuario ponga "Modo humano")
UPDATE chats SET bot_active = true WHERE bot_active IS NOT true;
