<?php
/**
 * ============================================================================
 * PUNTO DE ENTRADA PRINCIPAL (FRONT CONTROLLER / ENRUTADOR)
 * ============================================================================
 * Este es el archivo principal del backend. Todas las peticiones HTTP dirigidas 
 * a la API pasan obligatoriamente por este único archivo.
 *
 * Resuelve dos problemas críticos en el sistema: 
 * 1. Configura la seguridad de origen (CORS), permitiendo que un frontend 
 *    hospedado en un dominio distinto pueda comunicarse con esta API.
 * 2. Actúa como el Enrutador Central (Router), analizando la URL solicitada 
 *    y redirigiendo el tráfico hacia el controlador específico que lo maneja.
 *
 * Tecnológicamente utiliza PHP procedimental básico. Comienza cargando las 
 * dependencias mediante el autoload de Composer. Luego, lee el método HTTP y 
 * la URL, parsea el JSON del cuerpo de la petición y utiliza estructuras `if/else` 
 * para despachar la acción requerida.
 * ============================================================================
 */

// Forzar Headers CORS inmediatamente al inicio del archivo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejar la petición OPTIONS (Preflight) de forma limpia
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';

use App\Modulos\Autenticacion\Controladores\AutenticacionControlador;
use App\Modulos\Autenticacion\Controladores\PerfilControlador;
use App\Modulos\Citas\Controladores\CitasControlador;
use App\Modulos\Negocio\Controladores\NegocioControlador;
use App\Modulos\Servicios\Controladores\ServiciosControlador;
use App\Modulos\Habitaciones\Controladores\HabitacionesControlador;

/**
 * #### A. PROPÓSITO
 * Configurar las cabeceras HTTP de Cross-Origin Resource Sharing (CORS) para 
 * permitir que el navegador confíe en las respuestas del servidor.
 *
 * #### B. FUNCIONAMIENTO
 * Establece los permisos sobre qué orígenes (* = todos), métodos (GET, POST, etc.) 
 * y cabeceras están autorizados. Además, intercepta peticiones de pre-vuelo (OPTIONS) 
 * enviadas por los navegadores y responde con éxito inmediatamente.
 *
 * #### C. ENTRADAS Y SALIDAS
 * - Entradas: La cabecera HTTP REQUEST_METHOD de la petición actual.
 * - Salidas: Headers HTTP de respuesta.
 *
 * #### D. IMPACTO EN EL SISTEMA
 * Sin esto, la aplicación frontend no podría comunicarse con el backend debido a 
 * las restricciones de seguridad integradas en los navegadores modernos.
 *
 * #### E. RIESGOS POTENCIALES
 * - `Access-Control-Allow-Origin: *` permite peticiones desde cualquier dominio, lo que podría ser un riesgo de seguridad en un entorno de producción estricto.
 */

/**
 * #### A. PROPÓSITO
 * Interpretar la solicitud del usuario, extraer la información enviada y redirigirla 
 * al módulo de negocio correspondiente.
 *
 * #### B. FUNCIONAMIENTO
 * 1. Extrae la URI exacta (ruta solicitada) ignorando parámetros GET.
 * 2. Extrae el Método HTTP (GET, POST, etc).
 * 3. Lee el flujo de entrada `php://input` para decodificar los datos JSON.
 * 4. Pasa por un bloque de condicionales `if/else` comparando la ruta y el método.
 * 5. Si hay coincidencia, invoca la función estática del controlador adecuado.
 * 6. Si ninguna ruta coincide, responde con un error 404 (No encontrado).
 *
 * #### C. ENTRADAS Y SALIDAS
 * - Entradas: URI, Método HTTP, y cuerpo JSON de la petición entrante.
 * - Salidas: Ejecución de un controlador o un mensaje JSON de error 404.
 *
 * #### D. IMPACTO EN EL SISTEMA
 * Es el cerebro de la navegación de la API. Define qué funciones están expuestas 
 * públicamente y cómo se accede a ellas.
 *
 * #### E. RIESGOS POTENCIALES
 * - Un esquema de enrutamiento basado en múltiples `if/else` puede volverse difícil de mantener y propenso a errores humanos a medida que el sistema crezca (spaghetti code).
 */
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$metodo = $_SERVER['REQUEST_METHOD'];
$cuerpo = json_decode(file_get_contents('php://input'), true) ?? [];

$rutas_estaticas = [
    'POST' => [
        '/api/auth/registro' => [AutenticacionControlador::class, 'registrar'],
        '/api/auth/login' => [AutenticacionControlador::class, 'iniciarSesion'],
        '/api/citas' => [CitasControlador::class, 'crear'],
        '/api/procesar' => [NegocioControlador::class, 'procesar'],
    ],
    'GET' => [
        '/api/servicios' => [ServiciosControlador::class, 'listar'],
        '/api/habitaciones' => [HabitacionesControlador::class, 'listar'],
        '/api/citas' => [CitasControlador::class, 'listar'],
        '/api/perfil' => [PerfilControlador::class, 'obtener'],
        '/api/admin/citas' => [CitasControlador::class, 'listarTodasAdmin'],
    ],
    'PUT' => [
        '/api/perfil' => [PerfilControlador::class, 'actualizar'],
    ],
    'DELETE' => [
        '/api/perfil' => [PerfilControlador::class, 'eliminar'],
    ]
];

if (isset($rutas_estaticas[$metodo][$uri])) {
    $parametros = in_array($metodo, ['POST', 'PUT', 'PATCH']) ? [$cuerpo] : [];
    call_user_func_array($rutas_estaticas[$metodo][$uri], $parametros);
} else {
    // Rutas dinámicas
    if ($metodo === 'PUT' && preg_match('/^\/api\/citas\/([a-zA-Z0-9\-]+)$/', $uri)) {
        CitasControlador::reprogramar($cuerpo, $uri);
    } elseif ($metodo === 'PUT' && preg_match('/^\/api\/citas\/([a-zA-Z0-9\-]+)\/cancelar$/', $uri)) {
        CitasControlador::cancelar($uri);
    } elseif ($metodo === 'PUT' && preg_match('/^\/api\/admin\/citas\/([a-zA-Z0-9\-]+)\/estado$/', $uri)) {
        CitasControlador::actualizarEstadoAdmin($cuerpo, $uri);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Ruta no encontrada']);
    }
}