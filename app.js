/* ==========================================
   APP.JS
   Controlador principal de BOB
   CORREGIDO: Mejor manejo de errores y validación de ID
   ========================================== */

let noticias = [];

document.addEventListener("DOMContentLoaded", iniciarApp);

async function iniciarApp() {
    configurarFormulario();
    configurarBuscador();
    configurarFiltros();
    configurarAcciones();
    await cargarNoticias();
}

/* ==========================================
   CARGAR NOTICIAS
   ========================================== */

async function cargarNoticias() {
    UI.mostrarLoader();
    try {
        noticias = await API.obtenerNoticias();
        console.log("📦 Noticias cargadas:", noticias); // 🔍 Debug
        mostrarNoticias();
    } catch (error) {
        console.error(error);
        UI.error("No fue posible cargar las publicaciones.");
    } finally {
        UI.ocultarLoader();
    }
}

/* ==========================================
   MOSTRAR NOTICIAS
   ========================================== */

function mostrarNoticias() {
    let lista = [...noticias];

    // BUSCADOR
    const buscar = document.getElementById("buscar");
    if (buscar && buscar.value.trim() !== "") {
        const texto = buscar.value.toLowerCase().trim();
        lista = lista.filter(n => {
            const titulo = (n.titulo || "").toLowerCase();
            const contenido = (n.contenido || "").replace(/<[^>]*>/g, "").toLowerCase();
            return titulo.includes(texto) || contenido.includes(texto);
        });
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

    // SOLO 5 EN INDEX
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
   FORMULARIO
   ========================================== */

function configurarFormulario() {
    const formulario = document.getElementById("newsForm");
    if (!formulario) return;
    formulario.addEventListener("submit", publicarNoticia);
}

async function publicarNoticia(e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (titulo === "") {
        UI.error("Ingrese un título.");
        return;
    }
    if (fecha === "") {
        UI.error("Seleccione una fecha.");
        return;
    }
    if (!quill || quill.getText().trim() === "") {
        UI.error("Escriba el contenido.");
        return;
    }

    const contenido = quill.root.innerHTML;

    try {
        UI.mostrarLoadingConTexto("Publicando...");
        await API.crearNoticia({
            titulo,
            contenido,
            fecha
        });
        UI.exito("Publicación creada.");
        e.target.reset();
        quill.setContents([]);
        await cargarNoticias();
    } catch (error) {
        console.error(error);
        UI.error(error.message || "No fue posible publicar.");
    }
}

/* ==========================================
   BUSCADOR
   ========================================== */

function configurarBuscador() {
    const buscar = document.getElementById("buscar");
    if (!buscar) return;
    buscar.addEventListener("input", mostrarNoticias);
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
   BOTONES EDITAR / ELIMINAR
   ========================================== */

function configurarAcciones() {
    document.addEventListener("click", async (e) => {
        const editar = e.target.closest(".edit");
        const eliminar = e.target.closest(".delete");

        if (editar) {
            editarNoticia(editar.dataset.id);
        }
        if (eliminar) {
            eliminarNoticia(eliminar.dataset.id);
        }
    });
}

/* ==========================================
   EDITAR
   ========================================== */

async function editarNoticia(id) {
    // 🔥 CORRECCIÓN: Convertir a número para comparar
    const idNumber = Number(id);
    const noticia = noticias.find(n => Number(n.id) === idNumber);
    if (!noticia) {
        UI.error("No se encontró la noticia para editar.");
        return;
    }

    const respuesta = await UI.editarNoticia(noticia);
    if (!respuesta.isConfirmed) return;

    // Validar que los campos no estén vacíos
    if (!respuesta.value.titulo.trim()) {
        UI.error("El título no puede estar vacío.");
        return;
    }
    if (!respuesta.value.contenido.trim()) {
        UI.error("El contenido no puede estar vacío.");
        return;
    }

    try {
        await API.editarNoticia(id, respuesta.value);
        UI.exito("Publicación actualizada.");
        await cargarNoticias();
    } catch (error) {
        console.error(error);
        UI.error(error.message || "No fue posible editar.");
    }
}

/* ==========================================
   ELIMINAR (CORREGIDO)
   ========================================== */

async function eliminarNoticia(id) {
    // 🔥 CORRECCIÓN: Validar que el ID sea válido
    const idNumber = Number(id);
    if (isNaN(idNumber) || idNumber <= 0) {
        UI.error("ID de publicación inválido.");
        console.error("❌ ID inválido recibido:", id);
        return;
    }

    console.log("🗑️ Intentando eliminar con ID:", idNumber);

    const confirmar = await UI.confirmarEliminar();
    if (!confirmar.isConfirmed) return;

    try {
        console.log("📤 Enviando eliminación para ID:", idNumber);
        const resultado = await API.eliminarNoticia(idNumber);
        console.log("✅ Resultado de eliminación:", resultado);
        UI.exito("Publicación eliminada correctamente.");
        await cargarNoticias();
    } catch (error) {
        console.error("❌ Error al eliminar:", error);
        // 🔥 CORRECCIÓN: Mostrar el mensaje real del backend
        UI.error(error.message || "No fue posible eliminar la publicación.");
    }
}