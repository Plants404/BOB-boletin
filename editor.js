/* ==========================================
   EDITOR.JS
   Configuración de Quill
   - Herramientas tipo Word (fuentes, tamaños,
     colores, listas, alineación, sub/super)
   - Botones deshacer / rehacer
   - Selector de emojis con búsqueda
   ========================================== */


let quill = null;

/* Última selección conocida del editor (para emojis) */

let ultimaSeleccion = null;


/* Emojis disponibles: { e: emoji, n: nombre de búsqueda } */

const EMOJIS = [
    // Caras y emociones
    { e: "😀", n: "sonrisa feliz" },
    { e: "😁", n: "sonrisa ojos" },
    { e: "😂", n: "risa lagrimas" },
    { e: "🤣", n: "risa fuerte" },
    { e: "😊", n: "carita sonriente" },
    { e: "😇", n: "angel feliz" },
    { e: "🙂", n: "sutil sonrisa" },
    { e: "😉", n: "guiño" },
    { e: "😍", n: "amor carita" },
    { e: "😘", n: "beso" },
    { e: "😜", n: "lengua guiño" },
    { e: "🤪", n: "loco" },
    { e: "🤔", n: "pensando dudando" },
    { e: "😎", n: "genial lentes sol" },
    { e: "🤓", n: "nerd" },
    { e: "🤩", n: "estrella ojos" },
    { e: "🥳", n: "fiesta" },
    { e: "😢", n: "tristeza" },
    { e: "😭", n: "llanto" },
    { e: "😅", n: "sudor risa" },
    { e: "🥺", n: "suelica" },
    { e: "😡", n: "enojo" },
    { e: "🤯", n: "explotando cabeza" },
    { e: "💀", n: "calavera" },

    // Manos y gestos
    { e: "👍", n: "pulgar aprobado bien" },
    { e: "👎", n: "pulgar abajo mal" },
    { e: "👌", n: "ok perfecto" },
    { e: "👏", n: "aplausos felicitaciones" },
    { e: "🙌", n: "brazos celebrando" },
    { e: "🤝", n: "apreton manos acuerdo" },
    { e: "👋", n: "hola adios saludo" },
    { e: "✌️", n: "victoria paz" },
    { e: "🤞", n: "cruzar dedos suerte" },
    { e: "🤟", n: "te quiero" },
    { e: "💪", n: "musculo fuerza" },
    { e: "🫶", n: "corazon manos" },
    { e: "👊", n: "punio fuerza" },

    // Corazones
    { e: "❤️", n: "corazon rojo amor" },
    { e: "🧡", n: "corazon naranja" },
    { e: "💛", n: "corazon amarillo" },
    { e: "💚", n: "corazon verde" },
    { e: "💙", n: "corazon azul" },
    { e: "💜", n: "corazon morado" },
    { e: "🖤", n: "corazon negro" },
    { e: "🤍", n: "corazon blanco" },
    { e: "💔", n: "corazon roto" },
    { e: "💕", n: "dos corazones" },
    { e: "💞", n: "corazones girando" },
    { e: "💖", n: "corazon brillante" },
    { e: "💗", n: "corazon latiendo" },
    { e: "💘", n: "corazon flecha" },

    // Clima y naturaleza
    { e: "☀️", n: "sol dia" },
    { e: "⛅", n: "nubes" },
    { e: "🌧️", n: "lluvia" },
    { e: "❄️", n: "nieve frío" },
    { e: "⚡", n: "rayo energia" },
    { e: "🌈", n: "arcoiris" },
    { e: "🌊", n: "ola mar" },
    { e: "🌋", n: "volcan" },
    { e: "🔥", n: "fuego" },
    { e: "🌱", n: "planta crecer" },
    { e: "🌿", n: "hierba" },
    { e: "🌳", n: "arbol" },
    { e: "🍀", n: "trebol suerte" },
    { e: "🌍", n: "planeta tierra" },

    // Comida
    { e: "🍎", n: "manzana" },
    { e: "🍕", n: "pizza" },
    { e: "🍔", n: "hamburguesa" },
    { e: "🍟", n: "papas fritas" },
    { e: "🌮", n: "taco" },
    { e: "🥗", n: "ensalada" },
    { e: "🍩", n: "dona" },
    { e: "🍫", n: "chocolate" },
    { e: "☕", n: "cafe" },
    { e: "🍺", n: "cerveza" },
    { e: "🎂", n: "pastel cumpleaños" },

    // Objetos y herramientas
    { e: "💡", n: "bombilla idea" },
    { e: "🔧", n: "llave herramienta" },
    { e: "🛠️", n: "martillo herramienta" },
    { e: "🔑", n: "llave acceso" },
    { e: "📎", n: "clip adjunto" },
    { e: "📌", n: "chinche fijar" },
    { e: "📋", n: "portapapeles" },
    { e: "📝", n: "nota escribir" },
    { e: "📚", n: "libros" },
    { e: "📖", n: "libro abierto" },
    { e: "📢", n: "altavoz anuncio" },
    { e: "📣", n: "megafono aviso" },
    { e: "📊", n: "grafico datos" },
    { e: "📈", n: "grafico subiendo" },
    { e: "📉", n: "grafico bajando" },
    { e: "🗂️", n: "archivo carpetas" },
    { e: "📅", n: "calendario fecha" },
    { e: "✅", n: "si vistoverde" },
    { e: "❌", n: "no cruz" },
    { e: "❓", n: "signo pregunta" },
    { e: "❗", n: "exclamacion" },
    { e: "⚠️", n: "advertencia cuidado" },
    { e: "ℹ️", n: "informacion" },
    { e: "➕", n: "mas sumar" },
    { e: "➖", n: "menos restar" },
    { e: "➗", n: "dividir" },
    { e: "✖️", n: "multiplicar" },
    { e: "🔄", n: "actualizar girar" },
    { e: "↪️", n: "responder" },
    { e: "🔙", n: "atras" },

    // Celebración y extras
    { e: "🎉", n: "fiesta confeti" },
    { e: "🎊", n: "celebracion globos" },
    { e: "🎁", n: "regalo" },
    { e: "🏆", n: "trofeo logro" },
    { e: "🥇", n: "medalla oro" },
    { e: "🥈", n: "medalla plata" },
    { e: "🥉", n: "medalla bronce" },
    { e: "🎯", n: "diana objetivo" },
    { e: "🎨", n: "paleta arte" },
    { e: "🎧", n: "auriculares" },
    { e: "🚀", n: "cohete lanzar" },
    { e: "✈️", n: "avion viaje" },
    { e: "🏠", n: "casa" },
    { e: "⭐", n: "estrella" },
    { e: "🌟", n: "estrella brillante" },
    { e: "✨", n: "destello brillo" },
    { e: "🔮", n: "bola cristal futuro" },
    { e: "🎮", n: "videojuego" }
];


