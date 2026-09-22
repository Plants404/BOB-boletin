/* ==========================================
   API.JS
   Comunicación con Google Apps Script
   - Caché local inteligente (Stale-While-Revalidate)
   - Normalización fonética y tildes en búsqueda
   - Gestión de IDs y validación robusta de backend
========================================== */

const API = (() => {

    const API_URL = "https://script.google.com/macros/s/AKfycbx3kY7-I14co11ySO0H6R0UAEL_rKM3YQdfbJ_Cn_Xh2ve87hWK5dA6WenPzD_Iddv2wA/exec";
    const STORAGE_KEY = "BOB_NOTICIAS_CACHE";

    /* ==========================================
       GESTIÓN DE CACHÉ LOCAL
    ========================================== */

    function obtenerCache() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn("No se pudo leer la caché local:", e);
            return null;
        }
    }

    function guardarCache(datos) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
        } catch (e) {
            console.warn("No se pudo guardar en la caché local:", e);
        }
    }

    function agregarCacheItem(noticia) {
        const actual = obtenerCache() || [];
        guardarCache([noticia, ...actual]);
    }

    function actualizarCacheItem(id, datosActualizados) {
        const actual = obtenerCache() || [];
        const index = actual.findIndex(n => String(n.id) === String(id));
        if (index !== -1) {
            actual[index] = { ...actual[index], ...datosActualizados };
            guardarCache(actual);
        }
    }

    function eliminarCacheItem(id) {
        const actual = obtenerCache() || [];
        const filtrado = actual.filter(n => String(n.id) !== String(id));
        guardarCache(filtrado);
    }

    /* ==========================================
       OBTENER NOTICIAS (Stale-While-Revalidate)
       - Si hay datos en caché, los devuelve de inmediato (< 50ms)
       - Actualiza desde la red en segundo plano
       - Soporta callback onFreshData para reactividad suave
    ========================================== */

    async function obtenerNoticias(opciones = {}) {
        const { onFreshData, forzarRed = false } = opciones;
        const datosCache = obtenerCache();

        // Petición a la red
        const fetchPromesa = (async () => {
            const respuesta = await fetch(API_URL);

            if (!respuesta.ok) {
                throw new Error("No fue posible obtener las publicaciones del servidor.");
            }

            const datos = await respuesta.json();

            // Asignar ID uniforme a cada noticia
            const formateados = datos.map((item, index) => {
                const id = item.id || item.row || item.rowIndex || (index + 1);
                return { ...item, id };
            });

            // Guardar en caché local
            guardarCache(formateados);

            // Si se suministró callback y los datos cambiaron, notificar
            if (typeof onFreshData === "function") {
                const cambio = JSON.stringify(datosCache) !== JSON.stringify(formateados);
                if (cambio) {
                    onFreshData(formateados);
                }
            }

            return formateados;
        })();

        // Si tenemos caché y no se forzó red, retornar caché de inmediato
        if (datosCache && datosCache.length > 0 && !forzarRed) {
            // Se lanza la petición en background sin bloquear
            fetchPromesa.catch(err => console.warn("Sincronización en background falló:", err));
            return datosCache;
        }

        // Si no hay caché previa, esperar a la red
        try {
            return await fetchPromesa;
        } catch (error) {
            if (datosCache && datosCache.length > 0) {
                console.warn("Error de red, usando datos de caché como respaldo:", error);
                return datosCache;
            }
            throw error;
        }
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
            throw new Error("Error de comunicación con el servidor.");
        }

        const data = await respuesta.json();

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
       ELIMINAR
    ========================================== */

    async function eliminarNoticia(id) {
        if (!id) {
            throw new Error("No se puede eliminar: el ID es inválido.");
        }

        return await enviar({
            accion: "eliminar",
            id
        });
    }

    /* ==========================================
       BUSCAR (Normalización con tildes)
    ========================================== */

    function normalizarTexto(str) {
        return (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function buscarNoticias(lista, texto) {
        if (!texto || !texto.trim()) return lista;

        const normalizado = normalizarTexto(texto);

        return lista.filter(n => {
            const titulo = normalizarTexto(n.titulo || "");
            const contenido = normalizarTexto((n.contenido || "").replace(/<[^>]*>/g, ""));
            return titulo.includes(normalizado) || contenido.includes(normalizado);
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
        ordenarNoticias,
        normalizarTexto,
        obtenerCache,
        guardarCache,
        agregarCacheItem,
        actualizarCacheItem,
        eliminarCacheItem
    };

})();