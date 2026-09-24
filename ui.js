/* ==========================================
   UI.JS
   Manejo de la interfaz
   - Skeleton Loaders con Shimmer Effect
   - Toasts no intrusivos
   - Badge de sincronización de red
   - Accesibilidad mejorada (ARIA labels)
   ========================================== */

const UI = (() => {

    const contenedor = document.getElementById("contenedorNoticias");
    const loading = document.getElementById("loading");

    /* ==========================
       TOASTS (No bloqueantes)
    ========================== */

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2600,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        }
    });

    function exito(texto) {
        Toast.fire({
            icon: "success",
            title: texto
        });
    }

    function error(texto) {
        Toast.fire({
            icon: "error",
            title: texto
        });
    }

    function info(texto) {
        Toast.fire({
            icon: "info",
            title: texto
        });
    }

    /* ==========================
       SKELETON LOADERS
    ========================== */

    function mostrarSkeletons(cantidad = 3) {
        if (!contenedor) return;
        ocultarLoader();
        contenedor.innerHTML = "";

        for (let i = 0; i < cantidad; i++) {
            const skeleton = document.createElement("article");
            skeleton.className = "card-noticia skeleton-card";
            skeleton.setAttribute("aria-hidden", "true");
            skeleton.innerHTML = `
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-text"></div>
                <div class="skeleton-line skeleton-text"></div>
                <div class="skeleton-line skeleton-text short"></div>
                <div class="skeleton-line skeleton-date"></div>
            `;
            contenedor.appendChild(skeleton);
        }
    }

    /* ==========================
       LOADER TRADICIONAL
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
       BADGE DE SINCRONIZACIÓN
    ========================== */

    function actualizarEstadoSync(estado) {
        const badges = document.querySelectorAll(".sync-badge");
        badges.forEach(badge => {
            badge.className = `sync-badge sync-${estado}`;
            if (estado === "sincronizado") {
                badge.innerHTML = `<span class="sync-dot"></span> Sincronizado`;
                badge.title = "Datos al día con el servidor";
            } else if (estado === "sincronizando") {
                badge.innerHTML = `<span class="sync-dot fa-spin"></span> Sincronizando...`;
                badge.title = "Actualizando información en segundo plano...";
            } else if (estado === "offline") {
                badge.innerHTML = `<span class="sync-dot"></span> Sin conexión`;
                badge.title = "Mostrando datos guardados localmente";
            } else if (estado === "error") {
                badge.innerHTML = `<span class="sync-dot"></span> Error de red`;
                badge.title = "No se pudo sincronizar con el servidor";
            }
        });
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
            <div class="card-noticia card-vacia">
                <i class="fa-solid fa-folder-open" style="font-size: 32px; color: var(--text-light); margin-bottom: 12px;"></i>
                <h3>No hay novedades</h3>
                <p>Todavía no se ha publicado ninguna noticia o no coincide con los filtros aplicados.</p>
            </div>
        `;
    }

    /* ==========================
       CREAR CARD
    ========================== */

    function crearCard(noticia) {
        const card = document.createElement("article");
        card.className = `card-noticia ${noticia._optimistic ? "optimistic-card" : ""}`;
        card.dataset.id = noticia.id;

        const syncIndicator = noticia._optimistic 
            ? `<span class="tag-sync-optimistic" title="Sincronizando con Google Sheets"><i class="fa-solid fa-arrows-rotate fa-spin"></i> Guardando...</span>` 
            : "";

        card.innerHTML = `
            <div class="card-actions card-actions-menu">
                ${syncIndicator}
                <div class="card-menu">
                    <button class="action-btn card-menu-toggle" data-id="${noticia.id}" title="Acciones" aria-label="Acciones de la publicación" aria-haspopup="true">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    <div class="card-menu-items">
                        <button class="card-menu-item copy" data-id="${noticia.id}" title="Copiar al portapapeles">
                            <i class="fa-solid fa-copy"></i> Copiar
                        </button>
                        <button class="card-menu-item edit" data-id="${noticia.id}" title="Editar">
                            <i class="fa-solid fa-pen"></i> Editar
                        </button>
                        <button class="card-menu-item delete" data-id="${noticia.id}" title="Eliminar">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
            <h3>${noticia.titulo || ""}</h3>
            <div class="contenido-noticia">
                ${noticia.contenido || noticia.descripcion || ""}
            </div>
            <small>📅 ${noticia.fecha || ""}</small>
        `;

        const toggle = card.querySelector(".card-menu-toggle");
        const items = card.querySelector(".card-menu-items");
        if (toggle && items) {
            toggle.addEventListener("click", (e) => {
                e.stopPropagation();
                document.querySelectorAll(".card-menu-items.open").forEach(menu => {
                    if (menu !== items) menu.classList.remove("open");
                });
                items.classList.toggle("open");
            });
        }

        return card;
    }

    /* ==========================
       PINTAR NOTICIAS
    ========================== */

    function pintarNoticias(noticias) {
        if (!contenedor) return;
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
        const editorId = "editorModal";
        let editarQuill = null;

        const resultado = await Swal.fire({
            title: "Editar publicación",
            width: "min(920px, 96vw)",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            html: `
                <div class="swal-editar-grid">
                    <div>
                        <label class="swal-etiqueta" for="swalTitulo">Título</label>
                        <input id="swalTitulo" class="swal2-input" placeholder="Título" value="${(noticia.titulo || "").replace(/"/g, "&quot;")}">
                    </div>
                    <div>
                        <label class="swal-etiqueta" for="swalFecha">Fecha</label>
                        <input id="swalFecha" class="swal2-input" type="date" value="${noticia.fecha || ""}">
                    </div>
                </div>
                <label class="swal-etiqueta" for="${editorId}">Contenido</label>
                <div id="${editorId}"></div>
            `,
            didOpen: () => {
                const contenedor = document.getElementById(editorId);
                editarQuill = window.crearInstanciaQuill
                    ? crearInstanciaQuill(contenedor, noticia.contenido || noticia.descripcion || "")
                    : null;
            },
            willClose: () => {
                editarQuill = null;
            },
            preConfirm: () => {
                const tit = document.getElementById("swalTitulo").value;
                const fec = document.getElementById("swalFecha").value;
                const cont = editarQuill ? editarQuill.root.innerHTML : "";

                if (!tit.trim() || !editarQuill || editarQuill.getText().trim() === "") {
                    Swal.showValidationMessage("El título y el contenido no pueden estar vacíos.");
                    return false;
                }
                return {
                    titulo: tit,
                    contenido: cont,
                    fecha: fec
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
        mostrarLoadingConTexto,
        mostrarSkeletons,
        actualizarEstadoSync,
        limpiarNoticias,
        mostrarVacio,
        pintarNoticias,
        crearCard,
        exito,
        error,
        info,
        confirmarEliminar,
        editarNoticia
    };

})();

// ⭐ EXPONER UI GLOBALMENTE PARA QUE APP.JS PUEDA ACCEDER
window.UI = UI;


/* ==========================
   MENÚ HAMBURGUESA (MÓVIL)
========================== */

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("menuPrincipal");
    if (!toggle || !nav) return;

    function cerrar() {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        toggle.setAttribute("aria-label", "Abrir menú");
    }

    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const abierto = document.body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", String(abierto));
        toggle.innerHTML = abierto
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
        toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });

    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", cerrar);
    });

    document.addEventListener("click", (e) => {
        if (document.body.classList.contains("menu-open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
            cerrar();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) cerrar();
    });
});


/* ==========================
   MENÚ HAMBURGUESA DE TARJETAS
   (acciones: copiar / editar / eliminar)
========================== */

document.addEventListener("click", (e) => {
    if (!e.target.closest(".card-menu-toggle")) {
        document.querySelectorAll(".card-menu-items.open")
            .forEach(menu => menu.classList.remove("open"));
    }
});