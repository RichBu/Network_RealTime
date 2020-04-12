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



router.get('/monitor_read', function(req, res, next) {
    console.log('monitor read');
    let _action_done;
    let ip;
    let clientIP;
    let userLoggedIn = true;

    let dataOutput = [];

    //normally would check if logged in, but now just do it all the time
    //userLoggedIn = true;
    let skipLogin = true;

    if (req.session.logged_in == true) {
        userLoggedIn = true;
    } else {
        req.session.loginName = " ";
        req.session.password = " ";
        req.session.fullName = " ";
    };
    if ((userLoggedIn == true) || (skipLogin == true)) {
        //logged in so just write to user db

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            req.session.loginName,
            req.session.password,
            req.session.fullName,
            'monitor main menu'
        );

        let query = "INSERT INTO user_log (time_str, ip_addr, loginName, password, fullName, action_done) VALUES (?, ?, ?, ?, ?, ? )";
        connection.query(query, [
            userLogRec.timeStr,
            userLogRec.clientIP,
            userLogRec.loginName,
            userLogRec.password,
            userLogRec.fullName,
            userLogRec.action_done
        ], function(err, response) {
            //what to do after the log has been written
            console.log('wrote to ip log-logged in');

            //read all the machine data
            function outputObj(_mach_num, _mach_location, _image_to_use) {
                this.mach_num = _mach_num,
                    this.mach_location = _mach_location,
                    this.image_to_use = _image_to_use
            };

            var query2 = "SELECT * FROM machine_data_stat";
            connection.query(query2, [], function(err, response) {
                for (var i = 0; i < response.length; i++) {
                    //loop thru all of the responses
                    dataOutput.push(new outputObj(
                        response[i].mach_num,
                        response[i].mach_location,
                        response[i].image_to_use
                    ));
                    console.log("mach = " + response[i].mach_num);
                    console.log("image = " + response[i].image_to_use);
                };
                //res.sendStatus(200).end();  
                res.render('monitor_read', { machStatObj: dataOutput });
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
                res.render('monitor_read', {
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
}); //monitor_read path



module.exports = router;