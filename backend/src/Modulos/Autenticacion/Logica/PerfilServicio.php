<?php
namespace App\Modulos\Autenticacion\Logica;

use App\Compartido\Configuracion\BaseDatos;
use Exception;
use PDO;

class PerfilServicio {
    public static function obtenerPerfil($usuarioId) {
        $db = BaseDatos::obtenerInstancia();
        $stmt = $db->prepare('SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE id_usuario = ?');
        $stmt->execute([$usuarioId]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$usuario) {
            throw new Exception('Usuario no encontrado');
        }
        
        return $usuario;
    }

    public static function actualizarPerfil($usuarioId, $nombre, $correo, $contrasenaPlana = null) {
        $db = BaseDatos::obtenerInstancia();
        
        // Verificar si el correo ya está en uso por otro usuario
        $stmt = $db->prepare('SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario != ?');
        $stmt->execute([$correo, $usuarioId]);
        if ($stmt->fetch()) {
            throw new Exception('El correo ya está en uso por otra cuenta');
        }

        if ($contrasenaPlana) {
            $contrasenaHasheada = password_hash($contrasenaPlana, PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $db->prepare('UPDATE usuarios SET nombre = ?, correo = ?, password_hash = ? WHERE id_usuario = ?');
            $stmt->execute([$nombre, $correo, $contrasenaHasheada, $usuarioId]);
        } else {
            $stmt = $db->prepare('UPDATE usuarios SET nombre = ?, correo = ? WHERE id_usuario = ?');
            $stmt->execute([$nombre, $correo, $usuarioId]);
        }
        
        return self::obtenerPerfil($usuarioId);
    }

    public static function desactivarCuenta($usuarioId) {
        $db = BaseDatos::obtenerInstancia();
        
        // Para mantener la integridad de las citas y el historial del hotel,
        // anonimizamos los datos personales en lugar de un DELETE CASCADE.
        $correoAnonimo = 'eliminado_' . BaseDatos::generarUUID() . '@brumaviva.local';
        
        $stmt = $db->prepare('UPDATE usuarios SET nombre = ?, correo = ?, password_hash = ? WHERE id_usuario = ?');
        $exito = $stmt->execute(['Cuenta Desactivada', $correoAnonimo, 'DESACTIVADA', $usuarioId]);
        
        return $exito;
    }
}
