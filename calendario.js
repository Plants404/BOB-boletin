/* ==========================================
   CALENDARIO.JS
   Configuración de Flatpickr
========================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {



        const fecha =
            document.getElementById("fecha");



        // Si no existe el campo fecha,
        // no ejecuta nada

        if (!fecha) return;





        // Verificar que Flatpickr exista


        if (typeof flatpickr === "undefined") {


            console.error(
                "Flatpickr no está cargado."
            );


            return;


        }







        flatpickr(fecha, {



            // Idioma español

            locale:"es",





            // Valor enviado al formulario

            dateFormat:"Y-m-d",





            // Campo visual

            altInput:true,

            altFormat:"d F Y",





            // Configuración

            allowInput:false,

            disableMobile:true,

            defaultDate:new Date(),

            monthSelectorType:"dropdown",

            animate:true,





            // Restricciones

            maxDate:"today",





            // Evento cambio fecha

            onChange:function(
                selectedDates,
                dateString
            ){


                console.log(
                    "Fecha seleccionada:",
                    dateString
                );


            }





        });




    }

);