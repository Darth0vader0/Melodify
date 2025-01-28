const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "music_app"
});
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

module.exports = db;