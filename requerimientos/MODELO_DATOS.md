# 📊 Modelo de Datos (Diagrama Entidad-Relación)

Basado en el análisis de la página web del Hotel Campestre "Bruma Viva", el formulario de contacto y la lógica de negocio actual (que captura Nombre, Correo, Teléfono, Fechas y Mensaje), he diseñado el siguiente modelo de base de datos relacional.

Este modelo está preparado para ser implementado en motores SQL como PostgreSQL, MySQL o SQLite.

## Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    CLIENTE ||--o{ SOLICITUD : "realiza"
    ESTADO_SOLICITUD ||--o{ SOLICITUD : "define_el_estado_de"
    HABITACION ||--o{ RESERVA_HABITACION : "es_parte_de"
    SOLICITUD ||--o{ RESERVA_HABITACION : "incluye"

    CLIENTE {
        int id_cliente PK
        string nombre "Capturado del formulario"
        string email "Capturado del formulario"
        string telefono "Capturado del formulario"
        datetime fecha_registro "Generado por el sistema"
    }

    SOLICITUD {
        int id_solicitud PK
        int id_cliente FK
        int id_estado FK
        string fechas_deseadas "Capturado del formulario (Ej: 2026-05-10 al 2026-05-15)"
        text mensaje "Comentarios o peticiones extras"
        datetime fecha_creacion "Generado por el sistema"
    }

    ESTADO_SOLICITUD {
        int id_estado PK
        string nombre_estado "Ej: Pendiente, Confirmada, Cancelada"
    }

    HABITACION {
        int id_habitacion PK
        string nombre "Ej: Suite Familiar, Cabaña VIP"
        int capacidad_personas
        decimal precio_noche
        boolean activa "Si está disponible para alquiler"
    }

    RESERVA_HABITACION {
        int id_reserva_habitacion PK
        int id_solicitud FK
        int id_habitacion FK
        decimal precio_acordado "Precio fijado al momento de reservar"
    }
```

## 📖 Explicación de las Tablas (Entidades)

### 1. `CLIENTE`
Almacena la información de las personas que se contactan o se hospedan.
- Evita que dupliquemos datos si una persona hace varias reservas en el futuro.
- Se alimenta directamente de los campos `name`, `email` y `phone` de nuestro formulario.

### 2. `SOLICITUD` (o Reserva)
Es el corazón del sistema. Cada vez que alguien envía el formulario desde el frontend, se crea un registro aquí.
- Guarda las `fechas_deseadas` y el `mensaje` adicional.
- Está conectada al `CLIENTE` (sabiendo quién la pidió) y a un `ESTADO_SOLICITUD` (para saber si ya la atendimos).

### 3. `ESTADO_SOLICITUD`
Una tabla catálogo (o diccionario) muy simple.
- Sirve para que en el futuro los administradores del hotel puedan filtrar: "Muéstrame las solicitudes *Pendientes*" o "Muéstrame las *Confirmadas*".

### 4. `HABITACION`
Representa el inventario físico del hotel (las habitaciones que pusiste en el HTML con su scroll).
- Guarda el nombre, capacidad, precio base y si está activa o en mantenimiento.

### 5. `RESERVA_HABITACION` (Tabla Intermedia)
Como una Solicitud puede incluir varias habitaciones (ej. una familia grande) y una Habitación va a estar en muchas Solicitudes a lo largo del tiempo, esta tabla las conecta.
- Guarda el `precio_acordado` histórico por si en el futuro cambian los precios de las habitaciones, la reserva antigua no se vea afectada.

---
*Nota para el equipo: Este diseño es escalable. A futuro se pueden agregar tablas de `PAGOS`, `FACTURAS` o `SERVICIOS_EXTRA` conectándolas a la tabla `SOLICITUD`.*
