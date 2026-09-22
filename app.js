/* ==========================================
   APP.JS
   Controlador principal de BOB
   - Caché Stale-While-Revalidate instantáneo (< 50ms)
   - Actualizaciones Optimistas (0 latencia en UI)
   - Búsqueda con debounce y soporte fonético
   - Manejo de conectividad online/offline
   - Copiado rápido al portapapeles
   ========================================== */

let noticias = [];

document.addEventListener("DOMContentLoaded", iniciarApp);

async function iniciarApp() {
    configurarFormulario();
    configurarBuscador();
    configurarFiltros();
    configurarAcciones();
    configurarConectividad();
    if (document.getElementById("contenedorNoticias")) {
        await cargarNoticias();
    }
}

/* ==========================================
   CARGAR NOTICIAS (Stale-While-Revalidate)
   ========================================== */

async function cargarNoticias() {
    const cacheInicial = API.obtenerCache();

    if (cacheInicial && cacheInicial.length > 0) {
        noticias = cacheInicial;
        mostrarNoticias();
        UI.actualizarEstadoSync("sincronizando");
    } else {
        UI.mostrarSkeletons(4);
        UI.actualizarEstadoSync("sincronizando");
    }

    try {
        const datosServidor = await API.obtenerNoticias({
            onFreshData: (frescas) => {
                noticias = frescas;
                mostrarNoticias();
                UI.actualizarEstadoSync("sincronizado");
            }
        });

        noticias = datosServidor;
        mostrarNoticias();
        UI.actualizarEstadoSync("sincronizado");
    } catch (error) {
        console.error("Error al cargar publicaciones:", error);
        if (noticias.length > 0) {
            UI.actualizarEstadoSync("offline");
        } else {
            UI.actualizarEstadoSync("error");
            UI.error("No fue posible cargar las publicaciones del servidor.");
        }
    } finally {
        UI.ocultarLoader();
    }
}

/* ==========================================
   MOSTRAR NOTICIAS
   ========================================== */

function mostrarNoticias() {
    let lista = [...noticias];

    // BUSCADOR con normalización
    const buscar = document.getElementById("buscar");
    if (buscar && buscar.value.trim() !== "") {
        lista = API.buscarNoticias(lista, buscar.value);
    }

    // FILTRO FECHA
    const filtroFecha = document.getElementById("filtroFecha");
    if (filtroFecha && filtroFecha.value !== "") {
        lista = API.filtrarPorFecha(lista, filtroFecha.value);
    }

    // ORDEN
    const ordenar = document.getElementById("ordenar");
    if (ordenar) {
        lista = API.ordenarNoticias(lista, ordenar.value);
    } else {
        lista = API.ordenarNoticias(lista);
    }

    // LIMITAR A 5 EN INDEX SI CORRESPONDE
    const pagina = location.pathname.split("/").pop();
    if (pagina === "" || pagina === "index.html") {
        lista = lista.slice(0, 5);
    }

    UI.pintarNoticias(lista);
    actualizarContador(lista.length);
}

/* ==========================================
   CONTADOR
   ========================================== */

function actualizarContador(total) {
    const contador = document.getElementById("contadorNoticias");
    if (!contador) return;
    contador.textContent = `${total} publicación${total !== 1 ? "es" : ""}`;
}

/* ==========================================
   UTILIDADES: DEBOUNCE
   ========================================== */

function debounce(fn, delay = 160) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/* ==========================================
   FORMULARIO & PUBLICACIÓN OPTIMISTA
   ========================================== */

function configurarFormulario() {
    const formulario = document.getElementById("newsForm");
    if (!formulario) return;
    formulario.addEventListener("submit", publicarNoticia);
}

async function publicarNoticia(e) {
    e.preventDefault();

    const tituloInput = document.getElementById("titulo");
    const fechaInput = document.getElementById("fecha");
    const titulo = tituloInput.value.trim();
    const fecha = fechaInput.value;

    if (titulo === "") {
        UI.error("Ingrese un título.");
        return;
    }
    if (fecha === "") {
        UI.error("Seleccione una fecha.");
        return;
    }
    if (!quill || quill.getText().trim() === "") {
        UI.error("Escriba el contenido de la publicación.");
        return;
    }

    const contenido = quill.root.innerHTML;
    const tempId = "temp-" + Date.now();

    // Creación optimista inmediata en la UI
    const nuevaNoticia = {
        id: tempId,
        titulo,
        contenido,
        fecha,
        _optimistic: true
    };

    noticias.unshift(nuevaNoticia);
    mostrarNoticias();
    API.agregarCacheItem(nuevaNoticia);
    UI.exito("Publicación creada.");

    // Resetear formulario inmediatamente sin bloquear
    e.target.reset();
    quill.setContents([]);

    // Sincronización en segundo plano
    UI.actualizarEstadoSync("sincronizando");
    try {
        await API.crearNoticia({ titulo, contenido, fecha });
        nuevaNoticia._optimistic = false;
        UI.actualizarEstadoSync("sincronizado");

        // Refrescar en segundo plano para obtener el ID real de Google Sheets
        API.obtenerNoticias({ forzarRed: true }).then(frescas => {
            noticias = frescas;
            mostrarNoticias();
        }).catch(err => console.warn("Refresco silencioso pendiente:", err));
    } catch (error) {
        console.error("Error al publicar en servidor:", error);
        // Rollback en caso de error
        noticias = noticias.filter(n => n.id !== tempId);
        API.eliminarCacheItem(tempId);
        mostrarNoticias();
        UI.actualizarEstadoSync("error");
        UI.error(error.message || "No fue posible guardar en el servidor.");
    }
}

