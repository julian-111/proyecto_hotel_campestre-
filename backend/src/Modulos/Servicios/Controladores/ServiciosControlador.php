<?php
namespace App\Modulos\Servicios\Controladores;

use App\Modulos\Servicios\Logica\ServiciosServicio;
use Exception;

class ServiciosControlador {
    public static function listar() {
        try {
            $servicios = ServiciosServicio::obtenerTodos();
            
            http_response_code(200);
            echo json_encode(['servicios' => $servicios], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al obtener el listado de servicios de la base de datos']);
        }
    }
}
