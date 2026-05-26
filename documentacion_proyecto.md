# Lista de tablas

1. **Tabla 1: Cronograma de Actividades (3 Meses)**
   - *Descripción:* Presenta la planificación temporal del proyecto dividida en tres fases mensuales, detallando las actividades principales y los entregables esperados en cada etapa del desarrollo del sistema hotelero.
2. **Tabla 2: Sistema de Testeo Incremental**
   - *Descripción:* Describe el esquema de pruebas de calidad aplicadas al software, alineado estrictamente con los meses del cronograma para garantizar que cada módulo (bases de datos, reservas, etc.) sea validado apenas se desarrolla.
3. **Tabla 3: Comparativa de Metodologías de Desarrollo**
   - *Descripción:* Contrasta las características, ventajas y adaptabilidad de la metodología ágil SCRUM (elegida para el proyecto) frente a la metodología tradicional en Cascada (Waterfall), justificando su uso para el sistema.

# Lista de figuras

*(Aquí se colocarán las capturas de pantalla de los diferentes módulos del sistema hotelero).*

# Introducción

En este espacio se presenta la importancia y el origen de este sistema de gestión hotelero campestre. El origen (sus antecedentes teóricos y prácticos) surge de la necesidad de aplicar los conocimientos de programación que se han ido adquiriendo, pasando de entender la teoría a crear un producto de software real. La importancia de este trabajo radica en comprender cómo funcionan los sistemas de administración de reservas internamente y lograr que la información del hotel se gestione de manera estructurada.

Los objetivos de este proyecto son construir un sistema de gestión funcional, donde la disponibilidad, habitaciones y reservas estén organizadas de forma clara para que el personal pueda operar sin confusiones. Al mismo tiempo, se busca consolidar el aprendizaje escribiendo el código necesario para darle seguridad, interactividad y un diseño agradable a la plataforma.

En cuanto a sus alcances, el proyecto logra mostrar diferentes módulos administrativos, gestión de habitaciones y un área de reservas, todo conectado por un menú de navegación intuitivo. Respecto a sus limitaciones, dado que es un proyecto introductorio, por el momento el sistema no cuenta con pasarelas de pago electrónico complejas ni facturación electrónica en tiempo real. Es un sistema administrativo de control interno, directo y fácil de usar.

La metodología empleada fue un proceso estructurado paso a paso. Primero se realizó el diseño conceptual para definir cómo se verían los paneles de control. Después, se procedió a la etapa de desarrollo escribiendo el código, configurando la base de datos y organizando los módulos. Por último, se aplicó un sistema de testeo incremental para verificar que las reservas y funciones operaran correctamente y corregir los detalles visuales o lógicos que iban surgiendo.

Finalmente, el significado que este estudio tiene en el avance del campo respectivo es la comprobación de que los conceptos de desarrollo de software pueden aplicarse para solucionar una necesidad administrativa real en el sector turístico. Su aplicación en el área investigada deja una base sólida y un sistema funcional que sirve como punto de partida para futuras mejoras del hotel campestre.

---

# 1 CAPÍTULO I

## 1.1 Objetivo General
Desarrollar un sistema de gestión hotelero campestre funcional y accesible mediante la aplicación práctica de lenguajes de programación estructurados, con el fin de organizar, clasificar y administrar información de manera centralizada, utilizando una interfaz gráfica e intuitiva que permita a los administradores y usuarios gestionar habitaciones, servicios y reservas de forma fluida, asegurando así una experiencia de usuario eficiente.

## 1.2 Objetivos Específicos
- Diseñar la arquitectura de información y la interfaz gráfica del sistema hotelero mediante la estructuración lógica de los módulos y la selección de recursos visuales adecuados, garantizando que el personal del hotel navegue intuitivamente por las áreas de administración.
- Construir el código fuente del sistema utilizando lenguajes de programación, integrando bases de datos y la lógica de reservas, con la finalidad de materializar una plataforma digital completamente operativa que responda eficientemente a las operaciones diarias del hotel campestre.
- Validar el comportamiento funcional y de seguridad del sistema mediante la ejecución de un testeo incremental exhaustivo, comprobando la correcta asignación de habitaciones y protección de datos, para asegurar la entrega de un software estable, libre de errores y listo para el entorno real.