/* ==========================================
   BUSCADOR (Con Debounce)
   ========================================== */

function configurarBuscador() {
    const buscar = document.getElementById("buscar");
    if (!buscar) return;
    buscar.addEventListener("input", debounce(mostrarNoticias, 160));
}

/* ==========================================
   FILTROS
   ========================================== */

function configurarFiltros() {
    const ordenar = document.getElementById("ordenar");
    if (ordenar) {
        ordenar.addEventListener("change", mostrarNoticias);
    }
    const fecha = document.getElementById("filtroFecha");
    if (fecha) {
        fecha.addEventListener("change", mostrarNoticias);
    }
}

/* ==========================================
   ACCIONES (EDITAR / ELIMINAR / COPIAR)
   ========================================== */

function configurarAcciones() {
    document.addEventListener("click", async (e) => {
        const editar = e.target.closest(".edit");
        const eliminar = e.target.closest(".delete");
        const copiar = e.target.closest(".copy");

        if (copiar) {
            copiarNoticia(copiar.dataset.id);
        } else if (editar) {
            editarNoticia(editar.dataset.id);
        } else if (eliminar) {
            eliminarNoticia(eliminar.dataset.id);
        }
    });
}

/* ==========================================
   COPIAR CONTENIDO / ENLACE
   ========================================== */

async function copiarNoticia(id) {
    const noticia = noticias.find(n => String(n.id) === String(id));
    if (!noticia) return;

    const textoLimpio = (noticia.contenido || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const textoCompartir = `*${noticia.titulo}*\nFecha: ${noticia.fecha}\n\n${textoLimpio}\n\n— BOB (Boletín Oficial del Board)`;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textoCompartir);
        } else {
            // Fallback para navegadores antiguos
            const dummy = document.createElement("textarea");
            dummy.value = textoCompartir;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }
        UI.info("Publicación copiada al portapapeles.");
    } catch (err) {
        console.error("Error al copiar:", err);
        UI.error("No se pudo copiar al portapapeles.");
    }
}

/* ==========================================
   EDITAR (Actualización Optimista)
   ========================================== */

async function editarNoticia(id) {
    const noticia = noticias.find(n => String(n.id) === String(id));
    if (!noticia) {
        UI.error("No se encontró la noticia para editar.");
        return;
    }

    const respuesta = await UI.editarNoticia(noticia);
    if (!respuesta.isConfirmed) return;

    const copiaOriginal = { ...noticia };

    // Actualización optimista inmediata
    noticia.titulo = respuesta.value.titulo;
    noticia.contenido = respuesta.value.contenido;
    noticia.fecha = respuesta.value.fecha;
    mostrarNoticias();
    API.actualizarCacheItem(id, respuesta.value);
    UI.exito("Publicación actualizada.");

    // Sincronización en segundo plano
    UI.actualizarEstadoSync("sincronizando");
    try {
        await API.editarNoticia(id, respuesta.value);
        UI.actualizarEstadoSync("sincronizado");
    } catch (error) {
        console.error("Error al editar en el servidor:", error);
        // Rollback
        Object.assign(noticia, copiaOriginal);
        mostrarNoticias();
        API.actualizarCacheItem(id, copiaOriginal);
        UI.actualizarEstadoSync("error");
        UI.error(error.message || "No fue posible actualizar en el servidor.");
    }
}

/* ==========================================
   ELIMINAR (Actualización Optimista)
   ========================================== */

async function eliminarNoticia(id) {
    const indice = noticias.findIndex(n => String(n.id) === String(id));
    if (indice === -1) {
        UI.error("Publicación no encontrada.");
        return;
    }

    const confirmar = await UI.confirmarEliminar();
    if (!confirmar.isConfirmed) return;

    const copiaEliminada = noticias[indice];

    // Eliminación optimista inmediata en UI
    noticias.splice(indice, 1);
    mostrarNoticias();
    API.eliminarCacheItem(id);
    UI.exito("Publicación eliminada.");

    // Sincronización en segundo plano
    UI.actualizarEstadoSync("sincronizando");
    try {
        await API.eliminarNoticia(id);
        UI.actualizarEstadoSync("sincronizado");
    } catch (error) {
        console.error("Error al eliminar en servidor:", error);
        // Rollback
        noticias.splice(indice, 0, copiaEliminada);
        mostrarNoticias();
        API.agregarCacheItem(copiaEliminada);
        UI.actualizarEstadoSync("error");
        UI.error(error.message || "No fue posible eliminar la publicación del servidor.");
    }
}

/* ==========================================
   DETECCIÓN ONLINE / OFFLINE
   ========================================== */

function configurarConectividad() {
    window.addEventListener("online", () => {
        UI.info("Conexión restablecida. Sincronizando...");
        cargarNoticias();
    });

    window.addEventListener("offline", () => {
        UI.actualizarEstadoSync("offline");
    });
}