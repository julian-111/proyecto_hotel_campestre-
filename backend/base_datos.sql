-- ============================================================================
-- ARQUITECTURA DE BASE DE DATOS: BRUMA VIVA
-- ============================================================================
-- Este script crea la estructura de la base de datos para el sistema de 
-- reservaciones y gestión del hotel campestre "Bruma Viva".
-- Diseñado para escalabilidad, integridad referencial y alto rendimiento.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS bruma_viva_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bruma_viva_db;

-- ----------------------------------------------------------------------------
-- 1. TABLA: usuarios
-- Propósito: Almacena los clientes registrados y administradores.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'administrador') DEFAULT 'cliente' NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuarios_correo (correo)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. TABLA: servicios
-- Propósito: Catálogo de servicios o experiencias ofrecidas por el hotel.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) DEFAULT 0.00,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo' NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. TABLA: habitaciones
-- Propósito: Catálogo de cabañas, suites y espacios disponibles.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Ej: Suite, Cabaña, Loft
    capacidad_personas INT NOT NULL DEFAULT 2,
    tiene_vista BOOLEAN DEFAULT FALSE,
    tiene_terraza BOOLEAN DEFAULT FALSE,
    es_familiar BOOLEAN DEFAULT FALSE,
    es_pet_friendly BOOLEAN DEFAULT FALSE,
    precio_noche DECIMAL(10, 2) NOT NULL,
    estado ENUM('disponible', 'mantenimiento', 'inactiva') DEFAULT 'disponible' NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. TABLA: citas (Reservaciones de servicios y habitaciones)
-- Propósito: Registra el agendamiento de los clientes.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    habitacion_id BIGINT NULL,
    fecha DATETIME NOT NULL,
    notas TEXT NULL, -- Agregamos campo de notas por si envían frases o servicios extra en texto temporalmente
    estado ENUM('pendiente', 'confirmada', 'completada', 'cancelada') DEFAULT 'pendiente' NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_citas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_citas_habitacion FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id) ON DELETE SET NULL,
    INDEX idx_citas_usuario (usuario_id),
    INDEX idx_citas_habitacion (habitacion_id),
    INDEX idx_citas_fecha (fecha)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4.1 TABLA PIVOTE: cita_servicios (Relación N a N)
-- Propósito: Permite que una cita tenga múltiples servicios seleccionados (Ej. Masaje y Cena)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cita_servicios (
    cita_id BIGINT NOT NULL,
    servicio_id BIGINT NOT NULL,
    PRIMARY KEY (cita_id, servicio_id),
    CONSTRAINT fk_pivot_cita FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE,
    CONSTRAINT fk_pivot_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. TABLA: solicitudes_contacto
-- Propósito: Almacena los leads o intenciones de reserva enviados desde el frontend.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solicitudes_contacto (
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
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- OPTIMIZACIONES Y SEGURIDAD ADICIONAL
-- ----------------------------------------------------------------------------
-- Se utilizan tipos de datos BIGINT para prever crecimiento futuro.
-- Índices en campos de búsqueda frecuente (correo, fechas, estado).
-- Restricciones de llaves foráneas (ON DELETE CASCADE) para integridad referencial.
-- utf8mb4 asegura soporte completo para caracteres internacionales y emojis.
