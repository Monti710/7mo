const express = require('express');
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require('bcrypt');
app.use(express.json());

const {connection} = require('../config.db');

const getUsers = (req, res) => {
    connection.query('SELECT eCodUsuario, tNombreCompleto, tCorreoInstitucional, tTelefono FROM Usuarios', (error, results) => {
        if (error) throw error;
        
        if (results.length === 0) {
            return res.status(404).json({message: 'No users found'});
        }
        res.status(200).json(results);
    });
};


app.route('/users').get(getUsers);

module.exports = app;