## 1.3 Planteamiento Del Problema
El problema principal a resolver es la falta de un sistema informático centralizado y estructurado para administrar las operaciones del hotel campestre. Actualmente, la información de los huéspedes, la disponibilidad de las habitaciones y el registro de los servicios se manejan de forma dispersa, manual o desorganizada. De este problema derivan planteamientos secundarios como la dificultad que tiene el personal para evitar el cruce de reservas, conocer el estado de limpieza de una habitación o acceder rápidamente al historial de un cliente sin cometer errores.

Esto es un problema porque la ausencia de un sistema de gestión claro y funcional limita la capacidad operativa, reduce la eficiencia administrativa y genera una mala experiencia para los huéspedes del hotel. Esta situación se relaciona directamente con el objeto de estudio (el desarrollo de software) ya que demuestra la necesidad de aplicar los conocimientos técnicos de programación para construir una solución real: un sistema hotelero que automatice el control, facilite la administración y resuelva los cuellos de botella en la operación diaria del establecimiento.

## 1.4 Justificación
La motivación principal para la realización de este proyecto radica en la necesidad de aplicar de forma práctica los fundamentos teóricos del desarrollo de software. Al construir un sistema de gestión hotelero campestre desde su concepción visual hasta su codificación y base de datos, se logra consolidar el conocimiento técnico en lenguajes de programación y estructuración de sistemas complejos. Otra razón fundamental es la oportunidad de crear una herramienta tecnológica que resuelva un problema real de administración turística, transformando un control manual desorganizado en un formato digital seguro y estructurado.

El impacto que genera la realización de este proyecto es bidireccional. A nivel académico y profesional, representa un avance significativo en la formación del desarrollador, demostrando competencias en backend, bases de datos y diseño de interfaces. A nivel operativo, el impacto es la mejora inmediata en el control del hotel campestre, proporcionando una herramienta digital que garantiza acceso continuo, claro y eficiente a la disponibilidad de habitaciones, facilitando así la atención al cliente y fortaleciendo la calidad del servicio.

---

# 2 CAPITULO II

## 2.1 Metodología de desarrollo de software
Para la construcción de este sistema de gestión hotelero se seleccionó la **Metodología Ágil SCRUM**. Esta decisión se fundamenta en su enfoque iterativo e incremental, el cual permite desarrollar el software mediante ciclos cortos de trabajo (Sprints). 

**¿Por qué se eligió SCRUM?** 
Se eligió porque facilita la adaptación a cambios de requerimientos (muy comunes en la gestión hotelera donde las reglas de reservas pueden variar) y permite entregar módulos funcionales de manera rápida. 

**¿Por qué nos funciona y por qué es buena para este sistema?**
Nos funciona porque permite dividir un proyecto grande en piezas manejables. Para el hotel campestre, esto significó que pudimos desarrollar y probar el módulo de habitaciones primero, y luego integrar el módulo de reservas sobre una base sólida, en lugar de esperar meses para ver un resultado final. Esto garantiza que si se detecta un error lógico (como un cruce de reservas), se corrige inmediatamente en el sprint actual antes de afectar otras áreas.

### Tabla 3: Comparativa de Metodologías de Desarrollo

| Característica | Metodología Ágil SCRUM (Elegida) | Metodología Tradicional en Cascada (Waterfall) |
|:---:|:---|:---|
| **Enfoque de entrega** | Entregas parciales y funcionales en ciclos cortos (Sprints de semanas). | Una única entrega del software completo al final de todos los meses de desarrollo. |
| **Adaptabilidad al cambio** | Alta. Los cambios en los requerimientos del hotel se integran fácilmente en el siguiente ciclo. | Baja. Una vez aprobados los requerimientos, es costoso y difícil modificarlos. |
| **Pruebas y Correcciones** | Pruebas continuas. Se detectan y corrigen errores de reservas de forma inmediata. | Las pruebas se realizan casi al final del proyecto, acumulando riesgos lógicos. |
| **Beneficio para el Hotel** | El personal puede empezar a usar y validar el módulo de habitaciones mientras se programa el resto. | El personal no ve el sistema hasta que todo esté 100% terminado. |

