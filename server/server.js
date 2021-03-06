require('./config/config');
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Configuración global de rutas
app.use(require('./routes/index'));

// Conexión DB
mongoose.connect(process.env.URL_DB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {

    if (err) throw err;

    console.log('Base de datos online...');

});

// ===================

app.listen(process.env.PORT, () => console.log(`Escuchando puerto ${process.env.PORT}`));