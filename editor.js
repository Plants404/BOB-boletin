/* ==========================================
   EDITOR.JS
   Configuración de Quill
========================================== */


let quill = null;



document.addEventListener(
    "DOMContentLoaded",
    () => {



        const editor =
            document.getElementById("editor");



        // Si no existe el editor,
        // no ejecutar

        if (!editor) return;






        // Verificar librería Quill


        if(typeof Quill === "undefined"){



            console.error(
                "Quill no está cargado."
            );



            return;



        }







        // Evitar duplicar instancia


        if(quill !== null){


            return;


        }








        quill = new Quill(
            "#editor",
            {



                theme:"snow",



                placeholder:
                "Escriba aquí la novedad oficial...",





                modules:{



                    toolbar:[



                        [
                            {
                                header:[
                                    1,
                                    2,
                                    3,
                                    false
                                ]
                            }
                        ],




                        [
                            "bold",
                            "italic",
                            "underline",
                            "strike"
                        ],





                        [
                            {
                                color:[]
                            },

                            {
                                background:[]
                            }
                        ],





                        [
                            {
                                list:"ordered"
                            },

                            {
                                list:"bullet"
                            }
                        ],





                        [
                            {
                                align:[]
                            }
                        ],





                        [
                            "blockquote",
                            "code-block"
                        ],





                        [
                            "link"
                        ],





                        [
                            "clean"
                        ]



                    ]


                }



            }

        );







        console.log(
            "Editor Quill iniciado correctamente."
        );



    }

);