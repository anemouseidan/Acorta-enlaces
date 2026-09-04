# Acortador de enlaces con página de espera publicitaria

Sitio estático (GitHub Pages) + Supabase como base de datos. Sin login:
cualquiera con el link de tu página principal puede crear enlaces.

## Cómo funciona

- `index.html` / `script.js` — formulario para crear enlaces + una tabla
  con tu historial (destino, clics, fecha), guardado en el navegador
  donde los creaste.
- `wait.html` — la página pública que ve cualquiera que haga clic en tu
  enlace: espacio de anuncios, contador de 5s, y el botón **IR AL LINK**.
- Al crear un enlace, se envuelve con un alias externo (CleanURI) para
  que el link que compartes no muestre tu usuario de GitHub. Si ese
  servicio falla, se usa el link normal como respaldo automático.

## 1. Configurar Supabase

1. Ve a supabase.com → **New Project** (o usa uno que ya tengas).
2. Ve a **SQL Editor → New query**, pega el contenido de
   `supabase-setup.sql` y dale **Run**. Esto reemplaza cualquier tabla
   `links` anterior, así que si venías de la versión con login, queda
   limpio.
3. Ve a **Settings → API** y copia el **Project URL** y la **anon
   public** key.
4. Pégalos en `supabase-config.js`.

## 2. Subir a GitHub

1. Sube todos estos archivos a la raíz de tu repositorio:
   `index.html`, `wait.html`, `style.css`, `script.js`, `wait.js`,
   `supabase-config.js`.
2. **Settings → Pages** → Source: rama `main`, carpeta `/ (root)` →
   **Save**.
3. Tu sitio queda en `https://tu-usuario.github.io/tu-repositorio/`. Ya
   no hay pantalla de login, entras directo al formulario.

## Cosas a tener en cuenta con este modelo (sin login)

- **Cualquiera con el link de tu `index.html` puede crear enlaces.** No
  hay forma de evitarlo sin volver a algún tipo de autenticación. Si
  algún día ves enlaces raros que no creaste tú en tu tabla de Supabase
  (revisa en **Table Editor → links**), es señal de que alguien más
  encontró la página.
- El historial que ves en tu tabla es local a **ese navegador**. Si
  entras desde otro dispositivo o borras datos de navegación, dejas de
  verlo ahí — pero los enlaces siguen funcionando igual, porque viven en
  Supabase, no en tu navegador. Si necesitas ver el listado completo real,
  entra a **Supabase → Table Editor → links**.
- No hay botón para borrar enlaces desde el sitio. Para borrar uno, ve a
  **Table Editor → links** en Supabase y bórralo ahí directamente.

## Dónde poner tus anuncios

En `wait.html` hay un `<div id="ad-slots">` marcado con comentarios,
justo arriba del contador. Pega ahí el código de tu red de anuncios. El
contador y el botón **IR AL LINK** no dependen de eso.

Si el código de tu anuncio usa `document.write` y lo insertas
dinámicamente con JavaScript, puede borrar toda la página (bug conocido
de esos tags). Si te pasa, dime qué red es y lo envolvemos en un
`<iframe>`.

## Ocultar tu usuario/repo de GitHub en el link final

El link final pasa por CleanURI antes de mostrarse. Esto solo oculta la
URL **antes** del clic — una vez que alguien hace clic, su navegador
redirige de verdad y la barra de direcciones mostrará tu página de
GitHub. Para que nunca se vea, la única solución real es un dominio
propio apuntado a tu GitHub Pages.
