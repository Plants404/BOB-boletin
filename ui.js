/* ==========================================
   UI.JS
   Manejo de la interfaz
   ========================================== */

const UI = (() => {

    const contenedor = document.getElementById("contenedorNoticias");
    const loading = document.getElementById("loading");

    /* ==========================
       LOADER
    ========================== */

    function mostrarLoader() {
        if (loading) {
            loading.style.display = "block";
        }
    }

    function ocultarLoader() {
        if (loading) {
            loading.style.display = "none";
        }
    }

    function mostrarLoadingConTexto(texto = "Cargando...") {
        if (loading) {
            loading.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                ${texto}
            `;
            loading.style.display = "block";
        }
    }

    /* ==========================
       LIMPIAR
    ========================== */

    function limpiarNoticias() {
        if (contenedor) {
            contenedor.innerHTML = "";
        }
    }

    /* ==========================
       SIN RESULTADOS
    ========================== */

    function mostrarVacio() {
        if (!contenedor) return;
        contenedor.innerHTML = `
            <div class="card-noticia">
                <h3>No hay novedades</h3>
                <p>Todavía no se ha publicado ninguna noticia.</p>
            </div>
        `;
    }

    /* ==========================
       CREAR CARD
    ========================== */

    function crearCard(noticia) {
        const card = document.createElement("article");
        card.className = "card-noticia";
        card.dataset.id = noticia.id;

        card.innerHTML = `
            <div class="card-actions">
                <button class="action-btn edit" data-id="${noticia.id}" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn delete" data-id="${noticia.id}" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <h3>${noticia.titulo || ""}</h3>
            <div class="contenido-noticia">
                ${noticia.contenido || noticia.descripcion || ""}
            </div>
            <small>📅 ${noticia.fecha || ""}</small>
        `;

        return card;
    }

    /* ==========================
       PINTAR NOTICIAS
    ========================== */

    function pintarNoticias(noticias) {
        limpiarNoticias();

        if (!noticias || noticias.length === 0) {
            mostrarVacio();
            return;
        }

        noticias.forEach(noticia => {
            contenedor.appendChild(crearCard(noticia));
        });
    }

    /* ==========================
       ALERTAS
    ========================== */

    function exito(texto) {
        Swal.fire({
            icon: "success",
            title: texto,
            timer: 1800,
            showConfirmButton: false
        });
    }

    function error(texto) {
        Swal.fire({
            icon: "error",
            title: texto
        });
    }

    /* ==========================
       CONFIRMAR ELIMINAR
    ========================== */

    async function confirmarEliminar() {
        return await Swal.fire({
            title: "¿Eliminar publicación?",
            text: "Esta acción no podrá deshacerse.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#163E63",
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar"
        });
    }

    /* ==========================
       EDITAR
    ========================== */

    async function editarNoticia(noticia) {
        const resultado = await Swal.fire({
            title: "Editar publicación",
            html: `
                <input id="swalTitulo" class="swal2-input" value="${noticia.titulo || ""}">
                <textarea id="swalContenido" class="swal2-textarea">${noticia.contenido || ""}</textarea>
                <input id="swalFecha" class="swal2-input" type="date" value="${noticia.fecha || ""}">
            `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                return {
                    titulo: document.getElementById("swalTitulo").value,
                    contenido: document.getElementById("swalContenido").value,
                    fecha: document.getElementById("swalFecha").value
                };
            }
        });

        return resultado;
    }

    /* ==========================
       RETORNAR API PÚBLICA
    ========================== */

    return {
        mostrarLoader,
        ocultarLoader,
        mostrarLoadingConTexto, // antes se llamaba 'loading'
        limpiarNoticias,
        mostrarVacio,
        pintarNoticias,
        crearCard,
        exito,
        error,
        confirmarEliminar,
        editarNoticia
    };

})();

// ⭐ EXPONER UI GLOBALMENTE PARA QUE APP.JS PUEDA ACCEDER
window.UI = UI;