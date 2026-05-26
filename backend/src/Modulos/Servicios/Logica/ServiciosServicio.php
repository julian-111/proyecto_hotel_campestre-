<?php
namespace App\Modulos\Servicios\Logica;

use App\Compartido\Configuracion\BaseDatos;
use PDO;

class ServiciosServicio {
    public static function obtenerTodos() {
        $db = BaseDatos::obtenerInstancia();
        // Consultamos la tabla "servicios" que el usuario ya creó en phpMyAdmin
        $stmt = $db->prepare('SELECT * FROM servicios');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
