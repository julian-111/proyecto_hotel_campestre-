<?php
/**
 * ============================================================================
 * CONTROLADOR DE AUTENTICACIÓN
 * ============================================================================
 * Este archivo gestiona todas las peticiones HTTP relacionadas con el ingreso
 * y registro de usuarios en el sistema. Funciona como el intermediario directo 
 * entre las rutas públicas de la aplicación y la lógica de seguridad del negocio.
 *
 * Resuelve el problema de centralizar la recepción y validación inicial de 
 * credenciales. Evita que las rutas interactúen directamente con la base de 
 * datos y estructura las respuestas de éxito o fallo para que el cliente (frontend) 
 * pueda interpretarlas y gestionarlas adecuadamente.
 *
 * Utiliza PHP orientado a objetos. Su flujo consiste en verificar que los campos 
 * obligatorios existan en la petición, delegar la creación del usuario o la 
 * validación del login al servicio correspondiente, y finalmente responder con un 
 * JSON apropiado y un código HTTP que represente el resultado de la operación.
 * ============================================================================
 */
namespace App\Modulos\Autenticacion\Controladores;

use App\Modulos\Autenticacion\Logica\AutenticacionServicio;
use Exception;

class AutenticacionControlador {
    /**
     * #### A. PROPÓSITO
     * Registra un nuevo usuario en el sistema a partir de los datos enviados 
     * en la petición HTTP.
     *
     * #### B. FUNCIONAMIENTO
     * Recibe la petición y comprueba que contenga obligatoriamente el 'nombre', 
     * 'correo' y 'contrasena'. Si falta alguno, retorna un error 400 (Bad Request).
     * Si los datos están completos, los pasa al servicio de autenticación para que 
     * intente registrar al usuario en la base de datos. Si el registro es exitoso, 
     * retorna los datos básicos del usuario creado. Si el servicio detecta un error 
     * (como un correo ya existente), captura la excepción y retorna un mensaje de error.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: `$req` (Array asociativo) que debe contener 'nombre', 'correo' y 'contrasena'.
     * - Salidas: Imprime un JSON. Si hay éxito, devuelve código 201 y los datos del usuario. Si falla, devuelve código 400 y el mensaje de error.
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Es el punto de entrada para el crecimiento de la base de usuarios del sistema.
     * Un fallo aquí impediría la adopción de nuevos clientes.
     *
     * #### E. RIESGOS POTENCIALES
     * - Retorna directamente el mensaje de la excepción lanzada por el servicio al cliente, lo cual podría exponer detalles técnicos si la excepción no fue cuidadosamente controlada.
     */
    public static function registrar($req) {
        try {
            if (empty($req['nombre']) || empty($req['correo']) || empty($req['contrasena'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Faltan campos requeridos']);
                return;
            }
            
            $usuario = AutenticacionServicio::registrar($req['nombre'], $req['correo'], $req['contrasena']);
            
            http_response_code(201);
            echo json_encode(['mensaje' => 'Usuario registrado exitosamente', 'usuario' => $usuario]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * #### A. PROPÓSITO
     * Valida las credenciales de un usuario existente y, de ser correctas, 
     * inicia su sesión en el sistema entregándole un token de acceso.
     *
     * #### B. FUNCIONAMIENTO
     * Verifica que el 'correo' y 'contrasena' hayan sido proporcionados. Si faltan, 
     * rechaza la petición. De estar presentes, solicita al servicio de autenticación 
     * que compruebe las credenciales. Si el servicio las aprueba, este controlador 
     * retorna el token generado (JWT) junto con los datos del usuario. Si son 
     * incorrectas, captura la excepción y responde con error.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: `$req` (Array asociativo) que contiene 'correo' y 'contrasena'.
     * - Salidas: Imprime JSON. Éxito: código 200, mensaje, token y datos del usuario. Fallo: código 401 (Unauthorized) o 400 (Bad Request).
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Es el punto de acceso central a las funciones privadas. Permite que los 
     * clientes se identifiquen de forma segura para posteriormente realizar 
     * operaciones como agendar citas.
     *
     * #### E. RIESGOS POTENCIALES
     * - No implementa mecanismos contra ataques de fuerza bruta (rate limiting), por lo que un atacante podría intentar adivinar contraseñas repetidamente.
     */
    public static function iniciarSesion($req) {
        try {
            if (empty($req['correo']) || empty($req['contrasena'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Faltan campos requeridos']);
                return;
            }
            
            $datos = AutenticacionServicio::iniciarSesion($req['correo'], $req['contrasena']);
            
            http_response_code(200);
            echo json_encode(['mensaje' => 'Inicio de sesión exitoso', 'datos' => $datos]);
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}