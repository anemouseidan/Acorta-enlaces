# Acortador de enlaces con página de espera publicitaria

Sitio estático (GitHub Pages) + Supabase como base de datos. Solo tú
(con login) puedes crear y borrar enlaces; cualquiera puede usarlos.

## Cómo funciona

- `index.html` — pide login. Ya adentro: formulario para crear enlaces +
  tabla con tu historial (destino, clics, fecha, botón de borrar).
- `wait.html` — la página pública que ve cualquiera que haga clic en tu
  enlace: espacio de anuncios, contador de 5s, y el botón **IR AL LINK**.
- Al crear un enlace, además se envuelve con un alias externo (CleanURI)
  para que el link que compartes no muestre tu usuario de GitHub. Si ese
  servicio falla, se usa el link normal como respaldo automático.

## 1. Crear el proyecto en Supabase

1. Ve a supabase.com → **New Project**. Espera a que termine de crearse.
2. Ve a **Authentication → Providers** y confirma que "Email" esté
   habilitado (lo está por defecto).
3. Ve a **Authentication → Users → Add user** y crea TU usuario (el único
   que va a poder entrar): correo y contraseña. Marca "Auto Confirm User"
   para no tener que verificar el correo.
4. Ve a **SQL Editor → New query**, pega el contenido de
   `supabase-setup.sql` y dale **Run**.
5. Ve a **Settings → API** y copia el **Project URL** y la **anon public**
   key.
6. Pégalos en `supabase-config.js`, en `SUPABASE_URL` y
   `SUPABASE_ANON_KEY`.

## 2. Subir a GitHub

1. Crea un repositorio nuevo (público) en GitHub.
2. Sube todos estos archivos a la raíz:
   `index.html`, `wait.html`, `style.css`, `app.js`, `wait.js`,
   `supabase-config.js`.
3. En el repo: **Settings → Pages** → Source: rama `main`, carpeta
   `/ (root)` → **Save**.
4. Espera 1-2 minutos. Tu sitio queda en
   `https://tu-usuario.github.io/tu-repositorio/`.
5. Entra con el correo y contraseña que creaste en el paso 1.3.

## Seguridad: por qué está diseñado así

- Solo un usuario autenticado (tú) puede insertar o borrar filas en la
  tabla `links` — así nadie más puede llenarte la base de datos de spam.
- Los visitantes anónimos (quien haga clic en tus enlaces) nunca leen la
  tabla directamente: usan una función segura que solo devuelve el destino
  de un código puntual, sin exponer el resto de tus enlaces.
- El contador de clics usa otra función segura equivalente, así tampoco
  hace falta abrir permisos de escritura pública sobre la tabla.

## Dónde poner tus anuncios

En `wait.html` hay un `<div id="ad-slots">` marcado con comentarios,
justo arriba del contador. Pega ahí el código de tu red de anuncios. El
contador y el botón **IR AL LINK** no dependen de eso, así que puedes
cambiar de red cuando quieras sin romper nada más.

Si el código de tu anuncio usa `document.write` y lo insertas
dinámicamente con JavaScript, puede borrar toda la página (bug conocido
de esos tags). Si te pasa, dime qué red es y lo envolvemos en un
`<iframe>`.

## Ocultar tu usuario/repo de GitHub en el link final

El link final que se comparte pasa por CleanURI antes de mostrarse, así
no aparece `tu-usuario.github.io` en lo que compartes. Importante: esto
solo oculta la URL **antes** del clic. Una vez que alguien hace clic, su
navegador redirige de verdad y la barra de direcciones sí mostrará tu
página de GitHub. Para que nunca se vea, ni antes ni después del clic, la
única solución real es un dominio propio apuntado a tu GitHub Pages.

Nota de privacidad: CleanURI ve la IP de quien crea el enlace y también
la de cada visitante que haga clic (es inevitable, así funciona cualquier
redirección en internet). No es distinto a bit.ly o tinyurl en ese
sentido.

## Pendientes sugeridos (no incluidos todavía)

- Alias personalizado (elegir tú el código en vez de aleatorio).
- Expiración automática de enlaces.
- Código QR del enlace generado.
