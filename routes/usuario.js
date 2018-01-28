var express = require("express");
var app = express();
var bcrypt = require("bcryptjs");
var Usuario = require('../models/usuario');
var jwt = require("jsonwebtoken");

var mdAutenticacion = require('../middlewares/autenticacion');
//var SEED = require("../config/config").SEED;
//Rutas

//=============================
// Obtener todos los usuarios.
//=============================
app.get("/", (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (error, usuarios) => {

                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando usuarios",
                        errors: error
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            })

});


//=================================
// Actualizar Usuario.
//=================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al buscar usuario",
                    errors: err
                });
        }

        if (!usuario) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "El usuario con el id" + id + "no existe",
                    errors: { message: 'No existe un usuario con ese ID' }
                });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Error al actualizar usuario",
                        errors: err
                    });
            }

            usuarioGuardado.password = ':)';

            res
                .status(200)
                .json({ ok: true, usuario: usuarioGuardado });

        });

    })

});

//=================================
// Crear nuevo Usuario. npm install mongoose-unique-validator --save
//Bcrypt js para las contraseñas
//=================================

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    //Librería Body Parser.
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {
        if (error) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "Error al crear usuario",
                    errors: error
                });
        }
        res.status(201).json({ ok: true, usuarios: usuarioGuardado, usuarioToken: req.usuario });
    });
});



//=================================
// Eliminar Usuario
//=================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al borrar usuario",
                    errors: err
                });
        }

        if (!usuarioBorrado) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "No existe un usuario con ese ID",
                    errors: {
                        message: "No existe un usuario con ese ID"
                    }
                });
        }

        res.status(200).json({ ok: true, usuario: usuarioBorrado });
    });

});

module.exports = app;