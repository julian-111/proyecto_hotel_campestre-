<?php
/**
 * ============================================================================
 * MIDDLEWARE DE AUTENTICACIÓN
 * ============================================================================
 * Este componente actúa como un filtro o guardián de seguridad que intercepta 
 * las peticiones HTTP antes de que lleguen a los controladores protegidos. Su
 * responsabilidad es validar que el usuario que hace la petición esté logueado.
 *
 * Resuelve el problema del control de acceso a recursos privados. Al centralizar
 * esta validación en un solo archivo, evita que se duplique el código de
 * verificación de seguridad en cada controlador que requiera protección (por
 * ejemplo, en el Controlador de Citas).
 *
 * A nivel técnico, extrae el token de acceso (JWT) de las cabeceras HTTP
 * (`Authorization: Bearer <token>`), lo decodifica y verifica su firma y
 * vigencia utilizando la librería Firebase JWT. Si el token es inválido,
 * rechaza la petición inmediatamente y detiene la ejecución.
 * ============================================================================
 */
namespace App\Compartido\Nucleo;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AutenticacionMiddleware {
    /**
     * Clave secreta estática de respaldo.
     */
    private static $secreto = 'super_secret_key_123_must_be_long_enough_for_hs256';

    /**
     * #### A. PROPÓSITO
     * Comprobar que la petición HTTP actual posea un token JWT válido y vigente 
     * en sus cabeceras, para confirmar la identidad del usuario antes de permitirle 
     * realizar alguna acción protegida.
     *
     * #### B. FUNCIONAMIENTO
     * 1. Captura todas las cabeceras HTTP que envió el cliente (navegador/frontend).
     * 2. Busca específicamente la cabecera `Authorization`.
     * 3. Verifica mediante una expresión regular que el formato sea "Bearer [TOKEN]".
     * 4. Si no hay token, corta la ejecución y retorna un error 401 (No autorizado).
     * 5. Si existe, intenta decodificarlo usando la clave secreta del entorno (o la estática de respaldo) con el algoritmo HS256.
     * 6. Si el token expiró o su firma es inválida, salta al `catch`, corta la ejecución y devuelve un error 401.
     * 7. Si todo es correcto, retorna el objeto con la información decodificada del usuario.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: Ningún parámetro directo. Lee la información global desde las cabeceras HTTP.
     * - Salidas: Si el token es válido, retorna un Objeto (`stdClass`) con los datos del payload del token (id, correo, etc). Si es inválido, imprime un JSON con el error y ejecuta `exit()`.
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Es la principal barrera de defensa de las rutas privadas del backend. 
     * Actúa como una compuerta: si este método falla o detecta anomalías, 
     * ninguna otra parte del código protegido será ejecutada, garantizando 
     * la integridad de los datos.
     *
     * #### E. RIESGOS POTENCIALES
     * - El uso de `exit()` es una forma abrupta de detener el flujo de PHP. En frameworks o arquitecturas complejas, podría dificultar el testeo unitario o cortar flujos de limpieza (garbage collection) globales.
     */
    public static function verificar() {
        // En Apache getallheaders() captura los encabezados HTTP
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $coincidencias)) {
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado, falta el token de acceso']);
            exit();
        }

        $token = $coincidencias[1];
        try {
            $secretoEnv = getenv('JWT_SECRET') ?: self::$secreto;
            $decodificado = JWT::decode($token, new Key($secretoEnv, 'HS256'));
            return $decodificado;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'El token de acceso es inválido o ha expirado']);
            exit();
        }
    }

    /**
     * Verifica que el usuario tenga un token válido y además tenga el rol de 'administrador'.
     * Si no cumple ambas condiciones, bloquea el acceso con un error 403.
     */
    public static function verificarAdmin() {
        $usuario = self::verificar();

        // El rol en la base de datos es 'ADMIN'
        $rol = strtoupper($usuario->rol);
        if ($rol !== 'ADMINISTRADOR' && $rol !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Acceso denegado: Se requieren privilegios de administrador']);
            exit();
        }

        return $usuario;
    }
}