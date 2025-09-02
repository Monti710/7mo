const dotenv = require("dotenv")
dotenv.config();

const mysql = require('mysql');
let connection;

try {
    connection = mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DBNAME
    });
    connection.connect();
    console.log("DB connected");
} catch (error) {
    console.log("DB connection error");
}

module.exports = {connection};