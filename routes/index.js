let express = require('express');

let router = express.Router();

var morgan = require('morgan');
var appIndex = express();
appIndex.use(morgan('dev'));


var requestIp = require('request-ip');
var iplocation = require('iplocation').default; //now need default
appIndex.use(requestIp.mw({ attributeName: 'clientIPaddr' }));

const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const numeral = require("numeral");
const math = require('mathjs');

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
};


//put in a separate file
class userActionLogRecStoreType {
    constructor(_timeStr, _ip_addr, _action_done, _rollDiam, _diamXdir, _cavityDepth, _calcXval, _calcYmin, _calcYmax, _calcScaleMin, _calcScaleMax) {
        this.timeStr = _timeStr;
        this.ip_addr = _ip_addr;
        this.action_done = _action_done;
        this.rollDiam = _rollDiam;
        this.dimXdir = _diamXdir;
        this.cavityDepth = _cavityDepth,
            this.calcXval = _calcXval;
        this.calcYmin = _calcYmin;
        this.calcYmax = _calcYmax;
        this.calcScaleMin = _calcScaleMin;
        this.calcScaleMax = _calcScaleMax
    }
};

class userLogRecStoreType {
    constructor(_timeStr, _clientIP, _loginName, _password, _fullName, _action_done) {
        this.timeStr = _timeStr;
        this.clientIP = _clientIP;
        this.loginName = _loginName;
        this.password = _password;
        this.fullName = _fullName;
        this.action_done = _action_done
    }
};


router.get('/', function(req, res, next) {
    console.log('saving the IP address');
    let _action_done;
    let ip;
    let clientIP;


    if (req.session.logged_in === true) {
        //logged in so just write to user db

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            req.session.loginName,
            req.session.password,
            req.session.fullName,
            'root-logged in'
        );

        var query = "INSERT INTO user_log (time_str, ip_addr, loginName, password, fullName, action_done) VALUES (?, ?, ?, ?, ?, ? )";
        connection.query(query, [
            userLogRec.timeStr,
            userLogRec.clientIP,
            userLogRec.loginName,
            userLogRec.password,
            userLogRec.fullName,
            userLogRec.action_done
        ], function(err, response) {
            //what to do after the log has been written
            console.log('wrote to ip local');
            //res.sendStatus(200).end();  
            res.render('index', {
                base_url: process.env.BASE_URL
            });
        });
    } else {
        //not logged in so save the ip address
        _action_done = "root-not logged in";
        ip = req.clientIPaddr;
        clientIP = requestIp.getClientIp(req);
        console.log('not logged in');
        console.log(ip);
        // const ip = req.getClientIp;
        if (ip == '::1') {
            console.log('local ip');
            req.session.clientIP = 'local';
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

                //res.sendStatus(200).end();  
                res.render('index', {
                    base_url: process.env.BASE_URL
                });
            });
        } else {
            //let ip = req.clientIPaddr;
            //let clientIP = requestIp.getClientIp(req);
            req.session.clientIP = clientIP;
            console.log('before iplocation');
            iplocation(ip)
                .then(res2 => {
                    console.log('after iplocation');
                    _action_done = 'root-not logged in';
                    let ipRec = new ipRecStoreType(
                        moment().format("YYYY-MM-DD  HH:mm a"),
                        clientIP,
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
                    console.log('before insert query');
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
                        res.render('index', {
                            base_url: process.env.BASE_URL
                        });
                        //res.sendStatus(200).end();
                    });
                })
        };
    };


    //
    //	->	Display the index view with the video tag
    //
    //res.render('index', {
    //		base_url: process.env.BASE_URL
    //});

});


