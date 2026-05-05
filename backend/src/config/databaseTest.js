const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST_TEST || 'localhost',
    port: Number(process.env.DB_PORT_TEST) || 3306,
    user: process.env.DB_USER_TEST || 'root',
    password: process.env.DB_PASSWORD_TEST || '',
    database: process.env.DB_NAME_TEST || 'alexandriaTest',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool;