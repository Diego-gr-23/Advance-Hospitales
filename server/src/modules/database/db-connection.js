require('dotenv').config();

const mysql = require('mysql2');

// global function to connect to DB
var central_db_connection = null;
setupConnection();

async function setupConnection() {
    central_db_connection = await mysql.createConnection({
        port: process.env.DB_PORT,
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    await central_db_connection.connect((err) => {
        console.log(!err ? "Successfully connected to DB" : "Unable to connect to DB: " + err);
        return;
    });
}

async function db_connection() {
    if (central_db_connection === null) {
        await setupConnection();
    }
    return central_db_connection;
}


module.exports = db_connection;