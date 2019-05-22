const express = require("express");
const Usuario = require("../models/usuario");
const { verificaToken, verificaPermisos } = require("../middlewares/autenticacion");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const app = express();

app.get("/usuario", verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let filtro = {
        estado: true
    };

    Usuario.find(filtro, 'nombre email google estado role img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count(filtro, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    registros_totales: conteo
                });
            });

        });
});

app.post("/usuario", [verificaToken, verificaPermisos], (req, res) => {
    let persona = req.body;

    let usuario = new Usuario({
        nombre: persona.nombre,
        email: persona.email,
        password: bcrypt.hashSync(persona.password, 10),
        role: persona.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put("/usuario/:id", [verificaToken, verificaPermisos], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

    Usuario.findByIdAndUpdate(
        id,
        body, { new: true, runValidators: true },
        (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                id,
                usuario: usuarioDB
            });
        }
    );
});

app.delete("/usuario/:id", [verificaToken, verificaPermisos], (req, res) => {

    let id = req.params.id;
    let estado = { estado: false };

    // BORRADO FISICO
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     };

    //     if (!usuarioBorrado) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         })
    //     }

    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     });

    // });

    // BORRADO LOGICO
    Usuario.findByIdAndUpdate(
        id,
        estado, { new: true },
        (err, usuarioBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            };

            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                })
            }

            res.json({
                ok: true,
                usuario: usuarioBorrado
            });
        }
    );
});

module.exports = app;