/* Etiquetas en español para la barra (tooltips al pasar el mouse) */

const ETIQUETAS_BARRA = {
    "ql-bold": "Negrita",
    "ql-italic": "Cursiva",
    "ql-underline": "Subrayado",
    "ql-strike": "Tachado",
    "ql-blockquote": "Cita",
    "ql-code-block": "Bloque de código",
    "ql-link": "Insertar enlace",
    "ql-image": "Insertar imagen",
    "ql-video": "Insertar video",
    "ql-clean": "Limpiar formato",
    "ql-undo": "Deshacer",
    "ql-redo": "Rehacer",
    "ql-emoji": "Insertar emoji",
    "ql-list": {
        ordered: "Lista numerada",
        bullet: "Lista con viñetas",
        check: "Lista de verificación"
    },
    "ql-script": {
        super: "Superíndice",
        sub: "Subíndice"
    },
    "ql-indent": {
        "-1": "Disminuir sangría",
        "+1": "Aumentar sangría"
    },
    "ql-align": {
        left: "Alinear a la izquierda",
        center: "Alinear al centro",
        right: "Alinear a la derecha",
        justify: "Justificar"
    },
    "ql-color": "Color de texto",
    "ql-background": "Color de fondo",
    "ql-header": "Estilo de encabezado",
    "ql-size": "Tamaño de letra",
    "ql-font": "Tipo de fuente"
};


