<?php
namespace App\Modulos\Habitaciones\Controladores;

use App\Modulos\Habitaciones\Logica\HabitacionesServicio;
use Exception;

class HabitacionesControlador {
    public static function listar() {
        try {
            $habitaciones = HabitacionesServicio::obtenerTodas();
            
            http_response_code(200);
            echo json_encode(['habitaciones' => $habitaciones], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al obtener el listado de habitaciones']);
        }
    }
}
