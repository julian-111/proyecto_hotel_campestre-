/**
 * ============================================================================
 * ARCHIVO: server.js (El Servidor Web y Enrutador)
 * AUTOR: Yo (El creador del proyecto)
 * 
 * PROPÓSITO Y ARQUITECTURA:
 * Este archivo es la puerta de entrada a mi servidor backend. Lo escribí 
 * utilizando Node.js y el framework Express porque me permite levantar un 
 * servidor web robusto y modular con muy pocas líneas de código. 
 * Su función principal es quedarse escuchando en el puerto 3000 todas las 
 * peticiones que llegan desde mi frontend (específicamente desde main.js).
 * 
 * DECISIONES TÉCNICAS:
 * Para garantizar que la comunicación sea segura y fluida, implementé dos 
 * "middlewares" vitales en este archivo. Primero, configuré cors(), lo cual 
 * es estrictamente necesario porque mi frontend y mi backend corren en 
 * puertos distintos (8080 y 3000 respectivamente); sin esto, el navegador del 
 * usuario bloquearía la petición por políticas de seguridad (CORS). 
 * Segundo, usé express.json() para que mi servidor pueda entender y desempaquetar 
 * automáticamente la información que llega en formato JSON desde el formulario.
 * 
 * EL ENDPOINT CENTRAL:
 * El corazón de este archivo es el endpoint POST /api/procesar. Aquí programé 
 * la lógica para recibir los datos del usuario y, utilizando el módulo nativo 
 * child_process de Node, "despertar" a mi script de Python (logic.py). 
 * Le paso los datos como un string, escucho pacientemente lo que Python me 
 * responde (capturando tanto éxitos como posibles errores del sistema) y, 
 * finalmente, le reenvío esa respuesta formateada de vuelta al frontend. 
 * Actúa como el intermediario perfecto.
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares (CORS y Parseo de JSON)
app.use(cors());
app.use(express.json());

/**
 * RUTA PRINCIPAL: /api/procesar
 * Aquí recibo la petición POST que hace main.js desde el navegador.
 */
app.post('/api/procesar', (req, res) => {
    // 1. Extraigo la información del cuerpo de la petición (req.body)
    const { message, email, phone, name, dates } = req.body;
    
    // 2. Convierto los datos a un string JSON para poder enviarlos a Python
    const inputData = JSON.stringify({ message, email, phone, name, dates });
    
    // 3. Ejecuto mi script de Python como un proceso hijo
    const pythonProcess = spawn('python', ['logic.py', inputData]);
    
    let pythonResponse = '';
    let pythonError = '';

    // 4. Capturo todo lo que Python imprime en consola (su respuesta JSON exitosa)
    pythonProcess.stdout.on('data', (data) => {
        pythonResponse += data.toString();
    });

    // 5. Capturo cualquier error interno o crash que ocurra en Python
    pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    // 6. Cuando el script de Python termina su ejecución (código 0 = éxito)
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Error en Python: ${pythonError}`);
            return res.status(500).json({ error: 'Hubo un problema al procesar la lógica de negocio.' });
        }
        
        try {
            // 7. Convierto la respuesta en texto de Python a un objeto JSON real 
            //    y se lo envío de vuelta al Frontend
            const result = JSON.parse(pythonResponse);
            res.json(result);
        } catch (e) {
            console.error('Error al parsear respuesta de Python:', e);
            res.status(500).json({ error: 'Respuesta inválida desde la lógica de negocio.' });
        }
    });
});

// 8. Enciendo el servidor y lo dejo escuchando peticiones
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});
