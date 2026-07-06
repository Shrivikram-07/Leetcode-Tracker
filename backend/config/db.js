const mysql = require("mysql2");

console.log("DB_HOST: - db.js:3", process.env.DB_HOST);
console.log("DB_PORT: - db.js:4", process.env.DB_PORT);
console.log("DB_USER: - db.js:5", process.env.DB_USER);
console.log("DB_NAME: - db.js:6", process.env.DB_NAME);
console.log("DB_SSL: - db.js:7", process.env.DB_SSL);

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

connection.getConnection((err, conn) => {
    if (err) {
        console.error("Database connection failed: - db.js:25");
        console.error(err);
        return;
    }

    console.log("MySQL Pool Connected - db.js:30");

    conn.release();
});

module.exports = connection;