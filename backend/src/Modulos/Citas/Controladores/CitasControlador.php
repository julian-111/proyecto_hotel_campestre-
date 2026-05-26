<?php
/**
 * ============================================================================
 * CONTROLADOR DE CITAS
 * ============================================================================
 * Este archivo es el responsable de manejar todas las peticiones HTTP
 * relacionadas con el sistema de agendamiento de los clientes. Su función 
 * principal es actuar como intermediario entre las rutas web y la lógica de
 * negocio, garantizando la seguridad de las operaciones.
 *
 * Resuelve el problema de la orquestación de datos para la creación y
 * visualización de citas. Interacciona directamente con el AutenticacionMiddleware
 * para proteger las rutas (verificando que el usuario haya iniciado sesión) y 
 * con el CitasServicio para gestionar la base de datos.
 *
 * Tecnológicamente utiliza PHP orientado a objetos y manejo de excepciones. Su
 * lógica consiste en recibir los datos de la petición, verificar los permisos
 * del usuario, validar que existan los datos mínimos requeridos y delegar la
 * acción final al servicio, retornando una respuesta en formato JSON al cliente.
 * ============================================================================
 */
namespace App\Modulos\Citas\Controladores;

use App\Modulos\Citas\Logica\CitasServicio;
use App\Compartido\Nucleo\AutenticacionMiddleware;
use Exception;

