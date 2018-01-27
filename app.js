// Punto de entrada para nuestra aplicación -> node app / npm start

// Requires : Importación de librerías
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexión a base de datos
mongoose.connection.openUri("mongodb://localhost:27017/hospitalDB", (err, resp) => {
    if (err) throw err;
    console.log("Base de datos : \x1b[32m%s\x1b[0m", "online");
});

//Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar Peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})