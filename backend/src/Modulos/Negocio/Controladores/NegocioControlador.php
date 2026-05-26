<?php
/**
 * ============================================================================
 * CONTROLADOR DE NEGOCIO
 * ============================================================================
 * Este archivo actúa como el controlador principal para la gestión de solicitudes
 * generales del negocio. Su responsabilidad es recibir, validar y procesar la
 * información enviada desde el frontend, actuando como puente entre las peticiones
 * del usuario y las operaciones del backend.
 *
 * Resuelve el problema de centralizar la lógica de procesamiento de los
 * formularios de contacto o de captura de datos de clientes potenciales, asegurando
 * que la información se formatee correctamente y se devuelvan respuestas claras.
 *
 * Utiliza PHP estándar y se integra con la arquitectura respondiendo peticiones 
 * HTTP mediante formato JSON. Su lógica principal consiste en extraer los datos
 * enviados, validar los campos obligatorios (nombre y correo), y construir un
 * objeto de respuesta exitosa o capturar errores si la validación falla.
 * ============================================================================
 */
namespace App\Modulos\Negocio\Controladores;

use Exception;

class NegocioControlador {
    /**
     * #### A. PROPÓSITO
     * Procesa las solicitudes entrantes del negocio, validando los datos del usuario
     * y devolviendo una respuesta estructurada con la confirmación del procesamiento.
     *
     * #### B. FUNCIONAMIENTO
     * Extrae los valores de nombre, correo, teléfono, fechas y mensajes del array
     * de entrada de la petición. Verifica que el nombre y correo no estén vacíos. 
     * Si la validación es exitosa, construye una respuesta JSON confirmando la recepción. 
     * Si falta algún dato obligatorio, lanza una excepción que es capturada para 
     * retornar un mensaje de error al usuario.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: `$req` (Array asociativo) que contiene 'message', 'email', 'name', 'phone' y 'dates'.
     * - Salidas: Imprime un string JSON con el estado de la operación ("success" o "error") y establece el código HTTP (200 o 500). No retorna valores a nivel de función (usa `echo`).
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Es el punto de entrada principal para el registro de intenciones de los clientes. 
     * Su correcta ejecución asegura que el frontend reciba confirmación visual de que
     * su solicitud fue atendida y procesada.
     *
     * #### E. RIESGOS POTENCIALES
     * - Retorna código HTTP 500 para errores de validación de campos vacíos, lo cual debería ser idealmente un error 400 (Bad Request).
     * - No valida el formato correcto del correo electrónico (solo que no esté vacío), lo que podría permitir datos inválidos.
     */
    public static function procesar($req) {
        try {
            $mensaje = $req['message'] ?? '';
            $correo = $req['email'] ?? '';
            $nombre = $req['name'] ?? '';
            $telefono = $req['phone'] ?? '';
            $fechas = $req['dates'] ?? '';

            if (empty($correo) || empty($nombre)) {
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "El nombre y el correo son obligatorios para procesar la solicitud."
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "El formato del correo electrónico no es válido."
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            $msg_respuesta = "Hemos recibido exitosamente la solicitud de {$nombre} ({$correo}) para las fechas {$fechas}.";

            $respuesta = [
                "status" => "success",
                "message" => $msg_respuesta,
                "data" => [
                    "name" => $nombre,
                    "email" => $correo,
                    "phone" => $telefono,
                    "dates" => $fechas,
                    "processed" => true
                ]
            ];

            http_response_code(200);
            echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Error interno al procesar la solicitud.",
                "error_detail" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}