<?php
namespace App\Modulos\Autenticacion\Controladores;

use App\Compartido\Nucleo\AutenticacionMiddleware;
use App\Modulos\Autenticacion\Logica\PerfilServicio;
use Exception;

class PerfilControlador {
    public static function obtener() {
        try {
            $usuario = AutenticacionMiddleware::verificar();
            $perfil = PerfilServicio::obtenerPerfil($usuario->id);
            
            http_response_code(200);
            echo json_encode(['perfil' => $perfil]);
        } catch (Exception $e) {
            http_response_code(404);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function actualizar($req) {
        try {
            $usuario = AutenticacionMiddleware::verificar();
            
            $nombre = !empty($req['nombre']) ? $req['nombre'] : null;
            $correo = !empty($req['correo']) ? $req['correo'] : null;
            $contrasena = !empty($req['contrasena']) ? $req['contrasena'] : null;

            if (!$nombre || !$correo) {
                http_response_code(400);
                echo json_encode(['error' => 'El nombre y correo son obligatorios']);
                return;
            }

            $perfilActualizado = PerfilServicio::actualizarPerfil($usuario->id, $nombre, $correo, $contrasena);
            
            http_response_code(200);
            echo json_encode(['mensaje' => 'Perfil actualizado exitosamente', 'perfil' => $perfilActualizado]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function eliminar() {
        try {
            $usuario = AutenticacionMiddleware::verificar();
            
            $exito = PerfilServicio::desactivarCuenta($usuario->id);
            
            if ($exito) {
                http_response_code(200);
                echo json_encode(['mensaje' => 'Cuenta desactivada exitosamente. Sus datos personales han sido eliminados por privacidad.']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'No se pudo desactivar la cuenta']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error interno: ' . $e->getMessage()]);
        }
    }
}
