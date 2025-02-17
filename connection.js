// connection to mySql

var app = require('./app.js');
var mysql = require('mysql2');

/*
connection = mysql.createConnection({
    port:3306,
    //host: '0.0.0.0',  //works on local
    host: 'portfolio-mysql-db',
    user: 'root',
    password: 'RootPass',
    database: 'PORTFOLIO_DB'
    //database: 'z2znazc687xl2iem'
});

*/
//var connection;

if (process.env.JAWSDB_URL) {
    connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {
    connection = mysql.createConnection({
        connectionLimit: 20,
        port: 3306,
        host: '146.71.78.196',
        user: 'root',
        password: 'RootPass',
        database: 'PORTFOLIO_DB'
        //database: 'network_rt'
    });
};


// hard wired to database in NC21
/*
connection = mysql.createConnection({
    port:3306,
    host: 'arfo8ynm6olw6vpn.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'm6fnjqsu98tbimjy',
    password: 'it7svbrrc9w1aiax',
    database: 't8dfbvzsbl4mlj42'
    //database: 'z2znazc687xl2iem'
});
*/

connection = mysql.createConnection({
    port:3306,
    //host: '0.0.0.0',  //works on local
    host: '146.71.78.196',
    user: 'root',
    password: 'RootPass',
    database: 'NETWORK_RT'
});




// Make connection.
connection.connect(function(err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
});
//To run Database on JAWSDB




// Export connection for our ORM to use.
module.exports = connection;