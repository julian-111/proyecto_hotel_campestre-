<?php
/**
 * ============================================================================
 * SERVICIO DE CITAS
 * ============================================================================
 * Este archivo encapsula toda la lógica de negocio y el acceso a la base de
 * datos referente al módulo de citas. Su responsabilidad exclusiva es ejecutar
 * las operaciones de escritura y lectura de citas asociadas a los usuarios.
 *
 * Resuelve el problema de separar el acceso a datos (consultas SQL) de la lógica 
 * de los controladores (peticiones HTTP), lo que permite que el código sea 
 * escalable, reutilizable en diferentes partes del sistema y más fácil de mantener.
 *
 * Utiliza PHP con la extensión PDO (PHP Data Objects) para interactuar de forma 
 * segura con la base de datos, previniendo ataques de inyección SQL mediante el 
 * uso de sentencias preparadas (prepared statements).
 * ============================================================================
 */
namespace App\Modulos\Citas\Logica;

use App\Compartido\Configuracion\BaseDatos;
use PDO;

class CitasServicio {
    /**
     * #### A. PROPÓSITO
     * Registra de manera definitiva una nueva cita en la base de datos del sistema, 
     * vinculándola con el usuario que la solicitó.
     *
     * #### B. FUNCIONAMIENTO
     * Obtiene la instancia única (Singleton) de la conexión a la base de datos.
     * Prepara una consulta SQL de inserción (INSERT) para la tabla 'citas'. 
     * Ejecuta la consulta pasando los valores del usuario, el servicio deseado y 
     * la fecha. Al finalizar, retorna un arreglo simulando la cita recién creada 
     * incluyendo el ID autogenerado.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: `$usuarioId` (Entero/String), `$servicio` (String), `$fecha` (String en formato de fecha).
     * - Salidas: Retorna un Array asociativo con los datos de la cita ('id', 'usuarioId', 'servicio', 'fecha', 'estado').
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Agrega registros físicos persistentes en la tabla `citas`. Es el único punto
     * oficial para crear citas, asegurando que todos los registros pasen por la 
     * misma vía y mantengan consistencia estructural.
     *
     * #### E. RIESGOS POTENCIALES
     * - No existe manejo de transacciones (Transactions) ni validaciones previas de disponibilidad de fechas a nivel de base de datos.
     * - Si la base de datos no está disponible, lanzará un error fatal de PDO que debe ser capturado por capas superiores.
     */
    public static function crearCita($usuarioId, $servicios, $habitaciones, $fecha) {
        $db = BaseDatos::obtenerInstancia();

        $idCita = BaseDatos::generarUUID();

        // 1. Crear la cita principal
        $stmt = $db->prepare('INSERT INTO citas (id_cita, id_usuario, fecha_reserva) VALUES (?, ?, ?)');
        $stmt->execute([$idCita, $usuarioId, $fecha]);

        // 2. Si hay habitaciones, iterar e insertar
        if (is_array($habitaciones)) {
            foreach ($habitaciones as $hId) {
                if (is_string($hId) && strlen($hId) === 36) {
                    self::insertarHabitacionPivot($db, $idCita, $hId);
                }
            }
        }

        // 3. Si hay servicios, iterar e insertar
        if (is_array($servicios)) {
            foreach ($servicios as $sId) {
                if (is_string($sId) && strlen($sId) === 36) {
                    self::insertarServicioPivot($db, $idCita, $sId);
                }
            }
        }

        return [
            'id' => $idCita,
            'usuarioId' => $usuarioId,
            'servicios' => $servicios,
            'habitaciones' => $habitaciones,
            'fecha' => $fecha,
            'estado' => 'CREADA'
        ];
    }

