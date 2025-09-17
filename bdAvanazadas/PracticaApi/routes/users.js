const express = require('express');
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require('bcrypt');
app.use(express.json());

const { connection } = require('../config.db');

// Obtener todos los usuarios
const getUsers = (req, res) => {
    connection.query('SELECT eCodUsuario, tNombreCompleto, bGenero, tCorreoInstitucional, tTelefono FROM Usuarios', (error, results) => {
        if (error) throw error;
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios' });
        }
        res.status(200).json(results);
    });
};

app.route('/users').get(getUsers);

// Obtener un usuario por ID
const getUserById = (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT eCodUsuario, tNombreCompleto, eMatricula, tCorreoInstitucional,
            tTelefono, tDireccion, bGenero
        FROM Usuarios WHERE eCodUsuario = ?
    `;
    
    connection.query(query, [id], (error, results) => {
        if (error) throw error;
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(results[0]);
    });
};

app.route("/users/:id").get(getUserById);

// Crear un nuevo usuario
const postUser = async (req, res) => {
    try {
        const { tNombreCompleto, eMatricula, bGenero, tCorreoInstitucional, tTelefono, tDireccion, tPassword } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(tPassword, saltRounds);
        
        connection.query(
            `INSERT INTO Usuarios (tNombreCompleto, eMatricula, tContraseña, bGenero, tCorreoInstitucional, tTelefono, tDireccion)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [tNombreCompleto, eMatricula, hashedPassword, bGenero, tCorreoInstitucional, tTelefono, tDireccion],
            (error, results) => {
                if (error) throw error;
                res.status(201).json({ message: 'Usuario creado exitosamente', userId: results.insertId });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

app.route('/users').post(postUser);

// Actualizar un usuario (PUT)
const putUser = async (req, res) => {
    try {
        const { id } = req.params;
        const fields = [
            "tNombreCompleto",
            "eMatricula",
            "bGenero",
            "tCorreoInstitucional",
            "tTelefono",
            "tDireccion",
        ];

        let updateFields = [];
        let queryParams = [];
        
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                queryParams.push(req.body[field]);
            }
        });

        if (req.body.tPassword) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.tPassword, saltRounds);
            updateFields.push("tContraseña = ?");
            queryParams.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar' });
        }
        queryParams.push(id);

        const query = `UPDATE Usuarios SET ${updateFields.join(", ")} WHERE eCodUsuario = ?`;
        connection.query(query, queryParams, (error, results) => {
            if (error) throw error;
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.status(200).json({ message: 'Usuario actualizado exitosamente' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
};

app.route('/users/:id').put(putUser);

// Cambiar estado de usuario (PATCH)
const patchUser = (req, res) => {
    const { id } = req.params;
    const { bActivo } = req.body;

    // Validar que se haya enviado el campo
    if (bActivo === undefined) {
        return res.status(400).json({ message: 'Solicitud inválida' });
    }

    // Validar que solo acepte 0 o 1
    if (bActivo !== 0 && bActivo !== 1) {
        return res.status(400).json({ message: 'Solicitud inválida' });
    }

    const query = 'UPDATE Usuarios SET bEstadoUsuario = ? WHERE eCodUsuario = ?';
    connection.query(query, [bActivo, id], (error, results) => {
        if (error) {
            console.error(error); // log interno para ti
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }
        res.status(200).json({ message: 'Operación realizada con éxito' });
    });            return res.status(404).json({ message: 'Usuario no encontrado' });

};

app.route('/users/:id').patch(patchUser);

const getAllUsers = (req, res) => {
    connection.query("CALL GetAllUsers()", (error, results) => {
        if (error) throw error;
        res.status(200).json(results[0]);
    });
}
app.route('/allusers').get(getAllUsers);

const getOnlyUser = (req, res) => {
    const { id } = req.params;
    connection.query("CALL GetUserById(?)", [id], (error, results) => {
        if (error) throw error;
        if (results[0].length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(results[0][0]);
    });
}
app.route('/allUsers/:id').get(getOnlyUser);

const postNewUser = async (req, res) => {
    try {
        const { tNombreCompleto, eMatricula, bGenero, tCorreoInstitucional, tTelefono, tDireccion, tPassword } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(tPassword, saltRounds);
        
        connection.query(
            `CALL PostUser(?, ?, ?, ?, ?, ?, ?)`,
            [hashedPassword, tNombreCompleto, eMatricula, bGenero, tCorreoInstitucional, tTelefono, tDireccion],
            (error, results) => {
                if (error) throw error;
                res.status(201).json({ message: 'Usuario creado exitosamente', userId: results[0].insertId });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
};
app.route('/newUsers').post(postNewUser);

// Rutas para resolver problemas de la actividad
const getIssuesCountByType = (req, res) => {
    const { typeId } = req.params;
    connection.query('CALL countIssuesByType(?)', [typeId], (error, results) => {
        if (error) throw error;
        res.status(200).json(results[0][0]);
    });
};
app.route('/issues/count/by-type/:typeId').get(getIssuesCountByType);

const setIssueState = (req, res) => {
    const { id } = req.params;
    const { newState } = req.body;
    connection.query('CALL changeIssueState(?, ?)', [id, newState], (error) => {
        if (error) throw error;
        res.status(200).json({ message: 'Estado actualizado correctamente' });
    });
};
app.route('/issues/state/:id').patch(setIssueState);

const getRecentIssues = (req, res) => {
    const { from } = req.query;
    connection.query('CALL getRecentIssues(?)', [from], (error, results) => {
        if (error) throw error;
        res.status(200).json(results[0]);
    });
};
app.route('/issues/recent').get(getRecentIssues);

const setIssueDescription = (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    connection.query('CALL updateIssueDescription(?, ?)', [id, description], (error) => {
        if (error) throw error;
        res.status(200).json({ message: 'Descripción actualizada correctamente' });
    });
};
app.route('/issues/description/:id').patch(setIssueDescription);

const getIssuesCountWithoutDescription = (req, res) => {
    connection.query('CALL countIssuesWithoutDescription()', (error, results) => {
        if (error) throw error;
        res.status(200).json(results[0][0]);
    });
};
app.route('/issues/count/without-description').get(getIssuesCountWithoutDescription);

const getIssueWithLongestDescription = (req, res) => {
    connection.query('CALL getIssueWithLongestDescription()', (error, results) => {
        if (error) throw error;
        if (results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron incidencias' });
        }
        res.status(200).json(results[0][0]);
    });
};
app.route('/issues/longest-description').get(getIssueWithLongestDescription);

const deleteInactiveIssues = (req, res) => {
    const { userId } = req.body;
    connection.query('CALL deleteInactiveIssues(?)', [userId], (error) => {
        if (error) throw error;
        res.status(200).json({ message: 'Incidencias inactivas archivadas y eliminadas' });
    });
};
app.route('/issues/inactive').delete(deleteInactiveIssues);

const markOldIssuesAsInactive = (req, res) => {
    const { days } = req.body;
    connection.query('CALL markOldIssuesAsInactive(?)', [days], (error, results) => {
        if (error) throw error;
        res.status(200).json(results[0][0]);
    });
};
app.route('/issues/mark-old-inactive').patch(markOldIssuesAsInactive);

const listAllIssuesByDate = (req, res) => {
    connection.query('CALL listAllIssuesByDate()', (error, results) => {
        if (error) throw error;
        res.status(200).json(results[0]);
    });
};
app.route('/issues').get(listAllIssuesByDate);

const searchIssuesByText = (req, res) => {
    const { q } = req.query;
    connection.query('CALL searchIssuesByText(?)', [q], (error, results) => {
        if (error) throw error;
        res.status(200).json(results[0]);
    });
};
app.route('/issues/search').get(searchIssuesByText);

module.exports = app;
