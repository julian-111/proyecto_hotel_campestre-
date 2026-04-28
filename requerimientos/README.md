# Guía de Requerimientos del Proyecto "Bruma Viva"

Este documento resume las tecnologías y dependencias necesarias para ejecutar el proyecto, el cual está dividido en dos partes: **Frontend** y **Backend**.

## 1. Frontend
La carpeta `/frontend` no requiere instalaciones previas a través de gestores de paquetes como npm. 
Utiliza tecnologías web estándar y librerías importadas directamente a través de CDN (en caso de aplicar):

- HTML5 Semántico
- Tailwind CSS (vía CDN o pre-compilado en `/assets/css/styles.css`)
- JavaScript Vanilla (ECMAScript 6+)

**Para ejecutar el frontend:** 
Simplemente abre los archivos `.html` en cualquier navegador web moderno, o utiliza extensiones como "Live Server" de VSCode.

---

## 2. Backend (Node.js + Express)
La carpeta `/backend` contiene el servidor intermediario que se comunica con el frontend y ejecuta los procesos pesados en Python. 

**Dependencias (gestionadas vía `package.json`):**
- `express` (^5.2.1): Framework para levantar el servidor y crear la API.
- `cors` (^2.8.6): Middleware para permitir peticiones seguras desde el frontend.
- `body-parser` (^2.2.2): Middleware para procesar la información JSON que envía el frontend.

**Para instalar y ejecutar:**
1. Abre una terminal y ve a la ruta del backend: `cd backend`
2. Ejecuta: `npm install` (Para instalar los requerimientos listados arriba).
3. Levanta el servidor: `node server.js`
   - *Por defecto, el servidor correrá en el puerto 3000 (http://localhost:3000).*

---

## 3. Lógica de Negocio (Python)
El archivo `logic.py` maneja la lógica de negocio. Actualmente es ejecutado por Node.js usando el módulo nativo `child_process`.

**Dependencias actuales:**
Por el momento, el script utiliza únicamente bibliotecas estándar de la instalación nativa de Python:
- `sys` (Manejo de argumentos).
- `json` (Procesamiento de datos hacia/desde Express).

**Nota:** *El archivo `requirements.txt` ubicado en esta misma carpeta está preparado para cuando se añadan librerías externas de Python (como IA, Data Science o Bases de Datos). Si en el futuro agregas librerías, solo tendrás que ejecutar:*
`pip install -r requerimientos/requirements.txt`
