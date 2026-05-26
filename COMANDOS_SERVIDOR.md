# Comandos del Servidor y Base de Datos

Este documento contiene los comandos principales para levantar el proyecto con Docker y las variables de entorno que necesita el backend para conectarse a tu base de datos local.

## 1. Levantar el Servidor (Frontend y Backend)

Para arrancar todo el ecosistema (Apache con PHP y Nginx con tu Frontend), abre tu terminal en la raíz del proyecto (`C:\Users\erian\OneDrive\Documents\mi_pagina_web`) y ejecuta:

```bash
docker-compose up -d --build
```
> **Nota:** El parámetro `-d` es para que corra en segundo plano (detached). El parámetro `--build` asegura que se construyan los cambios nuevos (como nuestra nueva configuración de PHP a MySQL).

### Para ver los registros (logs):
Si quieres ver si hay algún error en el backend de PHP:
```bash
docker-compose logs -f backend
```

### Para apagar el servidor:
```bash
docker-compose down
```

---

## 2. Conexión a la Base de Datos Local

Por lo general, para conectar un backend a una base de datos MySQL (como la que estás corriendo desde XAMPP/WAMP/Laragon), se necesitan estos 5 datos:

1. **Host (Servidor)**: Dónde está la base de datos.
2. **Puerto**: El puerto de MySQL (por defecto es `3306`).
3. **Nombre de la base de datos**: El nombre que le pusiste.
4. **Usuario**: Quien tiene permisos (usualmente `root`).
5. **Contraseña**: La clave del usuario.

### Tu Configuración Actual

Como vi que tu base de datos se llama `bruma_viva_db` y está corriendo localmente (probablemente sin contraseña si es XAMPP), ya configuré el archivo `docker-compose.yml` para que inyecte estas credenciales:

- **Host**: `host.docker.internal` *(Este es un host especial que permite que el contenedor de Docker pueda "ver" y comunicarse con el MySQL que tienes instalado en tu Windows)*.
- **Base de Datos**: `bruma_viva_db`
- **Usuario**: `root`
- **Contraseña**: *(vacía por defecto)*

Si en el futuro le pones contraseña a tu MySQL o cambias el nombre, solo tienes que modificar la sección `environment` dentro de tu archivo `docker-compose.yml`.
