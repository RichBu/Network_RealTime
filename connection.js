// connection to mySql

var app = require('./app.js');
var mysql = require('mysql2');



// hard wired to database in NC21
connection = mysql.createConnection({
    port:process.env.MYSQL_PORT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});




// Make connection.
connection.connect(function(err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
});



// Export connection for our ORM to use.
module.exports = connection;