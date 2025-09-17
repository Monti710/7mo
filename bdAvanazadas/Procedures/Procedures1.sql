USE SistemaIncidencias;
DELIMITER $$


CREATE PROCEDURE IF NOT EXISTS getAllUsers()
BEGIN
    SELECT 
        eCodUsuario,
        tNombreCompleto,
        eMatricula,
        bGenero,
        tCorreoInstitucional,
        tTelefono,
        tDireccion
    FROM Usuarios;
END $$

DELIMITER ;

CALL getAllUsers();

DELIMITER $$

-- Procedimiento para obtener un usuario por su ID
CREATE PROCEDURE IF NOT EXISTS GetUserById(IN pUserId INT)
BEGIN
    SELECT 
        eCodUsuario,
        tNombreCompleto,
        eMatricula,
        bGenero,
        tCorreoInstitucional,
        tTelefono,
        tDireccion
    FROM Usuarios
    WHERE eCodUsuario = pUserId;
END $$

DELIMITER ;

Call GetUserById(5)

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS PostUser(
    IN tContraseña VARCHAR(255),
    IN tNombreCompleto VARCHAR(255),
    IN eMatricula INT,
    IN bGenero TINYINT,
    IN tCorreoInstitucional VARCHAR(255),
    IN tTelefono VARCHAR(255),
    IN tDireccion VARCHAR(255)
)
BEGIN
    INSERT INTO Usuarios (
        tContraseña,
        tNombreCompleto,
        eMatricula,
        bGenero,
        tCorreoInstitucional,
        tTelefono,
        tDireccion
    ) VALUES (
        tContraseña,
        tNombreCompleto,
        eMatricula,
        bGenero,
        tCorreoInstitucional,
        tTelefono,
        tDireccion
    );
    
    SELECT LAST_INSERT_ID();  -- Esto devuelve el id del nuevo usuario
END $$

DELIMITER ;


CALL PostUser(
    'miContraseñaSegura123',
    'Juan Pérez',                 
    '20202020',                    
    1,                            
    'juan.perez@universidad.edu', 
    '5551234567',                 
    'Calle Ficticia 123, Ciudad, País'
);