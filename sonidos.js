/* ==========================================
   SONIDOS.JS
   Feedback de sonido al hacer clic en botones
   y enlaces (Web Audio API, sin archivos)
   ========================================== */

const Sonido = (() => {

    let audioCtx = null;

    function obtenerCtx() {
        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            audioCtx = new AC();
        }
        return audioCtx;
    }

    function reproducirClick() {
        const ctx = obtenerCtx();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const t0 = ctx.currentTime;

        const osc = ctx.createOscillator();
        const ganador = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(860, t0);
        osc.frequency.exponentialRampToValueAtTime(620, t0 + 0.06);

        ganador.gain.setValueAtTime(0, t0);
        ganador.gain.linearRampToValueAtTime(0.12, t0 + 0.008);
        ganador.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);

        osc.connect(ganador);
        ganador.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.1);
    }

    function configurar() {
        document.addEventListener("click", (e) => {
            const objetivo = e.target.closest(
                "button, a, [role='button'], .ql-picker-label, .ql-picker-item"
            );
            if (objetivo) reproducirClick();
        }, true);
    }

    return {
        configurar,
        reproducirClick
    };

})();

document.addEventListener("DOMContentLoaded", Sonido.configurar);