### 2.1.1 Planificación (Product Backlog)
En esta primera etapa de Scrum se definieron y priorizaron los requerimientos del sistema hotelero. Se listaron todas las funcionalidades necesarias (Dashboard, Habitaciones, Reservas, Clientes) y se organizaron por orden de importancia para la operatividad del hotel campestre.

### 2.1.2 Diseño y Desarrollo Iterativo (Sprints)
Aquí se construyó el sistema dividiendo el trabajo en bloques. En el primer bloque se crearon las bases de datos y la interfaz gráfica. En el segundo bloque se programó la lógica de negocio (CRUD de habitaciones y lógica de reservas). El uso de Scrum permitió desarrollar de manera enfocada, asegurando que cada módulo desarrollado fuera completamente funcional antes de pasar al siguiente.

### 2.1.3 Pruebas Continuas e Implementación
A diferencia de los métodos tradicionales, Scrum integró las pruebas dentro de cada iteración (Testeo Incremental). Se evaluó el registro de huéspedes y el bloqueo de fechas reservadas al instante. Los errores lógicos o visuales encontrados se corrigieron directamente en el código fuente del sprint en curso antes de su despliegue en el entorno final.

## 2.2 Cronograma de Actividades (3 Meses)
El desarrollo del proyecto se planificó en un marco de 3 meses, dividiendo el ciclo de vida del software en fases claras para asegurar la entrega oportuna del sistema hotelero.

| Fase | Mes | Actividades Principales | Entregables |
|:---:|:---:|:---|:---|
| **Fase 1** | **Mes 1** | Toma de requerimientos. Diseño de la arquitectura de la base de datos (tablas de usuarios, habitaciones, reservas). Maquetación de la interfaz gráfica y configuración del entorno de desarrollo. | Modelo Entidad-Relación y Bocetos (Mockups) de la interfaz administrativa. |
| **Fase 2** | **Mes 2** | Codificación del Backend y Frontend. Desarrollo de los módulos *Core* del hotel: Panel de autenticación, CRUD de Habitaciones y lógica del Sistema de Reservas. | Módulos funcionales integrados y base de datos operativa. |
| **Fase 3** | **Mes 3** | Pruebas integrales de todos los módulos. Corrección de errores (debugging). Ajustes de seguridad, optimización de consultas y despliegue final del sistema de gestión. | Sistema de gestión hotelero campestre versión 1.0 funcional. |

## 2.3 Sistema de Testeo Incremental
Para garantizar la calidad del software, se diseñó un esquema de pruebas alineado estrictamente con las fases del cronograma. Cada fase de desarrollo tuvo su respectiva validación.

| Fase de Prueba | Alineación (Mes) | Tipo de Prueba | Descripción de la Evaluación |
|:---:|:---:|:---|:---|
| **Prueba Fase 1** | **Mes 1** | *Pruebas Estructurales y de Conexión* | Se verificó que la base de datos conectara correctamente con el servidor. Se validaron los diseños de interfaz asegurando que los formularios de registro tuvieran los campos correctos para el hotel. |
| **Prueba Fase 2** | **Mes 2** | *Pruebas Unitarias y de Lógica de Negocio* | Se realizaron pruebas exhaustivas en el Módulo de Reservas. Se intentó registrar reservas en fechas duplicadas para confirmar que el sistema arrojara error y evitara el cruce de ocupación de las habitaciones. |
| **Prueba Fase 3** | **Mes 3** | *Pruebas de Sistema (E2E) y Aceptación* | Se simuló el flujo completo de la recepción del hotel: iniciar sesión como recepcionista, registrar un nuevo cliente, asignar una habitación campestre disponible y generar la reserva final. |

## 2.4 Diseño del Entorno de Desarrollo y Arquitectura

El diseño arquitectónico del sistema adopta una estructura cliente-servidor, dividida en dos capas principales: **Frontend** (interfaz de usuario) y **Backend** (lógica y servidor). Esta separación facilita el mantenimiento, la escalabilidad del software y organiza claramente el flujo de información.

### 2.4.1 Entorno Frontend (Capa de Presentación)

El Frontend es la cara visible del sistema, diseñado para que el personal del hotel interactúe de forma sencilla e intuitiva con la información sin necesitar conocimientos técnicos.

