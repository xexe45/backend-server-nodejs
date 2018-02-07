var express = require("express");
var app = express();

var Medico = require("../models/medico");
var mdAutenticacion = require("../middlewares/autenticacion");

//=====================================
//Obtener todos los médicos
//=====================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .populate("hospital")
        .exec((err, medicos) => {
            if (err) {
                return res
                    .status(500)
                    .json({
                        ok: false,
                        mensaje: "Error cargando Médicos",
                        errors: err
                    });
            }
            Medico.count({}, (err, conteo) => {
                res
                    .status(200)
                    .json({ ok: true, medicos: medicos, total: conteo });
            });

        });
});

//=====================================
//Obtener un médico
//=====================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate("usuario", "nombre email img")
        .populate("hospital")
        .exec((err, medicoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar médico',
                    errors: err
                })
            }

            if (!medicoDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El médico con ese ID no existe',
                    errors: { message: 'Médico no existe' }
                })
            }

            res.status(200).json({
                ok: true,
                medico: medicoDB
            })
        });

});

//=====================================
//Registrar Médico
//=====================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoDB) => {
        if (err) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "Error al crear médico",
                    errors: err
                });
        }

        res
            .status(201)
            .json({
                ok: true,
                medico: medicoDB,
            });
    });
});

//=====================================
//Actualizar Médico
//=====================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    var medico = Medico.findById(id, (err, medico) => {

        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al buscar médico",
                    errors: err
                });
        }

        if (!medico) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "El médico con el id" + id + "no existe",
                    errors: { message: "No existe un médico con ese ID" }
                });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoEditado) => {
            if (err) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Error al actualizar médico",
                        errors: err
                    });
            }

            res
                .status(200)
                .json({
                    ok: true,
                    medico: medicoEditado
                });
        });

    });
});

//==========================
//Eliminar Médico
//==========================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {

        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al borrar médico",
                    errors: err
                });
        }

        if (!medicoEliminado) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "No existe un médico con ese ID",
                    errors: {
                        message: "No existe un médico con ese ID"
                    }
                });
        }

        res
            .status(200)
            .json({
                ok: true,
                medico: medicoEliminado,
            });
    });
});

module.exports = app;