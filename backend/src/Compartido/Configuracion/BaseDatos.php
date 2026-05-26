<?php
namespace App\Compartido\Configuracion;

use PDO;
use PDOException;

class BaseDatos {
    private static $instancia = null;

    public static function obtenerInstancia() {
        if (self::$instancia === null) {
            
            // Obtenemos las credenciales desde las variables de entorno inyectadas por Docker Compose
            $host = getenv('DB_HOST') ?: '127.0.0.1';
            $db   = getenv('DB_NAME') ?: 'bruma_viva_db';
            $user = getenv('DB_USER') ?: 'root';
            $pass = getenv('DB_PASS') ?: '';
            $port = getenv('DB_PORT') ?: '3306';
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
            
            $opciones = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lanzar excepciones en caso de error
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Devolver arrays asociativos
                PDO::ATTR_EMULATE_PREPARES   => false,                  // Usar prepared statements reales
            ];

            try {
                self::$instancia = new PDO($dsn, $user, $pass, $opciones);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error crítico: No se pudo conectar a la base de datos MySQL local. Verifica que XAMPP/WAMP esté encendido. Detalle: ' . $e->getMessage()]);
                exit();
            }
        }
        return self::$instancia;
    }

    /**
     * Genera un UUID v4 (Identificador Único Universal)
     * Utilizado para las nuevas llaves primarias CHAR(36) de la base de datos.
     */
    public static function generarUUID() {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