class CitasControlador {
    /**
     * #### A. PROPÓSITO
     * Crea y agenda una nueva cita en el sistema asociándola al usuario actual 
     * que realiza la petición.
     *
     * #### B. FUNCIONAMIENTO
     * Primero invoca al middleware de autenticación para obtener al usuario actual.
     * Luego valida que los parámetros obligatorios ('servicio' y 'fecha') estén 
     * presentes en la solicitud. Si todo es correcto, llama al servicio de citas 
     * para insertar el registro en la base de datos y responde con un mensaje de éxito.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: `$req` (Array asociativo) que contiene los datos del formulario, incluyendo 'servicio' y 'fecha'.
     * - Salidas: Imprime un JSON con el detalle de la cita creada y código HTTP 201. En caso de error, imprime un JSON con el mensaje de error y código HTTP 400 o 500.
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Es una función crítica de escritura que impacta directamente en la base de datos 
     * al crear nuevos registros de citas. Depende completamente de que el sistema 
     * de autenticación funcione correctamente.
     *
     * #### E. RIESGOS POTENCIALES
     * - No verifica que la fecha de la cita sea válida o en el futuro (depende del servicio o de la base de datos).
     * - Podría existir conflicto de horarios si no se hace una validación de disponibilidad antes de crearla.
     */
    public static function crear($req) {
        try {
            $usuario = AutenticacionMiddleware::verificar();
            
            // Verificamos que envíe al menos un servicio o una habitacion
            $servicios = !empty($req['servicios']) ? $req['servicios'] : [];
            $habitaciones = !empty($req['habitaciones']) ? $req['habitaciones'] : [];
            $fecha = !empty($req['fecha']) ? $req['fecha'] : null;

            if (empty($fecha) || (empty($servicios) && empty($habitaciones))) {
                http_response_code(400);
                echo json_encode(['error' => 'Se requiere una fecha y al menos un servicio o habitación seleccionados.']);
                return;
            }
            
            // Lo delegamos al servicio pasando los arrays
            $cita = CitasServicio::crearCita($usuario->id, $servicios, $habitaciones, $fecha);
            
            http_response_code(201);
            echo json_encode(['mensaje' => 'Cita agendada exitosamente', 'cita' => $cita]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al intentar agendar la cita: ' . $e->getMessage()]);
        }
    }

    /**
     * #### A. PROPÓSITO
     * Obtiene y devuelve el listado completo de las citas agendadas pertenecientes 
     * al usuario que tiene la sesión activa.
     *
     * #### B. FUNCIONAMIENTO
     * Verifica la identidad del usuario actual mediante el middleware de autenticación.
     * Con el ID del usuario obtenido, solicita al servicio de citas el arreglo de todas 
     * sus citas registradas en la base de datos y las retorna codificadas en JSON.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: No recibe parámetros directos. Toma la identidad del usuario a través de los headers HTTP (JWT o sesión).
     * - Salidas: Imprime un JSON con el arreglo 'citas' y código HTTP 200. Si hay error, imprime un JSON con código HTTP 500.
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Es una función de lectura de alta concurrencia que permite a los usuarios 
     * ver su historial o agenda próxima. Solo expone la información que le 
     * pertenece estrictamente al usuario logueado.
     *
     * #### E. RIESGOS POTENCIALES
     * - Si un usuario tiene miles de citas, la consulta podría volverse pesada al no incluir un sistema de paginación (limit/offset).
     */
    public static function listar() {
        try {
            $usuario = AutenticacionMiddleware::verificar();
            $citas = CitasServicio::obtenerCitasUsuario($usuario->id);
            
            http_response_code(200);
            echo json_encode(['citas' => $citas]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al obtener el listado de citas']);
        }
    }

    public static function listarTodasAdmin() {
        try {
            // Verificar que sea administrador
            $usuario = AutenticacionMiddleware::verificarAdmin();

            $citas = CitasServicio::obtenerTodasLasCitas();
            
            $citasFormateadas = array_map(function($c) {
            return [
                'id' => $c['id'],
                'fecha' => $c['fecha'],
                'estado' => $c['estado'],
                'usuario_nombre' => $c['usuario_nombre'],
                'usuario_correo' => $c['usuario_correo'],
                'servicio' => $c['servicio_nombre'] ?? 'Ninguno',
                'habitacion' => $c['habitacion_nombre'] ?? 'Ninguna'
            ];
        }, $citas);
        
        http_response_code(200);
        echo json_encode($citasFormateadas); // El JS espera el arreglo directamente
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al obtener el listado de citas']);
        }
    }

    public static function actualizarEstadoAdmin($req, $uri) {
        try {
            // Verificar que sea administrador
            $usuario = AutenticacionMiddleware::verificarAdmin();

            // Extraer ID de la URL: /api/admin/citas/{id}/estado (El id ahora es un UUID)
            preg_match('/\/api\/admin\/citas\/([a-zA-Z0-9\-]+)\/estado/', $uri, $matches);
            $citaId = $matches[1] ?? null;

            if (!$citaId || empty($req['estado'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de cita y estado son requeridos']);
                return;
            }

            $exito = CitasServicio::actualizarEstado($citaId, $req['estado']);
            
            if ($exito) {
                http_response_code(200);
                echo json_encode(['mensaje' => 'Estado actualizado con éxito']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Cita no encontrada o el estado es el mismo']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al actualizar la cita']);
        }
    }

    public static function cancelar($uri) {
        try {
            $usuario = AutenticacionMiddleware::verificar();
            
            // Extraer ID de la URL: /api/citas/{id}/cancelar
            preg_match('/\/api\/citas\/([a-zA-Z0-9\-]+)\/cancelar/', $uri, $matches);
            $citaId = $matches[1] ?? null;

            if (!$citaId) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de cita requerido']);
                return;
            }

            $exito = CitasServicio::cancelarCitaUsuario($usuario->id, $citaId);
            
            if ($exito) {
                http_response_code(200);
                echo json_encode(['mensaje' => 'Cita cancelada con éxito']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Cita no encontrada']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function reprogramar($req, $uri) {
        try {
            $usuario = AutenticacionMiddleware::verificar();
            
            // Extraer ID de la URL: /api/citas/{id}
            preg_match('/\/api\/citas\/([a-zA-Z0-9\-]+)/', $uri, $matches);
            $citaId = $matches[1] ?? null;

            $servicios = !empty($req['servicios']) ? $req['servicios'] : (!empty($req['servicio_id']) ? [$req['servicio_id']] : []);
            $habitaciones = !empty($req['habitaciones']) ? $req['habitaciones'] : (!empty($req['habitacion_id']) ? [$req['habitacion_id']] : []);
            $fecha = !empty($req['fecha']) ? $req['fecha'] : null;

            if (!$citaId || empty($fecha)) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de cita y nueva fecha son requeridos']);
                return;
            }

            CitasServicio::reprogramarCitaUsuario($usuario->id, $citaId, $fecha, $servicios, $habitaciones);
            
            http_response_code(200);
            echo json_encode(['mensaje' => 'Cita reprogramada con éxito']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}