- **Interfaz Gráfica (UI):** Se diseñó un Dashboard con tarjetas semánticas para indicadores rápidos y tablas dinámicas para inventarios. Se utilizan ventanas modales para el ingreso de datos, evitando recargas completas de la página.
  - *Tecnologías Aplicadas:* **HTML5** (estructuración de contenido) y **CSS3 / Frameworks UI** (estilizado rápido y componentes visuales preconstruidos).
- **Experiencia de Usuario (UX) e Interactividad:** Se priorizó una navegación ágil y fluida. El uso de calendarios visuales y respuestas inmediatas permite interpretar la disponibilidad de habitaciones de manera instantánea.
  - *Tecnologías Aplicadas:* **JavaScript (Vanilla JS)** para manipulación dinámica del DOM, validaciones de formularios en tiempo real y consumo de datos mediante peticiones asíncronas (AJAX/Fetch).
- **Adaptabilidad (Responsive Design):** Se aplicó un sistema de cuadrícula (grid) fluida que permite operar el sistema tanto desde monitores de recepción como desde tablets, manteniendo la identidad visual campestre del hotel.
  - *Tecnologías Aplicadas:* **CSS Media Queries** y diseño móvil estructurado para asegurar la compatibilidad en múltiples resoluciones.

### 2.4.2 Entorno Backend (Capa de Lógica y Servidor)

El Backend es el motor del sistema. Procesa solicitudes, aplica reglas estrictas de negocio (ej. evitar overbooking) y gestiona el almacenamiento seguro de la información.

- **Arquitectura y Casos de Uso:** El código se organizó bajo un modelo de Monolito Modular, separando la lógica en flujos específicos como: Autenticación de usuarios, CRUD de habitaciones y el motor algorítmico de Reservas.
  - *Tecnologías Aplicadas:* **PHP 8.2**, aprovechando su tipado estricto, su alto rendimiento y su robusta orientación a objetos para el control de la lógica.
- **Gestión de Base de Datos y Persistencia:** Se diseñó una base relacional estructurada con entidades interconectadas (`usuarios`, `habitaciones`, `citas`) y reglas de integridad referencial para evitar inconsistencias en las reservas.
  - *Tecnologías Aplicadas:* **MySQL** (base de datos relacional `bruma_viva_db`) y herramientas de administración directa como **phpMyAdmin**.
- **Infraestructura, Conexión y Seguridad:** El entorno se virtualizó para garantizar estabilidad sin importar el equipo de cómputo. La conexión a datos está blindada contra inyecciones SQL mediante consultas preparadas.
  - *Tecnologías Aplicadas:* **Docker** (contenedorización que incluye un servidor web **Apache**), y la interfaz **PDO (PHP Data Objects)** para una conexión segura a la base de datos MySQL.

---

# 3 CAPITULO III

## 3.1 Manual de usuario
El sistema cuenta con una estructura de navegación diseñada para que el personal del hotel encuentre y gestione la información de forma rápida. A continuación, se explica para qué sirve cada módulo y qué acciones se pueden realizar en ellos:

### 1. Panel de Control (Dashboard)
Es la pantalla principal que aparece al iniciar sesión en el sistema. Sirve como resumen del estado actual del hotel campestre.
- **Indicadores de Ocupación:** Muestra de forma rápida cuántas habitaciones están ocupadas, libres o en mantenimiento.
- **Accesos Rápidos:** Botones grandes que llevan directamente a "Nueva Reserva" o "Registro de Huésped".

### 2. Módulo de Habitaciones
Esta área contiene el inventario completo de las instalaciones del hotel.
- **Filtros de Búsqueda:** Permite buscar habitaciones por tipo (Sencilla, Doble, Cabaña Campestre) o por su estado actual.
- **Botón "Detalles / Modificar":** Despliega información sobre la capacidad de la habitación, su tarifa por noche y permite cambiar su estado (ej. cambiar a "Limpieza").

### 3. Módulo de Reservas
Aquí se centraliza toda la agenda y el calendario de ocupación.
- **Calendario Interactivo:** Muestra visualmente las fechas reservadas. Al hacer clic en un día libre, abre el formulario para registrar un nuevo huésped.
- **Formulario de Reserva:** Campos de texto donde el recepcionista ingresa los datos del cliente, fechas de entrada (Check-in) y salida (Check-out). El sistema asocia automáticamente la habitación.

