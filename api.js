/* ==========================================
   API.JS
   Comunicación con Google Apps Script
   CORREGIDO: Asigna ID y valida errores del backend
========================================== */

const API = (() => {

    const API_URL = "https://script.google.com/macros/s/AKfycbx3kY7-I14co11ySO0H6R0UAEL_rKM3YQdfbJ_Cn_Xh2ve87hWK5dA6WenPzD_Iddv2wA/exec";

    /* ==========================================
       OBTENER NOTICIAS (CORREGIDO)
       - Asigna un ID único a cada noticia
       - Prioriza: id, row, rowIndex, o índice+1
    ========================================== */

    async function obtenerNoticias() {

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No fue posible obtener las publicaciones.");
        }

        const datos = await respuesta.json();

        // 🔥 CORRECCIÓN: Asignar ID a cada noticia
        // Si el backend no devuelve id, usamos row, rowIndex o el índice de la lista
        return datos.map((item, index) => {
            // Buscamos un identificador en varios campos posibles
            const id = item.id || item.row || item.rowIndex || (index + 1);
            return { ...item, id };
        });

    }

    /* ==========================================
       ENVIAR DATOS (CORREGIDO)
       - Valida la respuesta del backend
       - Si devuelve success:false o status:"error", lanza excepción
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

        const data = await respuesta.json();

        // 🔥 CORRECCIÓN: Validar si el backend reportó un error
        if (data.success === false || data.status === "error") {
            throw new Error(data.message || "El servidor reportó un error al procesar la solicitud.");
        }

        return data;

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
       ELIMINAR (CORREGIDO)
       - Verifica que el ID no sea undefined
    ========================================== */

    async function eliminarNoticia(id) {

        // 🔥 CORRECCIÓN: Validar que el ID exista antes de enviar
        if (!id) {
            throw new Error("No se puede eliminar: el ID es inválido.");
        }

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