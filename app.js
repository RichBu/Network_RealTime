require('dotenv').config();
let path = require('path');
let logger = require('morgan');
let express = require('express');
let bodyParser = require('body-parser');
var PORT = process.env.PORT || 3000;

const nodemailer = require('nodemailer');

//let app        = express();
//turn on Morgan to show detailed routes thru server
var morgan = require('morgan');
var app = express();
app.use(morgan('dev'));

var requestIp = require('request-ip');
var iplocation = require('iplocation');
app.use(requestIp.mw({ attributeName: 'clientIPaddr' }));

const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const numeral = require("numeral");
const math = require('mathjs');

var tmrSimulStarted = 0; //tmr has started
var tmrSimulHandle = 0; //tmr handle for the simulation


class ipRecStoreType {
    constructor(_timeStr, _clientIP, _queryIP, _as, _country, _countryCode, _city, _region, _regionName, _zip, _timezone, _action_done) {
        this.timeStr = _timeStr;
        this.clientIP = _clientIP;
        this.queryIP = _queryIP;
        this.as = _as;
        this.country = _country;
        this.countryCode = _countryCode;
        this.city = _city;
        this.region = _region;
        this.regionName = _regionName;
        this.zip = _zip;
        this.timezone = _timezone;
        this.action_done = _action_done
    }
}


app.post('/save_ip/:action_done', (req, res) => {
    //routine to get the IP address and then save it to mySQL
    console.log('saving the IP address');

    const _action_done = req.params.action_done;
    const ip = req.clientIPaddr;
    // const ip = req.getClientIp;
    // RPB-Temp  override the IP location for now to get it to work
    const skipIp = true;
    if (ip == '::1' || skipIp ) {
        console.log('local ip');
        let ipRec = new ipRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            'local',
            'local',
            ' ',
            ' ',
            ' ',
            ' ',
            ' ',
            ' ',
            ' ',
            ' ',
            _action_done
        );
        var query = "INSERT INTO ip_log (time_str, ip_addr, ip_query, as_field, country, countryCode, city, region, regionName, zip, timezone, action_done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )";
        connection.query(query, [
            ipRec.timeStr,
            ipRec.clientIP,
            ipRec.queryIP,
            ipRec.as,
            ipRec.country,
            ipRec.countryCode,
            ipRec.city,
            ipRec.region,
            ipRec.regionName,
            ipRec.zip,
            ipRec.timezone,
            ipRec.action_done
        ], function(err, response) {
            //what to do after the log has been written
            console.log('wrote to ip local');
            res.sendStatus(200).end();
        });
    } else {
        const clientIp = requestIp.getClientIp(req);
        console.log(clientIp);
        iplocation(ip)
            .then(res2 => {
                let ipRec = new ipRecStoreType(
                    moment().format("YYYY-MM-DD  HH:mm a"),
                    ip,
                    res2.query,
                    res2.as,
                    res2.country,
                    res2.countryCode,
                    res2.city,
                    res2.region,
                    res2.regionName,
                    res2.zip,
                    res2.timezone,
                    _action_done
                );

                var query = "INSERT INTO ip_log (time_str, ip_addr, ip_query, as_field, country, countryCode, city, region, regionName, zip, timezone, action_done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )";
                connection.query(query, [
                    ipRec.timeStr,
                    ipRec.clientIP,
                    ipRec.queryIP,
                    ipRec.as,
                    ipRec.country,
                    ipRec.countryCode,
                    ipRec.city,
                    ipRec.region,
                    ipRec.regionName,
                    ipRec.zip,
                    ipRec.timezone,
                    ipRec.action_done
                ], function(err, response) {
                    //what to do after the log has been written
                    res.sendStatus(200).end();
                });
            })
    };

});




app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');


//    USER TO REMAIN LOGGED IN   cookies and session
//following lines allow for a user to remain logged in
// no longer need cookieParser ?
// var cookieParser = require('cookie-parser');
var session = require('express-session'); //allows user to stay logged in
const connection = require('./connection');
//allow sessions
app.use(session({ secret: 'app', cookie: { maxAge: 60000 * 1000 * 1000 }, resave: true, saveUninitialized: false }));
//app.use(cookieParser());


//
//	Check for HTTPS
//
app.use(force_https);

//
//	Expose the public folder to the world
//
app.use(express.static(path.join(__dirname, 'public')));

//
//	Remove the information about what type of framework is the site running on
//
app.disable('x-powered-by');

//
// HTTP request logger middleware for node.js
//
app.use(logger('dev'));

//
//	Parse all request as regular text, and not JSON objects
//
app.use(bodyParser.json());

//
//	Parse application/x-www-form-urlencoded
//
app.use(bodyParser.urlencoded({ extended: false }));

// pass the db connection to all other modules
/*
app.use ((req, res, next) => {
    req.connection = connection;
    next();
});
*/

//////////////////////////////////////////////////////////////////////////////

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/reports', require('./routes/reports'));
app.use('/video', require('./routes/video'));
app.use('/calcoval', require('./routes/calcoval'));

//////////////////////////////////////////////////////////////////////////////

//
//
//  If nonce of the above routes matches, we create an error to let the
//  user know that the URL accessed doesn't match anything.
//
app.use(function(req, res, next) {

    let err = new Error('Not Found');
    err.status = 404;

    next(err);

});

//
//  Display any error that occurred during the request.
//
app.use(function(err, req, res, next) {

    //
    //	1.	Set the basic information about the error, that is going to be
    //		displayed to user and developers regardless.
    //
    let obj_message = {
        message: err.message
    };

    //
    //	2.	Check if the environment is development, and if it is we
    //		will display the stack-trace
    //
    if (process.env.NODE_ENV == 'development') {
        //
        //	1.	Set the variable to show the stack-trace to the developer
        //
        obj_message.error = err;

        //
        //	-> Show the error in the console
        //
        console.error(err);
    }

    //
    //	3.	Display a default status error, or pass the one from
    //		the error message
    //
    res.status(err.status || 500);

    //
    //	->	Show the error
    //
    res.json(obj_message);

});

//   _    _ ______ _      _____  ______ _____   _____
//  | |  | |  ____| |    |  __ \|  ____|  __ \ / ____|
//  | |__| | |__  | |    | |__) | |__  | |__) | (___
//  |  __  |  __| | |    |  ___/|  __| |  _  / \___ \
//  | |  | | |____| |____| |    | |____| | \ \ ____) |
//  |_|  |_|______|______|_|    |______|_|  \_\_____/
//

//
//	Check if the connection is secure, if not, redirect to a secure one.
//
function force_https(req, res, next) {
    //
    //	1. 	Redirect only in the production environment
    //
    if (process.env.NODE_ENV == 'production') {
        //
        //	1. 	Check what protocol are we using
        //
        if (req.headers['x-forwarded-proto'] !== 'https') {
            //
            //	-> 	Redirect the user to the same URL that he requested, but
            //		with HTTPS instead of HTTP
            //
            return res.redirect('https://' + req.get('host') + req.url);
        }
    }

    //
    //	2. 	If the protocol is already HTTPS the, we just keep going.
    //
    next();
}

//listen for the port
app.listen(PORT, ()=> {
    console.log(`Server listening on port ${PORT}`);
});

module.exports = app;