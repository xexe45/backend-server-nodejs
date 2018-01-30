var express = require("express");
var app = express();
var fileUpload = require("express-fileupload");
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require("../models/hospital");
var fs = require('fs'); //File System

// default options
app.use(fileUpload());
//Usar librería express-fileupload



//Rutas
app.put("/:tipo/:id", (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Validar tipos de coleccion
    var tipoValidos = ['hospitales', 'medicos', 'usuarios'];

    if (!tipoValidos.includes(tipo)) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: "Tipo de colección no es válida",
                errors: { message: "Tipo de colección no es válida" }
            });
    }

    //Asegurarnos que viene un archivo
    if (!req.files) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: "No seleccionó ningún archivo",
                errors: { message: "Debe seleccionr una imagen" }
            });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //Validar que extensión sea valida
    if (!extensionesValidas.includes(extensionArchivo)) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: "Extensión no válida",
                errors: { message: "Las extension válidas son " + extensionesValidas.join(', ') }
            });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al mover archivo",
                    errors: {
                        message: "Error al mover archivo"
                    }
                });
        }

        //Actualizar un registro en BD
        subirPorTipo(tipo, id, nombreArchivo, res);

    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo == 'usuarios') {
        Usuario.findById(id, (err, usuarioBD) => {

            if (!usuarioBD) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Usuario no existe",
                        errors: {
                            message: "Usuario no existe"
                        }
                    });
            }

            var pathViejo = './uploads/usuarios/' + usuarioBD._img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuarioBD.img = nombreArchivo;
            usuarioBD.save((err, usuariActualizado) => {

                usuariActualizado.password = ':)';

                //Validar error
                return res
                    .status(200)
                    .json({
                        ok: true,
                        mensaje: "Imagen de usuario actualizada",
                        usuario: usuariActualizado
                    });

            });

        });
    }

    if (tipo == "medicos") {
        Medico.findById(id, (err, medicoBD) => {

            if (!medicoBD) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Médico no existe",
                        errors: {
                            message: "Médico no existe"
                        }
                    });
            }

            var pathViejo = "./uploads/medicos/" + medicoBD._img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medicoBD.img = nombreArchivo;
            medicoBD.save((err, medicoActualizado) => {
                //Validar error
                return res
                    .status(200)
                    .json({
                        ok: true,
                        mensaje: "Imagen de medico actualizada",
                        medico: medicoActualizado
                    });
            });
        });
    }

    if (tipo == "hospitales") {
        Hospital.findById(id, (err, hospitalBD) => {

            if (!hospitalBD) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Hospital no existe",
                        errors: {
                            message: "Hospital no existe"
                        }
                    });
            }

            var pathViejo = "./uploads/hospitales/" + hospitalBD._img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospitalBD.img = nombreArchivo;
            hospitalBD.save((err, hospitalActualizado) => {
                //Validar error
                return res
                    .status(200)
                    .json({
                        ok: true,
                        mensaje: "Imagen de hospital actualizada",
                        hospital: hospitalActualizado
                    });
            });
        });
    }
}

module.exports = app;