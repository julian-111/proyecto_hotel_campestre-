FROM php:8.2-apache

# Habilitar mod_rewrite y mod_headers de Apache para las rutas limpias y CORS
RUN a2enmod rewrite headers

# Instalar extensiones y herramientas necesarias (Ahora usamos MySQL en lugar de SQLite)
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql

# Instalar Composer globalmente
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar el directorio de trabajo
WORKDIR /var/www/html

# Modificar la configuración de Apache para apuntar a la carpeta "public" y suprimir el warning ServerName
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar todos los archivos del backend
COPY . .

# Dar permisos al usuario de Apache para que pueda crear/modificar la base de datos SQLite
RUN chown -R www-data:www-data /var/www/html

# Instalar las dependencias de Composer (solo si composer.json existe)
RUN if [ -f "composer.json" ]; then composer install --no-dev --optimize-autoloader; fi

EXPOSE 80
