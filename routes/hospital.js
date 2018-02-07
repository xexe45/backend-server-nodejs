var express = require("express");
var app = express();

var Hospital = require("../models/hospital");

var mdAutenticacion = require("../middlewares/autenticacion");

//=========================
//Obtener Hospitales
//=========================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .exec((err, hospitales) => {
            if (err) {
                return res
                    .status(500)
                    .json({
                        ok: false,
                        mensaje: "Error cargando Hospitales",
                        errors: err
                    });
            }

            Hospital.count({}, (err, conteo) => {
                res
                    .status(200)
                    .json({ ok: true, hospitales: hospitales, total: conteo });
            });


        });
});

//=========================
//Obtener Hospital
//=========================
app.get("/:id", (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospitalDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar el hospital',
                    errors: err
                })
            }

            if (!hospitalDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con ese id no existe',
                    errors: { message: 'Hospital con ese id no existe' }
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalDB
            })
        })
});

//=========================
//Registrar Hospitales
//=========================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalDB) => {
        if (err) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "Error al crear hospital",
                    errors: error
                });
        }

        res.status(201).json({ ok: true, hospital: hospitalDB });

    });


});

//=========================
//Actualizar Hospitales
//=========================

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al buscar hospital",
                    errors: err
                });
        }

        if (!hospital) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "El hospital con el id" + id + "no existe",
                    errors: { message: "No existe un hospital con ese ID" }
                });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Error al actualizar hospital",
                        errors: err
                    });
            }

            res
                .status(200)
                .json({
                    ok: true,
                    hospital: hospitalGuardado
                });

        });


    });
});

//=========================
//Eliminar Hospitales
//=========================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {

        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al borrar hospital",
                    errors: err
                });
        }

        if (!hospitalEliminado) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "No existe un hospital con ese ID",
                    errors: {
                        message: "No existe un hospital con ese ID"
                    }
                });
        }

        res.status(200).json({ ok: true, hospital: hospitalEliminado });

    });
});

module.exports = app;