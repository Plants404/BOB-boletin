/* ==========================================
   API.JS
   Comunicación con Google Apps Script
========================================== */

const API = (() => {

    const API_URL = "https://script.google.com/macros/s/AKfycbzhWM6IOxPpQe-JBuyu6-rr5XJmYt5nr8jddsGfyzrIej0TNEOoCb2uMbpHfxOWLOSbeQ/exec";
    /* ==========================================
       OBTENER NOTICIAS
    ========================================== */

    async function obtenerNoticias() {

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {

            throw new Error("No fue posible obtener las publicaciones.");

        }

        const datos = await respuesta.json();

        return datos;

    }

    /* ==========================================
       ENVIAR DATOS
    ========================================== */

    async function enviar(datos) {

        const respuesta = await fetch(API_URL, {

            method: "POST",

            body: JSON.stringify(datos),

            headers: {

                "Content-Type": "text/plain;charset=utf-8"

            }

        });

        if (!respuesta.ok) {

            throw new Error("Error de comunicación.");

        }

        return await respuesta.json();

    }

    /* ==========================================
       CREAR
    ========================================== */

    async function crearNoticia(datos) {

        return await enviar({

            accion: "crear",

            titulo: datos.titulo,

            contenido: datos.contenido,

            fecha: datos.fecha

        });

    }

    /* ==========================================
       EDITAR
    ========================================== */

    async function editarNoticia(id, datos) {

        return await enviar({

            accion: "editar",

            id,

            titulo: datos.titulo,

            contenido: datos.contenido,

            fecha: datos.fecha

        });

    }

    /* ==========================================
       ELIMINAR
    ========================================== */

    async function eliminarNoticia(id) {

        return await enviar({

            accion: "eliminar",

            id

        });

    }

    /* ==========================================
       BUSCAR
    ========================================== */

    function buscarNoticias(lista, texto) {

        if (!texto) return lista;

        texto = texto.toLowerCase();

        return lista.filter(n => {

            const titulo = (n.titulo || "").toLowerCase();

            const contenido = (n.contenido || "")
                .replace(/<[^>]*>/g, "")
                .toLowerCase();

            return titulo.includes(texto) || contenido.includes(texto);

        });

    }

    /* ==========================================
       FILTRAR POR FECHA
    ========================================== */

    function filtrarPorFecha(lista, fecha) {

        if (!fecha) return lista;

        return lista.filter(

            noticia => noticia.fecha === fecha

        );

    }

    /* ==========================================
       ORDENAR
    ========================================== */

    function ordenarNoticias(lista, orden = "desc") {

        return [...lista].sort((a, b) => {

            const fechaA = new Date(a.fecha);

            const fechaB = new Date(b.fecha);

            if (orden === "asc") {

                return fechaA - fechaB;

            }

            return fechaB - fechaA;

        });

    }

    return {

        obtenerNoticias,

        crearNoticia,

        editarNoticia,

        eliminarNoticia,

        buscarNoticias,

        filtrarPorFecha,

        ordenarNoticias

    };

})();