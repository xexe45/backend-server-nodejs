var express = require("express");
var app = express();
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
var Usuario = require("../models/usuario");

var SEED = require('../config/config').SEED;

const GoogleAuth = require("google-auth-library");
//var auth = new GoogleAuth();
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

//======================================================================================================================
//Autenticación Google
//======================================================================================================================

app.post('/google/', (req, res) => {

    var token = req.body.token || 'xxx';

    var client = new GoogleAuth.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, "");

    client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID },
        function(e, login) {
            if (e) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Token no Válido',
                    errors: e
                });
            }

            var payload = login.getPayload();
            var userid = payload["sub"];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];
            Usuario.findOne({ emaio: payload.email }, (err, usuarioDB) => {

                if (err) {
                    return res
                        .status(500)
                        .json({
                            ok: false,
                            mensaje: "Error al buscar usuario - login",
                            errors: err
                        });
                }

                if (usuarioDB) {
                    if (!usuarioDB.google) {
                        return res
                            .status(400)
                            .json({
                                ok: false,
                                mensaje: "Debe de usar su autenticación normal",
                            });
                    } else {
                        //Crear un token
                        usuarioDB.password = ":)";
                        var token = jwt.sign({ usuario: usuarioDB },
                            SEED, { expiresIn: 14400 }
                        );

                        res
                            .status(200)
                            .json({
                                ok: true,
                                usuario: usuarioDB,
                                token: token,
                                id: usuarioDB._id
                            });
                    }
                } else {
                    //Si el usuario no existe por correo
                    var usuario = new Usuario({
                        nombre: payload.name,
                        email: payload.email,
                        password: ':)',
                        img: payload.picture,
                        google: true

                    });

                    usuario.save((err, usuario) => {
                        if (err) {
                            return res
                                .status(
                                    500
                                )
                                .json({
                                    ok: false,
                                    mensaje: "Error al registrar usuario",
                                    errors: err
                                });
                        }

                        //Crear un token
                        var token = jwt.sign({
                                usuario: usuario
                            },
                            SEED, {
                                expiresIn: 14400
                            }
                        );

                        res
                            .status(200)
                            .json({
                                ok: true,
                                usuario: usuario,
                                token: token,
                                id: usuario._id
                            });
                    });

                }

            });


        }
    );


});
//======================================================================================================================
//Autenticación Normal
//======================================================================================================================

app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al buscar usuarios",
                    errors: err
                });
        }

        if (!usuarioDB) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "El usuario con esas credenciales no existe-email",
                    errors: { message: "No existe un usuario con esas credenciales" }
                });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "El usuario con esas credenciales no existe-password",
                    errors: {
                        message: "No existe un usuario con esas credenciales"
                    }
                });
        }

        //Crear un token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res
            .status(200)
            .json({
                ok: true,
                usuario: usuarioDB,
                token: token,
                id: usuarioDB._id
            });
    });

});

module.exports = app;