/* Asignar tooltips a todos los controles de la barra */

function configurarTooltips(barra) {
    if (!barra) return;

    barra.querySelectorAll("button").forEach(btn => {
        const clase = Array.from(btn.classList)
            .find(c => c.startsWith("ql-") && c !== "ql-active");
        if (!clase) return;

        let nombre = ETIQUETAS_BARRA[clase];
        if (typeof nombre === "object") {
            const valor = btn.getAttribute("data-value");
            nombre = valor != null ? nombre[valor] : null;
        }
        if (nombre) btn.title = nombre;
    });

    barra.querySelectorAll(".ql-picker").forEach(picker => {
        const clase = Array.from(picker.classList)
            .find(c => c.startsWith("ql-") && c !== "ql-picker");
        if (!clase) return;

        const etiqueta = ETIQUETAS_BARRA[clase];
        const label = picker.querySelector(".ql-picker-label");
        if (label && typeof etiqueta === "string") label.title = etiqueta;

        // Tooltips individuales para las opciones del selector
        if (etiqueta && typeof etiqueta === "object") {
            picker.querySelectorAll(".ql-picker-item").forEach(item => {
                const valor = item.getAttribute("data-value");
                if (valor != null && etiqueta[valor]) {
                    item.title = etiqueta[valor];
                }
            });
        }
    });
}


/* Render de la barra (herramientas tipo Word) */

const TOOLBAR = [
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["undo", "redo"],
    ["clean"]
];


/* Configuración del selector de emojis */

function construirPicker(quill, boton) {
    const picker = document.createElement("div");
    picker.className = "emoji-picker";
    picker.setAttribute("role", "dialog");
    picker.setAttribute("aria-label", "Insertar emoji");

    picker.innerHTML = `
        <input type="text" class="emoji-search" placeholder="Buscar emoji..." aria-label="Buscar emoji">
        <div class="emoji-grid" role="listbox"></div>
    `;

    document.body.appendChild(picker);

    const grid = picker.querySelector(".emoji-grid");
    const search = picker.querySelector(".emoji-search");
    let filtro = "";

    function renderizar() {
        grid.innerHTML = "";
        const coincidencias = EMOJIS.filter(emoji =>
            emoji.n.includes(filtro) || emoji.e.includes(filtro)
        );

        if (coincidencias.length === 0) {
            grid.innerHTML = `<div class="emoji-empty">Sin resultados</div>`;
            return;
        }

        coincidencias.forEach(emoji => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "emoji-item";
            item.dataset.emoji = emoji.e;
            item.textContent = emoji.e;
            item.title = emoji.n;
            item.setAttribute("aria-label", `Insertar ${emoji.e}`);
            grid.appendChild(item);
        });
    }

    renderizar();

    search.addEventListener("input", () => {
        filtro = String(search.value).toLowerCase().trim();
        renderizar();
    });