### 4. Módulo de Usuarios y Seguridad
Es la sección destinada a la administración del personal que usa el sistema.
- **Botón "Registrar Empleado":** Permite crear cuentas para nuevos recepcionistas o administradores con contraseñas seguras.
- **Botón "Cerrar Sesión":** Finaliza de manera segura el turno del empleado actual, protegiendo la información del hotel.

## 3.2 Implementación del Sistema

La fase de implementación es el momento en el que todos los diseños y códigos se unen para que el sistema del hotel empiece a funcionar de verdad en una computadora. Para que el personal pueda usarlo sin problemas, el proceso se dividió en pasos muy prácticos:

### A. Preparación de la Computadora (Entorno)
Para que el sistema funcione, necesita ciertos programas especiales. En lugar de instalar todo uno por uno en las computadoras de la recepción (lo cual es lento y causa errores), se utilizó una herramienta que "empaqueta" el sistema.
- **¿Qué significa esto para el hotel?:** Significa que el sistema viene listo en una "caja" virtual. Al encender esta caja, el sistema de reservas y el inventario de habitaciones funcionan exactamente igual en cualquier computadora, sin importar si es nueva o vieja.

### B. Creación del Archivero (Base de Datos)
Antes de guardar la primera reserva, el sistema necesita organizar sus gavetas digitales.
- **¿Qué significa esto para el hotel?:** Se estructuró un espacio seguro donde se guardará todo de forma ordenada: la lista de habitaciones, los datos de los huéspedes y las contraseñas de los recepcionistas. Esto asegura que la información esté protegida y se pueda trasladar fácilmente a otro equipo sin perder datos.

### C. Conexión del Sistema con el Archivero
Una vez que tenemos la parte visual (pantallas) y el archivero (base de datos), ambos deben comunicarse.
- **¿Qué significa esto para el hotel?:** Se creó un "puente seguro" interno. Cada vez que un recepcionista guarda una reserva desde la pantalla, este puente verifica que la información esté correcta y la guarda bajo llave. Además, todas las "llaves" o contraseñas del sistema están guardadas en un solo lugar, lo que hace que sea muy fácil para el administrador cambiarlas si es necesario.

### D. Encendido y Primer Acceso
Es el paso final donde se le entrega la "llave principal" al hotel.
- **¿Qué significa esto para el hotel?:** El sistema se enciende y queda listo para usarse. Se entrega configurado con un "Usuario Administrador" principal. Con este usuario, el gerente del hotel puede entrar por primera vez, registrar a sus empleados, poner los precios a las habitaciones campestres y comenzar a gestionar las reservas reales de los clientes de inmediato.

---

# 4 CAPITULO IV

## 4.1 Conclusiones
El desarrollo de este proyecto ha permitido comprobar que la aplicación de los fundamentos de la ingeniería de software resulta fundamental para resolver problemas reales de administración en el sector hotelero. En primer lugar, se concluye que la estructuración lógica de la base de datos y la interfaz en el primer mes de desarrollo garantizó que el personal pueda operar el sistema de forma intuitiva, evitando el caos en los registros manuales.

En segundo lugar, la fase de codificación demostró que la programación de reglas de negocio estrictas (como evitar reservas duplicadas) es clave para la funcionalidad del hotel campestre. Se logró materializar la herramienta propuesta, demostrando que la teoría adquirida se puede transformar en un sistema tecnológico de alta utilidad.

Finalmente, el esquema de testeo incremental evidenció la importancia de alinear las pruebas con el cronograma. Validar el funcionamiento de cada módulo mes a mes permitió entregar un sistema estable y libre de errores críticos. En resumen, este proyecto cumple a cabalidad con su objetivo general, dejando como resultado un sistema de gestión hotelero campestre centralizado y seguro, que proporciona una base sólida para optimizar los procesos operativos del establecimiento turístico.

---

# 5 Referencias
- Documentación oficial de los lenguajes de programación y bases de datos utilizados para la estructura del sistema.
- Principios de diseño de interfaces administrativas (Dashboards) aplicados a la gestión hotelera.