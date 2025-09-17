USE SistemaIncidencias;

-- PROBLEMA: Contar incidencias por tipo
DROP PROCEDURE IF EXISTS countIssuesByType;

DELIMITER $$
CREATE PROCEDURE countIssuesByType(
    IN incidentType INT
)
BEGIN
    SELECT COUNT(*) AS total_incidencias
    FROM Incidencias
    WHERE fkeTipoIncidencias = incidentType;
END $$
DELIMITER ;

CALL countIssuesByType(2);


-- PROBLEMA: Cambiar estado de una incidencia
DROP PROCEDURE IF EXISTS changeIssueState;

DELIMITER $$
CREATE PROCEDURE changeIssueState(
    IN incidentId INT, 
    IN newState INT
)
BEGIN
    UPDATE Incidencias
    SET bEstadoIncidencia = newState
    WHERE eCodIncidencia = incidentId;
END $$
DELIMITER ;

CALL changeIssueState(1, 0);


-- PROBLEMA: Obtener incidencias recientes
DROP PROCEDURE IF EXISTS getRecentIssues;

DELIMITER $$
CREATE PROCEDURE getRecentIssues(
    IN fromDate DATETIME
)
BEGIN
    SELECT *
    FROM Incidencias
    WHERE fhIncidencia > fromDate;
END $$
DELIMITER ;

CALL getRecentIssues('2025-09-01 00:00:00');


-- PROBLEMA: Actualizar contenido de una incidencia
DROP PROCEDURE IF EXISTS updateIssueDescription;

DELIMITER $$
CREATE PROCEDURE updateIssueDescription(
    IN incidentId INT,
    IN newDescription VARCHAR(255)
)
BEGIN
    UPDATE Incidencias
    SET Descripcion = newDescription
    WHERE eCodIncidencia = incidentId;
END $$
DELIMITER ;

CALL updateIssueDescription(2, 'pepe');


-- PROBLEMA: Contar incidencias sin contenido
DROP PROCEDURE IF EXISTS countIssuesWithoutDescription;

DELIMITER $$
CREATE PROCEDURE countIssuesWithoutDescription()
BEGIN
    SELECT COUNT(*) AS totalIncidencias
    FROM Incidencias
    WHERE Descripcion IS NULL OR TRIM(Descripcion) = '';
END $$
DELIMITER ;

CALL countIssuesWithoutDescription();


-- PROBLEMA: Incidencia con contenido más largo
DROP PROCEDURE IF EXISTS getIssueWithLongestDescription;

DELIMITER $$
CREATE PROCEDURE getIssueWithLongestDescription()
BEGIN
    SELECT *
    FROM Incidencias
    ORDER BY CHAR_LENGTH(Descripcion) DESC, eCodIncidencia ASC
    LIMIT 1;
END $$
DELIMITER ;

CALL getIssueWithLongestDescription();


-- PROBLEMA: Eliminar incidencias inactivas
DROP PROCEDURE IF EXISTS deleteInactiveIssues;

DELIMITER $$
CREATE PROCEDURE deleteInactiveIssues(IN userId INT)
BEGIN
    START TRANSACTION;
    SET FOREIGN_KEY_CHECKS = 0;

    INSERT INTO Incidencias_Archive (
        eCodIncidencia, 
        fhIncidencia, 
        Descripcion, 
        EstadoIncidencia, 
        fkeCarrera, 
        fkeTipoIncidencias, 
        fkeAula, 
        fkeGravedad, 
        fkeCodUsuarioRegistrar, 
        fkeQuienReporta, 
        fkeQuienAplicaSancion, 
        fhCrearIncidencia, 
        fhActualizarIncidencia, 
        bEstadoIncidencia, 
        deleted_at, 
        deleted_by
    )
    SELECT 
        eCodIncidencia, 
        fhIncidencia, 
        Descripcion, 
        EstadoIncidencia, 
        fkeCarrera, 
        fkeTipoIncidencias, 
        fkeAula, 
        fkeGravedad, 
        fkeCodUsuarioRegistrar, 
        fkeQuienReporta, 
        fkeQuienAplicaSancion, 
        fhCrearIncidencia, 
        fhActualizarIncidencia, 
        bEstadoIncidencia, 
        NOW(), 
        userId    
    FROM Incidencias
    WHERE bEstadoIncidencia = 0;

    DELETE FROM Incidencias WHERE bEstadoIncidencia = 0;

    SET FOREIGN_KEY_CHECKS = 1;
    COMMIT;
END $$
DELIMITER ;

CALL deleteInactiveIssues(3);


-- PROBLEMA: Marcar incidencias antiguas como inactivas
DROP PROCEDURE IF EXISTS markOldIssuesAsInactive;

DELIMITER $$
CREATE PROCEDURE markOldIssuesAsInactive(
    IN daysWithoutReview INT
)
BEGIN
    DECLARE v_cutoff DATETIME;
    SET v_cutoff = NOW() - INTERVAL daysWithoutReview DAY;

    START TRANSACTION;

    UPDATE Incidencias
    SET 
        bEstadoIncidencia = 0,
        fhActualizarIncidencia = NOW()
    WHERE 
        bEstadoIncidencia = 1
        AND (
            (fhActualizarIncidencia IS NULL AND fhIncidencia < v_cutoff)
            OR (fhActualizarIncidencia < v_cutoff)
        );

    SELECT ROW_COUNT() AS issues_marked_inactive, v_cutoff AS cutoff_date;

    COMMIT;
END $$
DELIMITER ;

CALL markOldIssuesAsInactive(800);


-- PROBLEMA: Listar todas las incidencias
DROP PROCEDURE IF EXISTS listAllIssuesByDate;

DELIMITER $$
CREATE PROCEDURE listAllIssuesByDate()
BEGIN
    SELECT i.* 
    FROM SistemaIncidencias.Incidencias AS i
    ORDER BY COALESCE(i.fhIncidencia, i.fhCrearIncidencia) DESC,
             i.eCodIncidencia DESC;
END $$
DELIMITER ;

CALL listAllIssuesByDate();


-- PROBLEMA: Buscar incidencias por texto
DROP PROCEDURE IF EXISTS searchIssuesByText;

DELIMITER $$
CREATE PROCEDURE searchIssuesByText(IN searchText VARCHAR(100))
BEGIN
    SELECT *
    FROM Incidencias
    WHERE Descripcion      LIKE CONCAT('%', searchText, '%')
       OR EstadoIncidencia LIKE CONCAT('%', searchText, '%')
    ORDER BY fhIncidencia DESC;
END $$
DELIMITER ;

CALL searchIssuesByText('Accidentes');
