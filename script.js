// =====================================
// CONFIGURACIÓN
// =====================================

// Reemplazar por la URL del Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbwl6qzFaSTFsEZv68Z7Ez3QOqWI1GyeopnklhjYGiNKW5iiYe9cSXG0Iv5ULU6Tinx_lA/exec";

const formulario = document.getElementById("newsForm");
const contenedor = document.getElementById("contenedorNoticias");
const loading = document.getElementById("loading");

// Detectar en qué página estamos
const paginaActual = window.location.pathname.split("/").pop();

// =====================================
// CARGAR NOVEDADES
// =====================================

async function cargarNoticias() {

    if (!contenedor) return;

    if (loading) {
        loading.style.display = "block";
    }

    try {

        const respuesta = await fetch(API_URL);
        const noticias = await respuesta.json();

        contenedor.innerHTML = "";

        if (noticias.length === 0) {

            contenedor.innerHTML = `
                <div class="card">
                    <h3>No hay novedades</h3>
                    <p>Aún no se ha publicado ninguna novedad.</p>
                </div>
            `;

            return;
        }

        // Ordenar desde la más reciente
        let noticiasMostrar = [...noticias].reverse();

        // En index solo mostrar las últimas 5
        if (paginaActual === "" || paginaActual === "index.html") {
            noticiasMostrar = noticiasMostrar.slice(0, 5);
        }

        noticiasMostrar.forEach(noticia => {

            const card = document.createElement("div");

            card.classList.add("card");

            card.innerHTML = `
                <h3>${noticia.titulo}</h3>
                <p>${noticia.descripcion}</p>
                <small>${noticia.fecha}</small>
            `;

            contenedor.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `
            <div class="card">
                <h3>Error</h3>
                <p>No fue posible cargar las novedades.</p>
            </div>
        `;

    } finally {

        if (loading) {
            loading.style.display = "none";
        }

    }

}

// =====================================
// PUBLICAR NOVEDAD
// =====================================

if (formulario) {

    formulario.addEventListener("submit", async function (e) {

        e.preventDefault();

        const titulo = document.getElementById("titulo").value.trim();
        const descripcion = document.getElementById("descripcion").value.trim();
        const fecha = document.getElementById("fecha").value;

        const datos = {
            titulo,
            descripcion,
            fecha
        };

        try {

            const respuesta = await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify(datos)

            });

            if (!respuesta.ok) {
                throw new Error("Error al guardar la novedad.");
            }

            formulario.reset();

            alert("Novedad publicada correctamente.");

            cargarNoticias();

        } catch (error) {

            console.error(error);

            alert("Ocurrió un error al publicar la novedad.");

        }

    });

}

// =====================================
// INICIAR
// =====================================

cargarNoticias();