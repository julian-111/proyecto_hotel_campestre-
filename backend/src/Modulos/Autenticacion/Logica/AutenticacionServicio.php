<?php
/**
 * ============================================================================
 * SERVICIO DE AUTENTICACIÓN
 * ============================================================================
 * Este archivo contiene la lógica de negocio pura encargada de gestionar la 
 * creación de usuarios y la verificación de sus credenciales. Interactúa 
 * de manera directa y segura con la base de datos.
 *
 * Su propósito principal es aislar las reglas de seguridad complejas, como 
 * la encriptación de contraseñas (hashing) y la generación de tokens de 
 * acceso (JWT), manteniendo los controladores limpios y libres de consultas SQL.
 *
 * Tecnológicamente, implementa algoritmos de encriptación estándar de PHP 
 * (Bcrypt) para salvaguardar las contraseñas, y hace uso de la librería 
 * Firebase JWT para emitir tokens seguros. Accede a la base de datos a 
 * través del patrón Singleton con PDO para evitar inyecciones SQL.
 * ============================================================================
 */
namespace App\Modulos\Autenticacion\Logica;

use App\Compartido\Configuracion\BaseDatos;
use Firebase\JWT\JWT;
use Exception;
use PDO;

class AutenticacionServicio {
    /**
     * #### A. PROPÓSITO
     * Registrar un nuevo usuario en la base de datos validando que su correo 
     * no exista previamente y asegurando su contraseña.
     *
     * #### B. FUNCIONAMIENTO
     * 1. Consulta la base de datos para ver si el correo ya está registrado.
     * 2. Si el correo existe, lanza una excepción abortando el proceso.
     * 3. Si el correo está libre, aplica la función `password_hash` con el algoritmo BCRYPT y costo 12 a la contraseña plana.
     * 4. Inserta el nuevo registro (nombre, correo, contraseña encriptada).
     * 5. Retorna los datos básicos del nuevo usuario junto con su ID generado.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: `$nombre` (String), `$correo` (String), `$contrasenaPlana` (String sin encriptar).
     * - Salidas: Array asociativo con 'id', 'nombre' y 'correo'.
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Agrega registros en la tabla de `usuarios`. Garantiza la unicidad de las
     * cuentas mediante la verificación del correo y protege el sistema contra 
     * filtraciones almacenando solo los hashes de las contraseñas, nunca su valor real.
     *
     * #### E. RIESGOS POTENCIALES
     * - Si la base de datos no tiene una restricción `UNIQUE` en la columna correo, una condición de carrera (race condition) entre dos peticiones simultáneas podría registrar el mismo correo dos veces.
     */
    public static function registrar($nombre, $correo, $contrasenaPlana) {
        $db = BaseDatos::obtenerInstancia();
        
        $stmt = $db->prepare('SELECT id_usuario FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            throw new Exception('El usuario ya existe con este correo');
        }

        $contrasenaHasheada = password_hash($contrasenaPlana, PASSWORD_BCRYPT, ['cost' => 12]);
        $idUsuario = BaseDatos::generarUUID();
        
        $stmt = $db->prepare('INSERT INTO usuarios (id_usuario, nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$idUsuario, $nombre, $correo, $contrasenaHasheada, 'CLIENTE']);

        return [
            'id' => $idUsuario,
            'nombre' => $nombre,
            'correo' => $correo,
            'rol' => 'CLIENTE'
        ];
    }

    /**
     * #### A. PROPÓSITO
     * Comprobar la identidad del usuario cotejando sus credenciales y generarle 
     * una llave de acceso temporal (Token JWT) si son correctas.
     *
     * #### B. FUNCIONAMIENTO
     * 1. Busca al usuario en la base de datos usando el correo.
     * 2. Si el usuario no existe, o si la función `password_verify` falla al comparar la contraseña plana con el hash almacenado, lanza una excepción de "Credenciales inválidas".
     * 3. Si las credenciales coinciden, construye un payload con el ID, el correo y una fecha de expiración (1 hora).
     * 4. Genera y firma un token JWT usando una clave secreta (obtenida del entorno).
     * 5. Retorna el token generado y los datos del usuario.
     *
     * #### C. ENTRADAS Y SALIDAS
     * - Entradas: `$correo` (String), `$contrasenaPlana` (String).
     * - Salidas: Array asociativo que contiene el 'token' firmado y un sub-array 'usuario' con los datos del perfil.
     *
     * #### D. IMPACTO EN EL SISTEMA
     * Es el corazón de la seguridad de sesiones del sistema. Su correcta ejecución 
     * es vital para evitar que usuarios no autorizados accedan a rutas protegidas.
     *
     * #### E. RIESGOS POTENCIALES
     * - Si la clave secreta por defecto (`super_secret_key_123`) llega a producción sin ser sobreescrita por variables de entorno, cualquier atacante podría falsificar tokens y obtener acceso total.
     */
    public static function iniciarSesion($correo, $contrasenaPlana) {
        $db = BaseDatos::obtenerInstancia();
        
        $stmt = $db->prepare('SELECT * FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario || !password_verify($contrasenaPlana, $usuario['password_hash'])) {
            throw new Exception('Credenciales inválidas');
        }

        $secretoEnv = getenv('JWT_SECRET') ?: 'super_secret_key_123_must_be_long_enough_for_hs256';
        
        $payload = [
            'id' => $usuario['id_usuario'],
            'correo' => $usuario['correo'],
            'rol' => $usuario['rol'],
            'exp' => time() + 3600 // Expira en 1 hora
        ];
        
        $token = JWT::encode($payload, $secretoEnv, 'HS256');

        return [
            'token' => $token,
            'usuario' => [
                'id' => $usuario['id_usuario'],
                'nombre' => $usuario['nombre'],
                'correo' => $usuario['correo'],
                'rol' => $usuario['rol']
            ]
        ];
    }
}