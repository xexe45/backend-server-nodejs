var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

//=================================
// Verificar Token
//=================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token incorrecto",
                errors: err
            });
        }
        //Información del usuario que realizó la petición.
        req.usuario = decoded.usuario;
        next();
    });
}

//=================================
// Verificar Role
//=================================
exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: "Token incorrecto",
            errors: { message: 'No es Administrador' }
        });
    }
}


//=================================
// Verificar ADMIN O MISMO USUARIO
//=================================
exports.verificaADMIN_ROLE_MISMO = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: "Token incorrecto - No es administrador ni es el mismo usuario",
            errors: { message: 'No es Administrador' }
        });
    }
}