grid.addEventListener("click", (e) => {
            const item = e.target.closest(".emoji-item");
            if (!item) return;
            insertarEmoji(quill, item.dataset.emoji);
            boton.classList.remove("ql-active");
            cerrar();
        });

    function posicionar() {
        const rect = boton.getBoundingClientRect();
        const anchoPicker = picker.offsetWidth || 280;
        const altoPicker = picker.offsetHeight || 320;

        let izquierda = rect.left;
        const sobra = izquierda + anchoPicker - window.innerWidth;
        if (sobra > 0) izquierda = Math.max(8, izquierda - sobra);

        let arriba = rect.bottom + 8;
        if (arriba + altoPicker > window.innerHeight) {
            arriba = Math.max(8, rect.top - altoPicker - 8);
        }

        picker.style.left = `${izquierda}px`;
        picker.style.top = `${arriba}px`;
    }

    function abrir() {
        posicionar();
        picker.classList.add("open");
        search.value = "";
        filtro = "";
        renderizar();
    }

    function cerrar() {
        picker.classList.remove("open");
    }

    document.addEventListener("click", (e) => {
        if (!picker.contains(e.target) && !boton.contains(e.target)) {
            boton.classList.remove("ql-active");
            cerrar();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            boton.classList.remove("ql-active");
            cerrar();
        }
    });

    window.addEventListener("resize", () => {
        if (picker.classList.contains("open")) posicionar();
    });

    return { abrir, cerrar };
}


/* Insertar emoji en la posición del cursor */

function insertarEmoji(quill, emoji) {
    const rango = quill.getSelection() || ultimaSeleccion || { index: quill.getLength() };
    const indice = rango ? rango.index : quill.getLength();
    quill.insertText(indice, emoji, "user");
    quill.setSelection(indice + emoji.length, 0);
    quill.focus();
}


document.addEventListener(
    "DOMContentLoaded",
    () => {
        const editor = document.getElementById("editor");

        // Si no existe el editor, no ejecutar
        if (!editor) return;

        // Verificar librería Quill
        if (typeof Quill === "undefined") {
            console.error("Quill no está cargado.");
            return;
        }

        // Evitar duplicar instancia
        if (quill !== null) return;

        // Fuentes personalizadas tipo Word
        const Font = Quill.import("attributors/style/font");
        Font.whitelist = [
            "arial",
            "verdana",
            "trebuchet",
            "times",
            "georgia",
            "garamond",
            "courier",
            "impact",
            "comic"
        ];
        Quill.register(Font, true);

        quill = new Quill("#editor", {
            theme: "snow",
            placeholder: "Escriba aquí la novedad oficial...",
            modules: {
                toolbar: {
                    container: TOOLBAR,
                    handlers: {
                        undo() {
                            quill.history.undo();
                        },
                        redo() {
                            quill.history.redo();
                        }
                    }
                }
            }
        });

        // La barra de Quill es un hermano del contenedor del editor
        const barra = editor.parentElement
            ? editor.parentElement.querySelector(".ql-toolbar")
            : null;

        if (barra) {

            // Crear manualmente el botón de emojis (siempre visible)
            const grupoEmoji = document.createElement("span");
            grupoEmoji.className = "ql-formats";
            const botonEmoji = document.createElement("button");
            botonEmoji.type = "button";
            botonEmoji.classList.add("ql-emoji");
            botonEmoji.title = "Insertar emoji";
            botonEmoji.setAttribute("aria-label", "Insertar emoji");
            botonEmoji.textContent = "";
            grupoEmoji.appendChild(botonEmoji);
            barra.appendChild(grupoEmoji);

            // Tooltips en español para toda la barra
            configurarTooltips(barra);

            // Conectar el selector de emojis
            const picker = construirPicker(quill, botonEmoji);
            botonEmoji.addEventListener("click", (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (botonEmoji.classList.contains("ql-active")) {
                    botonEmoji.classList.remove("ql-active");
                    picker.cerrar();
                } else {
                    botonEmoji.classList.add("ql-active");
                    picker.abrir();
                }
            });

        } else {
            console.warn("No se encontró la barra de herramientas de Quill.");
        }

        // Recordar la última selección (el picker quita el foco)
        quill.on("selection-change", (rango) => {
            if (rango) ultimaSeleccion = rango;
        });

        console.log("Editor Quill iniciado correctamente.");
    }
);