router.post('/login', function(req, res, next) {
    var loginName = req.body.loginName;
    loginName = loginName.toLowerCase().trim()
    var password = req.body.password;
    var loginValid = 'false';
    var outputUrl = '/';
    var actionDone = 'login attempt';

    console.log('at login post');
    req.session.logged_in = false;
    req.session.loginName = '';
    req.session.password = ''; //password used, for logging
    req.session.fullName = '';
    //var base_url =  process.env.BASE_URL + '/video/display';
    //res.end('base_url:' + base_url);

    if (loginName === 'richbu' && password === 'hello') {
        loginValid = true;
        req.session.fullName = "Rich Budek";
        outputUrl = '/video/display';
    };
    if (loginName === 'judy' && password === 'judy') {
        loginValid = true;
        req.session.fullName = "Judy Smith";
        outputUrl = '/video/display';
    };
    if (loginName === 'wco' && password === 'nc21') {
        loginValid = true;
        req.session.fullName = 'Generic nc21';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco' && password === 'demo01') {
        loginValid = true;
        req.session.fullName = 'William Perez';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco' && password === 'demo02') {
        loginValid = true;
        req.session.fullName = 'Roman and Chris';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco' && password === 'demo03') {
        loginValid = true;
        req.session.fullName = 'Megan,Rose,Juanita';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco' && password === 'demo04') {
        loginValid = true;
        req.session.fullName = 'Michele Baker';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco21' && password === 'demo01') {
        loginValid = true;
        req.session.fullName = 'Adrian Ungar';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco21' && password === 'demo10') {
        loginValid = true;
        req.session.fullName = 'Tom Weidenmiller';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco21' && password === 'demo11') {
        loginValid = true;
        req.session.fullName = 'Michael Oppen';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco21' && password === 'demo12') {
        loginValid = true;
        req.session.fullName = 'Steve Kras';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco21' && password === 'demo20') {
        loginValid = true;
        req.session.fullName = 'Greg Davidson';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco21' && password === 'demo30') {
        loginValid = true;
        req.session.fullName = 'Jean Madern';
        outputUrl = '/video/display';
    };
    if (loginName === 'wco21' && password === 'demo40') {
        loginValid = true;
        req.session.fullName = 'WP, AS, VC';
        outputUrl = '/video/display';
    };

    if (loginValid === true) {
        outputUrl = '/video/display';
        actionDone = 'login success';
    } else {
        req.session.fullName = 'bad login'
        outputUrl = '/';
        actionDone = 'login failure';
    };

    req.session.logged_in = loginValid;
    req.session.loginName = loginName;
    req.session.password = password;

    let userLogRec = new userLogRecStoreType(
        moment().format("YYYY-MM-DD  HH:mm a"),
        req.session.clientIP,
        req.session.loginName,
        req.session.password,
        req.session.fullName,
        actionDone
    );

    var query = "INSERT INTO user_log (time_str, ip_addr, loginName, password, fullName, action_done) VALUES (?, ?, ?, ?, ?, ? )";
    connection.query(query, [
        userLogRec.timeStr,
        userLogRec.clientIP,
        userLogRec.loginName,
        userLogRec.password,
        userLogRec.fullName,
        userLogRec.action_done
    ], function(err, response) {
        //what to do after the log has been written
        res.json({
            //logged_in: req.session.logged_in,
            //user_name: req.session.username,
            url: outputUrl
        });
    }); //query to write to user log
});



router.post('/ovalcalc', function(req, res, next) {
    console.log("hit the ovalcalc post route");

    let userLogRec = new userActionLogRecStoreType(
        moment().format("YYYY-MM-DD  HH:mm a"),
        //"10.10.10.190",
        req.session.clientIP,
        "hit calc-oval bttn",
        "0.0000", //diam
        "0.0000", //dimXdir
        "0.0000", //cavityDepth
        "0.0000", //calcXval
        "0.0000", //calcYmin
        "0.0000", //calcYmax
        "1.0000", //calcScaleMin
        "1.0000" //calcScaleMax
    );

    var query = "INSERT INTO user_log ( time_str, ip_addr, action_done, rollDiam, dimXdir, cavityDepth, calcXval, calcYmin, calcYmax, calcScaleMin, calcScaleMax) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )";
    connection.query(query, [
        userLogRec.timeStr,
        userLogRec.ip_addr,
        userLogRec.action_done,
        userLogRec.rollDiam,
        userLogRec.dimXdir,
        userLogRec.cavityDepth,
        userLogRec.calcXval,
        userLogRec.calcYmin,
        userLogRec.calcYmax,
        userLogRec.calcScaleMin,
        userLogRec.calcScaleMax
    ], function(err, response) {
        //wrote the action log, so can render the page
        res.render('calc_oval');
    });
});

module.exports = router;