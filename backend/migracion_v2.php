<?php
$host = '127.0.0.1';
$db   = 'bruma_viva_db';
$user = 'root';
$pass = '';
$port = '3306';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;charset=$charset";
try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `$db`;");

    // Desactivar temporalmente llaves foráneas para poder borrar
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("DROP TABLE IF EXISTS cita_servicios, cita_habitaciones, citas, habitaciones, servicios, usuarios, solicitudes_contacto;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 1. TABLA: USUARIOS
    $pdo->exec("
    CREATE TABLE usuarios (
        id_usuario CHAR(36) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        rol ENUM('ADMIN', 'CLIENTE', 'STAFF') DEFAULT 'CLIENTE' NOT NULL,
        estado ENUM('ACTIVO', 'INACTIVO', 'BLOQUEADO') DEFAULT 'ACTIVO' NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;");

    // 2. TABLA: SERVICIOS
    $pdo->exec("
    CREATE TABLE servicios (
        id_servicio CHAR(36) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio_base DECIMAL(10, 2) NOT NULL,
        estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO' NOT NULL
    ) ENGINE=InnoDB;");

    // 3. TABLA: HABITACIONES
    $pdo->exec("
    CREATE TABLE habitaciones (
        id_habitacion CHAR(36) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        tipo ENUM('STANDARD', 'DELUXE', 'SUITE', 'CABANA') NOT NULL,
        capacidad_personas INT NOT NULL,
        tiene_terraza BOOLEAN DEFAULT FALSE,
        tiene_vista BOOLEAN DEFAULT FALSE,
        precio_noche_base DECIMAL(10, 2) NOT NULL,
        estado ENUM('DISPONIBLE', 'FUERA_SERVICIO') DEFAULT 'DISPONIBLE' NOT NULL
    ) ENGINE=InnoDB;");

    // 4. TABLA: CITAS (Transacción Principal)
    $pdo->exec("
    CREATE TABLE citas (
        id_cita CHAR(36) PRIMARY KEY,
        id_usuario CHAR(36) NOT NULL,
        fecha_reserva DATETIME NOT NULL,
        estado ENUM('CREADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA') DEFAULT 'CREADA' NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_citas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
    ) ENGINE=InnoDB;");

    // 5. TABLA PIVOTE: CITA_SERVICIOS
    $pdo->exec("
    CREATE TABLE cita_servicios (
        id CHAR(36) PRIMARY KEY,
        id_cita CHAR(36) NOT NULL,
        id_servicio CHAR(36) NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        precio_actual DECIMAL(10, 2) NOT NULL,
        UNIQUE KEY uk_cita_servicio (id_cita, id_servicio),
        CONSTRAINT fk_cs_cita FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE CASCADE,
        CONSTRAINT fk_cs_servicio FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT
    ) ENGINE=InnoDB;");

    // 6. TABLA PIVOTE: CITA_HABITACIONES
    $pdo->exec("
    CREATE TABLE cita_habitaciones (
        id CHAR(36) PRIMARY KEY,
        id_cita CHAR(36) NOT NULL,
        id_habitacion CHAR(36) NOT NULL,
        cantidad_noches INT NOT NULL DEFAULT 1,
        precio_reserva DECIMAL(10, 2) NOT NULL,
        UNIQUE KEY uk_cita_habitacion (id_cita, id_habitacion),
        CONSTRAINT fk_ch_cita FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE CASCADE,
        CONSTRAINT fk_ch_habitacion FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion) ON DELETE RESTRICT
    ) ENGINE=InnoDB;");

    // 7. TABLA: SOLICITUDES_CONTACTO (Se mantiene casi igual)
    $pdo->exec("
    CREATE TABLE solicitudes_contacto (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(150) NOT NULL,
        telefono VARCHAR(20),
        fechas_solicitadas VARCHAR(100),
        mensaje TEXT,
        estado ENUM('nueva', 'en_proceso', 'resuelta') DEFAULT 'nueva' NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_solicitudes_estado (estado),
        INDEX idx_solicitudes_correo (correo)
    ) ENGINE=InnoDB;");

    function gen_uuid() {
        return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
            mt_rand( 0, 0xffff ),
            mt_rand( 0, 0x0fff ) | 0x4000,
            mt_rand( 0, 0x3fff ) | 0x8000,
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
        );
    }

    // Restaurar el Administrador
    $adminId = gen_uuid();
    $hash = password_hash('Admin_hotel', PASSWORD_BCRYPT, ['cost' => 12]);
    $pdo->exec("INSERT INTO usuarios (id_usuario, nombre, correo, password_hash, rol) VALUES ('$adminId', 'Administrador Principal', 'admin@brumaviva.com', '$hash', 'ADMIN')");

    // Restaurar Habitaciones
    $pdo->exec("INSERT INTO habitaciones (id_habitacion, nombre, tipo, capacidad_personas, tiene_vista, tiene_terraza, precio_noche_base) VALUES 
        ('" . gen_uuid() . "', 'Suite Amanecer', 'SUITE', 2, TRUE, TRUE, 120.00),
        ('" . gen_uuid() . "', 'Suite Familiar', 'SUITE', 6, TRUE, FALSE, 250.00),
        ('" . gen_uuid() . "', 'Cabaña Mirador', 'CABANA', 4, TRUE, TRUE, 180.00)");

    // Restaurar Servicios
    $pdo->exec("INSERT INTO servicios (id_servicio, nombre, descripcion, precio_base) VALUES 
        ('" . gen_uuid() . "', 'Descompresión digital', 'Guardas el celular 60 min (si quieres) y te damos un mapa físico de calma. Perfecto para: descanso, enfoque.', 0.00),
        ('" . gen_uuid() . "', 'Carta de aromas', 'Eliges un aroma (pino, cítrico, cacao) y ajustamos la habitación para tu noche. Perfecto para: romance, sueño.', 15.00),
        ('" . gen_uuid() . "', 'Mapa de bruma', 'Una guía mínima: 3 puntos, 3 tiempos, 3 pausas. Cero estrés. Perfecto para: aventura ligera.', 0.00),
        ('" . gen_uuid() . "', 'Piscina templada al atardecer', 'Temperatura cómoda, iluminación suave y zona de reposo. Recomendación: 30–45 min para descanso real.', 25.00),
        ('" . gen_uuid() . "', 'Fogata segura con kit', 'Te damos encendido controlado, recomendaciones para evitar humo excesivo y un kit de snacks para compartir.', 35.00),
        ('" . gen_uuid() . "', 'Rutas campestres señalizadas', 'Rutas cortas y medianas con puntos de pausa. Incluye “tarjeta de orientación” por si te desvías.', 0.00),
        ('" . gen_uuid() . "', 'Desayuno de origen', 'Café local, fruta fresca y opciones ligeras. Si tienes restricciones, lo adaptamos con anticipación.', 12.50)");

    echo "EXITO: Base de datos actualizada a la nueva arquitectura UUID.";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
