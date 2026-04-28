"""
============================================================================
ARCHIVO: logic.py (La Lógica de Negocio Central)
AUTOR: Yo (El creador del proyecto)

PROPÓSITO Y ARQUITECTURA:
Este archivo representa el verdadero cerebro analítico de mi aplicación. 
Cuando lo creé, pensé en la necesidad de tener un lugar centralizado y robusto 
donde pudiera manejar toda la lógica de negocio pesada, sin sobrecargar 
el servidor web de Node.js. Elegí Python específicamente porque, si el día 
de mañana decido implementar inteligencia artificial para analizar los 
mensajes de los clientes o conectar bases de datos complejas, este lenguaje 
me ofrece las mejores herramientas del mercado.

DECISIONES TÉCNICAS:
Mi primera tarea fue asegurar que la comunicación con Node.js fuera perfecta. 
Para ello, utilicé la librería estándar `sys` para recibir los datos que 
me envía Express a través de los argumentos de la consola. Luego, uso la 
librería `json` para transformar esos textos crudos en diccionarios nativos 
de Python que puedo manipular fácilmente. Es una forma brillante de mantener 
ambos ecosistemas aislados pero comunicados eficientemente.
Al final, me aseguro de que la respuesta sea siempre un JSON bien formateado,
usando `ensure_ascii=False` para que los acentos y caracteres especiales 
del español lleguen perfectos al usuario.
============================================================================
"""

import sys
import json

def process_business_logic(data):
    """
    Motor Central de Lógica de Negocio (Python).
    Aquí es donde integro las validaciones, conexiones a mi base de datos, 
    APIs de terceros (pagos, correos), o modelos de Machine Learning.
    """
    
    # 1. Extraigo los datos validados que me envió el Frontend a través de Express.
    #    Uso .get() para evitar errores si algún campo viene vacío, y .strip()
    #    para limpiar espacios en blanco innecesarios.
    message = data.get('message', '').strip()
    email = data.get('email', '').strip()
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    dates = data.get('dates', '').strip()
    
    # --- ESPACIO PARA MI LÓGICA REAL ---
    # 2. Hago una validación básica: Me aseguro de que el usuario no me haya 
    #    enviado un nombre o un correo vacíos. Si es así, lanzo un error intencional.
    if not email or not name:
        raise ValueError("El nombre y el correo son obligatorios para procesar la solicitud.")
    
    # [!] Aquí es donde a futuro insertaré:
    # - Código para guardar en Base de Datos (ej. SQLAlchemy / psycopg2)
    # - Código para enviar correo de confirmación (ej. smtplib / SendGrid)
    # - Código para procesar NLP avanzado en el mensaje
    
    # 3. Construyo el mensaje final personalizado que el usuario verá en la pantalla.
    msg_respuesta = f"Hemos recibido exitosamente la solicitud de {name} ({email}) para las fechas {dates}."
    
    # 4. Estructuro la respuesta final en un formato estándar (Diccionario)
    #    que luego convertiré en JSON.
    response = {
        "status": "success",
        "message": msg_respuesta,
        "data": {
            "name": name,
            "email": email,
            "phone": phone,
            "dates": dates,
            "processed": True
        }
    }
    
    return response

# PUNTO DE ENTRADA DEL SCRIPT
if __name__ == "__main__":
    try:
        # 1. Verifico que Express realmente me haya pasado datos al ejecutar el script.
        if len(sys.argv) < 2:
            raise ValueError("No se proporcionaron datos de entrada.")
            
        # 2. Tomo el string JSON que me pasó Express (es el argumento #1)
        input_data = sys.argv[1]
        
        # 3. Lo convierto en un diccionario nativo de Python
        parsed_data = json.loads(input_data)
        
        # 4. Le paso el diccionario a mi función principal para que haga su magia
        result = process_business_logic(parsed_data)
        
        # 5. Imprimo el resultado final convertido de vuelta a JSON.
        #    ¡Importante! Uso ensure_ascii=False para no romper los tildes/ñ en español.
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # 6. Si cualquier cosa falla (ej. validaciones, base de datos caída),
        #    atrapo el error aquí, construyo un JSON de error estructurado 
        #    y termino el proceso con sys.exit(1) para que Express sepa que algo falló.
        error_response = {
            "status": "error",
            "message": "Error interno al procesar la solicitud.",
            "error_detail": str(e)
        }
        print(json.dumps(error_response, ensure_ascii=False))
        sys.exit(1)