    private static function insertarHabitacionPivot($db, $idCita, $idHabitacion) {
        $idPivotHab = BaseDatos::generarUUID();
        $stmtPivotH = $db->prepare('INSERT INTO cita_habitaciones (id, id_cita, id_habitacion, cantidad_noches, precio_reserva) 
                                    SELECT ?, ?, ?, 1, precio_noche_base FROM habitaciones WHERE id_habitacion = ?');
        $stmtPivotH->execute([$idPivotHab, $idCita, $idHabitacion, $idHabitacion]);
    }

    private static function insertarServicioPivot($db, $idCita, $idServicio) {
        $idPivotServ = BaseDatos::generarUUID();
        $stmtPivotS = $db->prepare('INSERT INTO cita_servicios (id, id_cita, id_servicio, cantidad, precio_actual) 
                                    SELECT ?, ?, ?, 1, precio_base FROM servicios WHERE id_servicio = ?');
        $stmtPivotS->execute([$idPivotServ, $idCita, $idServicio, $idServicio]);
    }

    /**
     * #### A. PROPÓSITO
     * Extrae de la base de datos todo el historial y las citas agendadas 
     * correspondientes a un usuario en específico.
     *
     * #### B. FUNCIONAMIENTO
     * Conecta a la base de datos e inyecta una consulta de selección (SELECT) 
     * filtrando por el ID del usuario (`usuario_id = ?`). Ordena los resultados
     * cronológicamente ascendente por la columna `fecha` y retorna todos los 
     * registros encontrados en forma de arreglo asociativo.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: `$usuarioId` (Entero/String) Identificador único del usuario.
     * - Salidas: Retorna un Array de arreglos asociativos que representan cada cita. (Vacío si no tiene citas).
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Consulta directamente la base de datos sin modificar información (Operación segura).
     * Provee los datos que alimentan la interfaz del historial del usuario.
     *
     * #### E. RIESGOS POTENCIALES
     * - Al carecer de límites en la consulta (`LIMIT`), podría retornar demasiados registros y consumir excesiva memoria RAM en el servidor si un usuario tiene un historial enorme.
     */
    public static function obtenerCitasUsuario($usuarioId) {
        $db = BaseDatos::obtenerInstancia();
        // Usamos GROUP_CONCAT para traer múltiples servicios y habitaciones en una sola fila
        $sql = 'SELECT c.id_cita as id, c.fecha_reserva as fecha, c.estado, 
                       GROUP_CONCAT(DISTINCT s.nombre SEPARATOR ", ") AS servicio_nombre, 
                       GROUP_CONCAT(DISTINCT h.nombre SEPARATOR ", ") AS habitacion_nombre
                FROM citas c
                LEFT JOIN cita_servicios cs ON c.id_cita = cs.id_cita
                LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio
                LEFT JOIN cita_habitaciones ch ON c.id_cita = ch.id_cita
                LEFT JOIN habitaciones h ON ch.id_habitacion = h.id_habitacion
                WHERE c.id_usuario = ? 
                GROUP BY c.id_cita
                ORDER BY c.fecha_reserva ASC';
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$usuarioId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function obtenerTodasLasCitas() {
        $db = BaseDatos::obtenerInstancia();
        $sql = 'SELECT c.id_cita as id, c.fecha_reserva as fecha, c.estado, 
                       u.nombre AS usuario_nombre, 
                       u.correo AS usuario_correo,
                       GROUP_CONCAT(DISTINCT s.nombre SEPARATOR ", ") AS servicio_nombre,
                       GROUP_CONCAT(DISTINCT h.nombre SEPARATOR ", ") AS habitacion_nombre
                FROM citas c 
                JOIN usuarios u ON c.id_usuario = u.id_usuario 
                LEFT JOIN cita_servicios cs ON c.id_cita = cs.id_cita
                LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio
                LEFT JOIN cita_habitaciones ch ON c.id_cita = ch.id_cita
                LEFT JOIN habitaciones h ON ch.id_habitacion = h.id_habitacion
                GROUP BY c.id_cita
                ORDER BY c.fecha_reserva ASC';
                
        $stmt = $db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function actualizarEstado($citaId, $nuevoEstado) {
        $db = BaseDatos::obtenerInstancia();
        $stmt = $db->prepare('UPDATE citas SET estado = ? WHERE id_cita = ?');
        $stmt->execute([$nuevoEstado, $citaId]);
        return $stmt->rowCount() > 0;
    }

    public static function cancelarCitaUsuario($usuarioId, $citaId) {
        $db = BaseDatos::obtenerInstancia();
        // Solo puede cancelar si le pertenece y está CREADA o PENDIENTE (depende del enum real)
        // Revisamos el estado actual
        $stmt = $db->prepare('SELECT estado FROM citas WHERE id_cita = ? AND id_usuario = ?');
        $stmt->execute([$citaId, $usuarioId]);
        $cita = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cita) {
            throw new \Exception('Cita no encontrada o no te pertenece');
        }

        if (strtoupper($cita['estado']) === 'CONFIRMADA') {
            throw new \Exception('No puedes cancelar una cita que ya está CONFIRMADA. Contacta con el hotel.');
        }

        $stmtUp = $db->prepare('UPDATE citas SET estado = ? WHERE id_cita = ?');
        $stmtUp->execute(['CANCELADA', $citaId]);
        return $stmtUp->rowCount() > 0;
    }

    public static function reprogramarCitaUsuario($usuarioId, $citaId, $nuevaFecha, $nuevosServicios, $nuevasHabitaciones) {
        $db = BaseDatos::obtenerInstancia();
        
        // Verificar propiedad y estado
        $stmt = $db->prepare('SELECT estado FROM citas WHERE id_cita = ? AND id_usuario = ?');
        $stmt->execute([$citaId, $usuarioId]);
        $cita = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cita) {
            throw new \Exception('Cita no encontrada o no te pertenece');
        }

        if (strtoupper($cita['estado']) === 'CONFIRMADA') {
            throw new \Exception('No puedes reprogramar una cita CONFIRMADA. Contacta con el hotel.');
        }

        // Iniciar transacción para asegurar consistencia al borrar e insertar relaciones
        $db->beginTransaction();

        try {
            // 1. Actualizar fecha principal
            $stmtUp = $db->prepare('UPDATE citas SET fecha_reserva = ? WHERE id_cita = ?');
            $stmtUp->execute([$nuevaFecha, $citaId]);

            // 2. Limpiar servicios y habitaciones viejas
            $db->prepare('DELETE FROM cita_habitaciones WHERE id_cita = ?')->execute([$citaId]);
            $db->prepare('DELETE FROM cita_servicios WHERE id_cita = ?')->execute([$citaId]);

            // 3. Insertar nuevas habitaciones
            if (is_array($nuevasHabitaciones)) {
                foreach ($nuevasHabitaciones as $hId) {
                    if (is_string($hId) && strlen($hId) === 36) {
                        self::insertarHabitacionPivot($db, $citaId, $hId);
                    }
                }
            }

            // 4. Insertar nuevos servicios
            if (is_array($nuevosServicios)) {
                foreach ($nuevosServicios as $sId) {
                    if (is_string($sId) && strlen($sId) === 36) {
                        self::insertarServicioPivot($db, $citaId, $sId);
                    }
                }
            }

            $db->commit();
            return true;
        } catch (\Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }
}