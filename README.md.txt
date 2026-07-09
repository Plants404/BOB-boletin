BOB - Boletín Oficial del Board
Descripción

BOB (Boletín Oficial del Board) es una aplicación web desarrollada para centralizar la publicación y consulta de novedades, anuncios, decisiones estratégicas y eventos oficiales del Board.

El sistema permite publicar noticias mediante un formulario web y almacenarlas de forma permanente utilizando Google Sheets como base de datos, evitando la necesidad de contar con un servidor o una base de datos tradicional.

Objetivos
Centralizar la comunicación oficial del Board.
Facilitar la publicación de novedades.
Mantener un historial de noticias.
Ofrecer una interfaz simple e intuitiva.
Permitir la administración de contenido sin conocimientos técnicos.
Funcionalidades
Publicación de novedades.
Visualización de las últimas novedades en la página principal.
Página dedicada con el historial completo de publicaciones.
Almacenamiento permanente mediante Google Sheets.
Actualización automática de las noticias.
Diseño responsive.
Navegación sencilla entre secciones.
Tecnologías utilizadas
HTML5
CSS3
JavaScript (ES6)
Google Sheets
Google Apps Script
Fetch API
Estructura del proyecto
BOB/
?
??? index.html
??? novedades.html
??? style.css
??? script.js
?
??? image/
?   ??? bob logo.png
?
??? README.md
Estructura de la interfaz
Página principal (index.html)

Contiene:

Encabezado con navegación.
Sección principal (Hero).
Últimas novedades.
Formulario para publicar noticias.
Pie de página.
Página de novedades (novedades.html)

Contiene:

Encabezado.
Historial completo de publicaciones.
Carga automática desde Google Sheets.
Enlace para regresar al inicio.
Flujo del sistema
Usuario

      ?

      ?

Formulario Web

      ?

      ?

JavaScript

      ?

      ?

Google Apps Script

      ?

      ?

Google Sheets

      ?

      ?

Carga automática de noticias

      ?

      ?????????? index.html
      ?          (Últimas novedades)
      ?
      ?????????? novedades.html
                 (Historial completo)
Base de datos

El sistema utiliza una hoja de cálculo de Google como almacenamiento.

Estructura
Título	Descripción	Fecha

Cada nueva publicación genera automáticamente una nueva fila.

La interfaz utiliza una identidad visual basada en:

Azul institucional (#163E63)
Verde (#71B52B)
Fondo gris claro
Tipografía Poppins
Responsividad

La aplicación está diseñada para adaptarse a:

Computadoras
Tablets
Dispositivos móviles
Mejoras futuras
Inicio de sesión para administradores.
Edición de publicaciones.
Eliminación de noticias.
Categorías.
Buscador.
Filtro por fechas.
Adjuntar imágenes.
Adjuntar documentos PDF.
Noticias destacadas.
Panel administrativo.
Notificaciones automáticas.
Autor

Proyecto desarrollado como parte de la implementación del Boletín Oficial del Board (BOB).

Licencia

Este proyecto tiene fines educativos y puede ser modificado y reutilizado libremente para proyectos académicos o institucionales.