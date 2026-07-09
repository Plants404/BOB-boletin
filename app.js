/* ==========================================
   APP.JS
   Controlador principal de BOB
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
        UI.error("No fue posible publicar.");
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
    const noticia = noticias.find(n => String(n.id) === String(id));
    if (!noticia) return;

    const respuesta = await UI.editarNoticia(noticia);
    if (!respuesta.isConfirmed) return;

    try {
        await API.editarNoticia(id, respuesta.value);
        UI.exito("Publicación actualizada.");
        await cargarNoticias();
    } catch (error) {
        console.error(error);
        UI.error("No fue posible editar.");
    }
}

/* ==========================================
   ELIMINAR
   ========================================== */

async function eliminarNoticia(id) {
    const confirmar = await UI.confirmarEliminar();
    if (!confirmar.isConfirmed) return;

    try {
        await API.eliminarNoticia(id);
        UI.exito("Publicación eliminada.");
        await cargarNoticias();
    } catch (error) {
        console.error(error);
        UI.error("No fue posible eliminar.");
    }
}