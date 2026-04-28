# 🚀 Guía Rápida para el Equipo (Setup y Comandos)

¡Hola equipo! Si acaban de clonar este repositorio desde GitHub, aquí tienen todo lo necesario para instalar las dependencias y levantar el proyecto en sus computadoras en un par de minutos.

---

## 📦 1. Requisitos Previos

Antes de empezar, asegúrense de tener instalados en sus computadoras:
- **Node.js** (Versión 14 o superior) - Para el servidor frontend y el backend en Express.
- **Python** (Versión 3.8 o superior) - Para la lógica de negocio central.

---

## 🛠️ 2. Instalación de Dependencias

Para que el proyecto funcione, necesitamos instalar las librerías tanto de la carpeta principal como de la carpeta del backend.

Abran una terminal en la **carpeta raíz del proyecto** (`mi_pagina_web`) y ejecuten estos comandos en orden:

```bash
# 1. Instalar las herramientas globales del proyecto (concurrently, http-server)
npm install

# 2. Entrar a la carpeta del backend
cd backend

# 3. Instalar las dependencias del servidor backend (Express, CORS, etc.)
npm install

# 4. Volver a la carpeta raíz para el siguiente paso
cd ..
```

---

## 🚀 3. Levantar los Servidores (Frontend y Backend)

¡Aquí viene la magia! Gracias a la configuración que armé en el `package.json` principal, **no necesitan abrir dos terminales separadas** para correr el Frontend y el Backend. 

Desde la **carpeta raíz**, simplemente ejecuten:

```bash
npm run dev
```

**¿Qué hace este comando internamente?**
- Inicia el servidor estático del **Frontend** en: `http://localhost:8080`
- Inicia el servidor Express del **Backend** en: `http://localhost:3000`

👉 **Paso final:** Abran su navegador, vayan a `http://localhost:8080` y la página estará 100% funcional y conectada a la lógica de Python en el backend.

---

## 🐍 4. (Opcional) Dependencias de Python

Actualmente, el motor lógico (`backend/logic.py`) utiliza librerías nativas de Python (`sys` y `json`), por lo que **no necesitan instalar nada extra por ahora**.

Sin embargo, si en el futuro agregamos Machine Learning, conexión a Base de Datos u otras librerías externas (como Pandas o Flask), las dependencias estarán listadas en `requerimientos/requirements.txt`. En ese caso, solo tendrían que ejecutar:

```bash
pip install -r requerimientos/requirements.txt
```

---
¡A programar! 💻🔥
