<?php
namespace App\Modulos\Habitaciones\Logica;

use App\Compartido\Configuracion\BaseDatos;
use PDO;

class HabitacionesServicio {
    public static function obtenerTodas() {
        $db = BaseDatos::obtenerInstancia();
        $stmt = $db->prepare('SELECT * FROM habitaciones WHERE estado = "disponible"');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
