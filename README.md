# Sorteo Super Rivadavia

Página estática para sortear **16 ganadores** a partir de una lista de usuarios de Instagram.

## Uso

1. Subí un archivo **`.txt`** (un usuario por línea) o **`.xlsx` / `.xls`** (primera columna = usuario).
2. Revisá la cantidad de participantes cargados.
3. Pulsá **Realizar sorteo** (se requieren al menos 16 participantes únicos).

## Despliegue en Vercel

1. Importá este repositorio en [Vercel](https://vercel.com/new).
2. Framework preset: **Other** (sitio estático, sin build).
3. Root directory: `.` (raíz del repo).
4. Deploy.

El archivo `vercel.json` ya está incluido.

## Estructura

- `index.html` — página principal
- `css/styles.css` — estilos (paleta Super Rivadavia)
- `js/app.js` — carga de archivos y sorteo
- `logo.png` — logo del header
- `vercel.json` — configuración de Vercel
