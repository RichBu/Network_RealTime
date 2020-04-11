//all of the routes for doing monitoring

let fs = require('fs')
let path = require('path');
let express = require('express');
let S = require('string');

let router = express.Router();

var connection = require('../connection');

let fileLoc = './public/images/';

const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const numeral = require("numeral");
const math = require('mathjs');


//put in a separate file
class userLogRecStoreType {
    constructor(_timeStr, _clientIP, _action_done, _action_string) {
        this.timeStr = _timeStr;
        this.clientIP = _clientIP;
        this.action_done = _action_done;
        this.action_string = _action_string;
    }
};


class eventByTimeRecStoreType {
    constructor(_start_time_str, _end_time_str, _event_duration, _M1, _M2, _M3, _M4, _M5, _M6, _M7, _M8, _M9) {
        this.start_time_str = _start_time_str;
        this.end_time_str = _end_time_str;
        this.event_duration = _event_duration;
        this.M1 = _M1;
        this.M2 = _M2;
        this.M3 = _M3;
        this.M4 = _M4;
        this.M5 = _M5;
        this.M6 = _M6;
        this.M7 = _M7;
        this.M8 = _M8;
        this.M9 = _M9;
    }
};



router.get('/', function(req, res, next) {
    //display reports type
    console.log('/reports route');

    var logFileListOutput = []; //array for use in listing

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'log files list';
        var actionString = 'hit the log files with .get route';

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            actionDone,
            actionString
        );


        var query = "INSERT INTO user_log (time_str, ip_addr, action_done, action_string) VALUES (?, ?, ?, ? )";
        connection.query(query, [
            userLogRec.timeStr,
            userLogRec.clientIP,
            userLogRec.action_done,
            userLogRec.action_string
        ], function(err, response) {
            //what to do after the log has been written		   
            res.render('reports01', { outputObj: logFileListOutput });
        }); //query to write to user log	
    } else {
        var actionDone = 'report menu';
        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            'timed out',
            ' ',
            ' ',
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
            res.render('index');
        });
    };
});




router.post('/show', function(req, res, next) {
    //show all of the machines 
    console.log('/reports/evt_list route');

    var _startDate = S("").toString();
    var tempStrIn = S(req.body.startDate).trim() + "*";
    if (tempStrIn == "*") {
        _startDate = "*";
    } else {
        _startDate = req.body.startDate + "/01/01";
    };
    var _startTime = S("").toString();
    tempStrIn = S(req.body.startTime).trim() + "*";
    if (tempStrIn == "*") {
        if (_startDate == "*") {
            //start date is already an asterisks
            _startTime = "";
        } else {
            _startTime = "00:00:00"; //set to midnight
        };
    } else {
        _startTime = req.body.startTime + ":00:00";
    };



    var _endDate = S("").toString();
    var tempStrIn2 = S(req.body.endDate).trim() + "*";
    if (tempStrIn2 == "*") {
        _endDate = "*";
    } else {
        _endDate = req.body.endDate + "/01/01";
    };
    var _endTime = S("").toString();
    tempStrIn2 = S(req.body.endTime).trim() + "*";
    if (tempStrIn2 == "*") {
        if (_endDate == "*") {
            //start date is already an asterisks
            _endTime = "";
        } else {
            _endTime = "00:00:00"; //set to midnight
        };
    } else {
        _endTime = req.body.endTime + ":00:00";
    };

    var _startMach = req.body.startMach;
    var _endMach = req.body.endMach;

    //find the start string, either a wild card or the start UTC
    var searchStartStr = "";
    if (_startDate == "*") {
        searchStartStr = "0"; //if it is a wild card then search from utc=0
    } else {
        //not a wildcard
        var tempStr = S(_startDate).left(4).toString();
        var startYear = parseInt(tempStr);

        var tempStr2 = S(_startDate);
        var startMonth = parseInt(tempStr2.substr(5, 2));

        var tempStr3 = S(_startDate);
        var startDate = parseInt(tempStr3.substr(8, 2));

        var tempStr4 = S(_startTime);
        var startHour = parseInt(tempStr4.left(2));
        var startMin = parseInt(tempStr4.substr(3, 2));
        var startSec = parseInt(tempStr4.substr(6, 2));
        var startDate_utc = Date.UTC(startYear, startMonth, startDate, startHour, startMin, startSec);
        searchStartStr = S(startDate_utc).toString();
    };

    //find the end date string
    var searchEndStr = "";
    if (_endDate == "*") {
        var endDate_utc = Date.UTC(3000, 12, 31, 0, 0, 0);
        searchEndStr = S(endDate_utc).toString();
    } else {
        //not a wildcard
        var tempStr = S(_endDate).left(4).toString();
        var endYear = parseInt(tempStr);

        var tempStr2 = S(_endDate);
        var endMonth = parseInt(tempStr2.substr(5, 2));

        var tempStr3 = S(_endDate);
        var endDate = parseInt(tempStr3.substr(8, 2));

        var tempStr4 = S(_endTime);
        var endHour = parseInt(tempStr4.left(2));
        var endMin = parseInt(tempStr4.substr(3, 2));
        var endSec = parseInt(tempStr4.substr(6, 2));
        var endDate_utc = Date.UTC(endYear, endMonth, endDate, endHour, endMin, endSec);
        searchEndStr = S(endDate_utc).toString();
    };

    var eventByTimeListOutput = []; //array for use in listing

    console.log("start = " + searchStartStr);
    console.log("end = " + searchEndStr);

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'events by time';
        var actionString = 'events by time';

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            actionDone,
            actionString
        );


        var query = "INSERT INTO user_log (time_str, ip_addr, action_done, action_string) VALUES (?, ?, ?, ? )";
        connection.query(query, [
            userLogRec.timeStr,
            userLogRec.clientIP,
            userLogRec.action_done,
            userLogRec.action_string
        ], function(err, response) {
            //log has been written, read all the events

            var queryStr = "SELECT * FROM event_bytime WHERE on_time_utc >= ? AND on_time_utc <= ?";

            connection.query(queryStr, [searchStartStr, searchEndStr], function(err, response) {
                //all of the sessions of previous times pulled out
                //console.log(response);
                for (var i = 0; i < response.length; i++) {
                    //loop thru all of the responses
                    //console.log(response);
                    //console.log(response[i]);
                    let eventByTimeRec = new eventByTimeRecStoreType(
                        response[i].start_time_str,
                        response[i].end_time_str,
                        response[i].event_duration,
                        response[i].m1,
                        response[i].m2,
                        response[i].m3,
                        response[i].m4,
                        response[i].m5,
                        response[i].m6,
                        response[i].m7,
                        response[i].m8,
                        response[i].m9
                    );

                    eventByTimeListOutput.push(eventByTimeRec);
                };
                //console.log(videoListOutput);
                res.render('report_evt_list', { outputObj: eventByTimeListOutput });
                //connection.end();
            }); //query for read logfiles  
        }); //query to write to user log	
    } else {
        var actionDone = 'log file list';
        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            'timed out',
            ' ',
            ' ',
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
            res.render('index');
        });
    };
});



class eventByMachRecStoreType {
    constructor(_event_str, _start_time_str, _end_time_str, _event_duration_utc, _on_time_utc, _off_time_utc) {
        this.event_str = _event_str;
        this.start_time_str = _start_time_str;
        this.end_time_str = _end_time_str;
        this.event_duration_utc = _event_duration_utc;
        this.on_time_utc = _on_time_utc;
        this.off_time_utc = _off_time_utc;
    }
};



router.post('/evm_list', function(req, res, next) {
    //display list of events by machine
    console.log('/reports/evm_list route');

    var _startDate = S("").toString();
    var tempStrIn = S(req.body.startDate).trim() + "*";
    if (tempStrIn == "*") {
        _startDate = "*";
    } else {
        _startDate = req.body.startDate + "/01/01";
    };
    var _startTime = S("").toString();
    tempStrIn = S(req.body.startTime).trim() + "*";
    if (tempStrIn == "*") {
        if (_startDate == "*") {
            //start date is already an asterisks
            _startTime = "";
        } else {
            _startTime = "00:00:00"; //set to midnight
        };
    } else {
        _startTime = req.body.startTime + ":00:00";
    };



    var _endDate = S("").toString();
    var tempStrIn2 = S(req.body.endDate).trim() + "*";
    if (tempStrIn2 == "*") {
        _endDate = "*";
    } else {
        _endDate = req.body.endDate + "/01/01";
    };
    var _endTime = S("").toString();
    tempStrIn2 = S(req.body.endTime).trim() + "*";
    if (tempStrIn2 == "*") {
        if (_endDate == "*") {
            //start date is already an asterisks
            _endTime = "";
        } else {
            _endTime = "00:00:00"; //set to midnight
        };
    } else {
        _endTime = req.body.endTime + ":00:00";
    };

    var _startMach = req.body.startMach;
    var _endMach = req.body.endMach;

    //find the start string, either a wild card or the start UTC
    var searchStartStr = "";
    if (_startDate == "*") {
        searchStartStr = "0"; //if it is a wild card then search from utc=0
    } else {
        //not a wildcard
        var tempStr = S(_startDate).left(4).toString();
        var startYear = parseInt(tempStr);

        var tempStr2 = S(_startDate);
        var startMonth = parseInt(tempStr2.substr(5, 2));

        var tempStr3 = S(_startDate);
        var startDate = parseInt(tempStr3.substr(8, 2));

        var tempStr4 = S(_startTime);
        var startHour = parseInt(tempStr4.left(2));
        var startMin = parseInt(tempStr4.substr(3, 2));
        var startSec = parseInt(tempStr4.substr(6, 2));
        var startDate_utc = Date.UTC(startYear, startMonth, startDate, startHour, startMin, startSec);
        searchStartStr = S(startDate_utc).toString();
    };

    //find the end date string
    var searchEndStr = "";
    if (_endDate == "*") {
        var endDate_utc = Date.UTC(3000, 12, 31, 0, 0, 0);
        searchEndStr = S(endDate_utc).toString();
    } else {
        //not a wildcard
        var tempStr = S(_endDate).left(4).toString();
        var endYear = parseInt(tempStr);

        var tempStr2 = S(_endDate);
        var endMonth = parseInt(tempStr2.substr(5, 2));

        var tempStr3 = S(_endDate);
        var endDate = parseInt(tempStr3.substr(8, 2));

        var tempStr4 = S(_endTime);
        var endHour = parseInt(tempStr4.left(2));
        var endMin = parseInt(tempStr4.substr(3, 2));
        var endSec = parseInt(tempStr4.substr(6, 2));
        var endDate_utc = Date.UTC(endYear, endMonth, endDate, endHour, endMin, endSec);
        searchEndStr = S(endDate_utc).toString();
    };

    var eventByMachListOutput = []; //array for use in listing

    console.log("start = " + searchStartStr);
    console.log("end = " + searchEndStr);

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'events by mach';
        var actionString = 'events by mach';

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            actionDone,
            actionString
        );


        var query = "INSERT INTO user_log (time_str, ip_addr, action_done, action_string) VALUES (?, ?, ?, ? )";
        connection.query(query, [
            userLogRec.timeStr,
            userLogRec.clientIP,
            userLogRec.action_done,
            userLogRec.action_string
        ], function(err, response) {
            //log has been written, read all the events

            var queryStr = "SELECT * FROM event_bymach WHERE start_time_utc >= ? AND start_time_utc <= ?";
            connection.query(queryStr, [searchStartStr, searchEndStr], function(err, response) {
                //all of the sessions of previous times pulled out
                let currMach = 0;
                let currOnTim = 0.0;
                let currOffTim = 0.0;
                let currTotTim = 0.0; //total time
                let currOnPer = 0.0;
                let currOffPer = 0.0;

                if (response.length > 0) {
                    //might want to put into a class to keep it together
                    currMach = parseInt(response[0].mach_num); //cur mach
                };

                for (var i = 0; i < response.length; i++) {
                    //loop thru all of the response
                    let dur_hr = 0;
                    dur_hr = response[i].event_duration_utc / 1000 / 60 / 60; //convert to hours 
                    let on_hr = 0;
                    on_hr = response[i].on_time_utc / 1000 / 60 / 60;
                    let off_hr = 0;
                    off_hr = response[i].off_time_utc / 1000 / 60 / 60;

                    //calculate the percentages
                    let respMachNum = parseInt(response[i].mach_num);
                    if ((respMachNum == currMach) && (i < (response.length - 1))) {
                        //mach number has not changed
                        currOnTim = currOnTim + on_hr;
                        currOffTim = currOffTim + off_hr;
                        currTotTim = currTotTim + dur_hr;
                    } else {
                        //mach number changed or the last record
                        if (i == (response.length - 1)) {
                            //store the last record
                            //make it a different variable then the rest
                            let eventByMachRec2 = new eventByMachRecStoreType(
                                response[i].event_str,
                                response[i].start_time_str,
                                response[i].end_time_str,
                                dur_hr.toFixed(3),
                                on_hr.toFixed(3),
                                off_hr.toFixed(3)
                            );
                            eventByMachListOutput.push(eventByMachRec2);
                        };
                        let eventByMachRec = new eventByMachRecStoreType(
                            "totals",
                            " ",
                            " ",
                            currTotTim.toFixed(3),
                            currOnTim.toFixed(3),
                            currOffTim.toFixed(3)
                        );
                        eventByMachListOutput.push(eventByMachRec); //store the totals	  
                        let currZero = 0;

                        if (currOnTim == 0) {
                            currOnPer = 0;
                        } else {
                            currOnPer = (currOnTim / currTotTim) * 100.0;
                        };
                        if (currOffTim == 0) {
                            currOffPer = 0;
                        } else {
                            currOffPer = (currOffTim / currTotTim) * 100.0;
                        };

                        eventByMachRec = new eventByMachRecStoreType(
                            "percentages",
                            " ",
                            " ",
                            //currZero.toFixed(1),
                            " ",
                            currOnPer.toFixed(2),
                            currOffPer.toFixed(2)
                        );

                        eventByMachListOutput.push(eventByMachRec); //store the totals

                        eventByMachRec = new eventByMachRecStoreType(
                            " ",
                            " ",
                            " ",
                            " ",
                            " ",
                            " "
                        );
                        eventByMachListOutput.push(eventByMachRec); //store the totals

                        currMach = parseInt(response[i].mach_num);
                        currTotTim = dur_hr;
                        currOnTim = on_hr;
                        currOffTim = off_hr;
                    };
                    if (i != (response.length - 1)) {
                        //store record except if it is the last one
                        let eventByMachRec = new eventByMachRecStoreType(
                            response[i].event_str,
                            response[i].start_time_str,
                            response[i].end_time_str,
                            dur_hr.toFixed(3),
                            on_hr.toFixed(3),
                            off_hr.toFixed(3)
                        );
                        eventByMachListOutput.push(eventByMachRec);
                    };
                };
                //console.log(videoListOutput);
                res.render('report_evm_list', { outputObj: eventByMachListOutput });
                //connection.end();
            }); //query for read logfiles  
        }); //query to write to user log	
    } else {
        var actionDone = 'log file list';
        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            'timed out',
            ' ',
            ' ',
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
            res.render('index');
        });
    };
});



class MachUtilRecType {
    constructor(_machOnHours, _machOffHours, _machPerUsage, _machPerIdle,
            _totHours, _totPerUtil, _workHours, _workPer) {
            this.machOnHours = _machOnHours;
            this.machOffHours = _machOffHours;
            this.machPerUsage = _machPerUsage;
            this.machPerIdle = _machPerIdle;
            this.totHours = _totHours;
            this.totPerUtil = _totPerUtil;
            this.workHours = _workHours;
            this.workPer = _workPer;
        } //for storing stats per machine
};


class MachUtilOutputType {
    constructor(_descrip, _m1, _m2, _m3, _m4, _m5, _m6, _m7, _m8, _m9) {
            this.Descrip = _descrip;
            this.M1 = _m1;
            this.M2 = _m2;
            this.M3 = _m3;
            this.M4 = _m4;
            this.M5 = _m5;
            this.M6 = _m6;
            this.M7 = _m7;
            this.M8 = _m8;
            this.M9 = _m9;
        } //for storing stats per machine
};

function padZero(intValue, size) {
    var s = String(intValue);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}



router.post('/mach_util', function(req, res, next) {
    //machine utilization report
    console.log('/reports/mach_util route');
    //track
    //total on-time, total off time, 
    //tot avail hours, tot work hours
    //also department hours
    //num mach, num active mach, 

    let numMach = 9; //number of machines, later depending on input change it
    let machUtilTable = [];

    //fill the table with 0's before starting
    for (i = 0; i < numMach; i++) {
        let machUtilRec = new MachUtilRecType(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        machUtilTable.push(machUtilRec);
    };

    var _startDate = S("").toString();
    var tempStrIn = S(req.body.startDate).trim() + "*";
    if (tempStrIn == "*") {
        _startDate = "*";
    } else {
        _startDate = req.body.startDate + "/01/01";
    };
    var _startTime = S("").toString();
    tempStrIn = S(req.body.startTime).trim() + "*";
    if (tempStrIn == "*") {
        if (_startDate == "*") {
            //start date is already an asterisks
            _startTime = "";
        } else {
            _startTime = "00:00:00"; //set to midnight
        };
    } else {
        _startTime = req.body.startTime + ":00:00";
    };


    var _endDate = S("").toString();
    var tempStrIn2 = S(req.body.endDate).trim() + "*";
    if (tempStrIn2 == "*") {
        _endDate = "*";
    } else {
        _endDate = req.body.endDate + "/01/01";
    };
    var _endTime = S("").toString();
    tempStrIn2 = S(req.body.endTime).trim() + "*";
    if (tempStrIn2 == "*") {
        if (_endDate == "*") {
            //start date is already an asterisks
            _endTime = "";
        } else {
            _endTime = "23:59:00"; //set to midnight
        };
    } else {
        _endTime = req.body.endTime + ":00:00";
    };

    var _startMach = req.body.startMach;
    var _endMach = req.body.endMach;

    //find the start string, either a wild card or the start UTC
    var startDate_utc = 0;
    var reportStartDate_unix = 0;
    var reportStartDate_str = "";
    var searchStartDate_unix = 0;
    var searchStartDate_str = "";
    var startDate_str = ""; //start date as a string
    var searchStartStr = "";
    if (_startDate == "*") {
        searchStartStr = "0"; //if it is a wild card then search from utc=0
        searchStartDate_str = "*";
    } else {
        //not a wildcard
        var tempStr = S(_startDate).left(4).toString();
        var startYear = parseInt(tempStr);

        var tempStr2 = S(_startDate);
        var startMonth = parseInt(tempStr2.substr(5, 2));

        var tempStr3 = S(_startDate);
        var startDate = parseInt(tempStr3.substr(8, 2));

        var tempStr4 = S(_startTime);
        var startHour = parseInt(tempStr4.left(2));
        var startMin = parseInt(tempStr4.substr(3, 2));
        var startSec = parseInt(tempStr4.substr(6, 2));
        startDate_utc = Date.UTC(startYear, startMonth, startDate, startHour, startMin, startSec);
        //startDate_str = moment().unix(startDate_utc);

        startDate_str = padZero(startYear, 2) + "/" + padZero(startMonth, 2) + "/" + padZero(startDate, 2) +
            " " + padZero(startHour, 2) + ":" + padZero(startMin, 2) + ":" + padZero(startSec, 2);
        reportStartDate_unix = moment(startDate_str, "YYYY/MM/DD HH:mm:SS").unix();

        searchStartDate_unix = moment().unix(startDate_utc);
        searchStartStr = S(startDate_utc).toString();
        searchStartDate_str = moment.unix(reportStartDate_unix).format("MM/DD/YYYY HH:mm:SS");
    };

    //find the end date string
    var endDate_utc = 0;
    var reportEndDate_unix = 0;
    var reportEndDate_str = "";
    var searchEndDate_unix = 0;
    var endDate_str = ""; //end date in string form
    var searchEndStr = "";
    if (_endDate == "*") {
        endDate_utc = Date.UTC(3000, 12, 31, 0, 0, 0);
        searchEndStr = S(endDate_utc).toString();
        searchEndDate_str = "*";
    } else {
        //not a wildcard
        var tempStr = S(_endDate).left(4).toString();
        var endYear = parseInt(tempStr);

        var tempStr2 = S(_endDate);
        var endMonth = parseInt(tempStr2.substr(5, 2));

        var tempStr3 = S(_endDate);
        endDate = parseInt(tempStr3.substr(8, 2));

        var tempStr4 = S(_endTime);
        var endHour = parseInt(tempStr4.left(2));
        var endMin = parseInt(tempStr4.substr(3, 2));
        var endSec = parseInt(tempStr4.substr(6, 2));
        console.log("end time = " + _endTime);
        endDate_utc = Date.UTC(endYear, endMonth, endDate, endHour, endMin, endSec);
        endDate_str = padZero(endYear, 2) + "/" + padZero(endMonth, 2) + "/" + padZero(endDate, 2) +
            " " + padZero(endHour, 2) + ":" + padZero(endMin, 2) + ":" + padZero(endSec, 2);
        reportEndDate_unix = moment(endDate_str, "YYYY/MM/DD HH:mm:SS").unix();

        searchEndDate_unix = moment.unix(endDate_utc);
        searchEndStr = S(endDate_utc).toString();
        searchEndDate_str = moment.unix(reportEndDate_unix).format("MM/DD/YYYY HH:mm:SS");
    };

    var machUtilOutput = []; //mach utilization array for output 

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'mach utilization';
        var actionString = 'events by mach';

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            actionDone,
            actionString
        );


        var query = "INSERT INTO user_log (time_str, ip_addr, action_done, action_string) VALUES (?, ?, ?, ? )";
        connection.query(query, [
            userLogRec.timeStr,
            userLogRec.clientIP,
            userLogRec.action_done,
            userLogRec.action_string
        ], function(err, response) {
            //log has been written, read all the events

            var queryStr = "SELECT * FROM event_bymach WHERE start_time_utc >= ? AND start_time_utc <= ?";
            connection.query(queryStr, [searchStartStr, searchEndStr], function(err, response) {
                //all of the sessions of previous times pulled out
                if (response.length > 0) {
                    //might want to put into a class to keep it together
                    currMach = parseInt(response[0].mach_num); //cur mach
                    startDate_utc = response[0].start_time_utc;
                    endDate_utc = response[response.length - 1].end_time_utc;
                };

                let deptTotOnHrs = 0;
                let deptTotOffHrs = 0;
                var tempDate = moment("01/01/2300", "MM/DD/YYYY");
                reportStartDate_unix = moment("01/01/2300", "MM/DD/YYYY").unix();
                reportEndDate_unix = 0;
                for (var i = 0; i < response.length; i++) {
                    //loop thru all of the response
                    //add it to the MachUtilTable
                    let respMachNum = parseInt(response[i].mach_num);

                    var recStartTime_unix = moment(response[i].start_time_str).unix();
                    var recEndTime_unix = moment(response[i].end_time_str).unix();
                    if (recStartTime_unix < reportStartDate_unix) reportStartDate_unix = recStartTime_unix;
                    if (recEndTime_unix > reportEndDate_unix) reportEndDate_unix = recEndTime_unix;
                    if (recStartTime_unix > reportEndDate_unix) reportEndDate_unix = recStartTime_unix;

                    let dur_hr = 0;
                    dur_hr = response[i].event_duration_utc / 1000 / 60 / 60; //convert to hours 
                    let on_hr = 0;
                    on_hr = response[i].on_time_utc / 1000 / 60 / 60;
                    deptTotOnHrs = deptTotOnHrs + on_hr;

                    let off_hr = 0;
                    off_hr = response[i].off_time_utc / 1000 / 60 / 60;
                    deptTotOffHrs = deptTotOffHrs + off_hr;
                    machUtilTable[respMachNum - 1].machOnHours = machUtilTable[respMachNum - 1].machOnHours + on_hr;
                    machUtilTable[respMachNum - 1].machOffHours = machUtilTable[respMachNum - 1].machOffHours + off_hr;
                };

                let totAvailHrs = (reportEndDate_unix - reportStartDate_unix);
                //console.log("start after for loop = " + moment.unix(reportStartDate_unix).format("MM/DD/YYYY"));			  
                //console.log("end after for loop = " + moment.unix(reportEndDate_unix).format("MM/DD/YYYY"));			  
                reportStartDate_str = moment.unix(reportStartDate_unix).format("MM/DD/YYYY HH:mm:ss");
                reportEndDate_str = moment.unix(reportEndDate_unix).format("MM/DD/YYYY HH:mm:ss");

                totAvailHrs = totAvailHrs / 60 / 60; //convert sec to hours
                let deptTotAvailHrs = totAvailHrs * numMach;
                var day = moment.unix(reportStartDate_unix);
                var endDate = moment.unix(reportEndDate_unix);
                var businessDays = 0;

                while (day <= endDate) {
                    if (day.day() != 0 && day.day() != 6) businessDays++;
                    day.add(1, 'days');
                }

                let prodHours = businessDays * 24.0;
                let deptProdHours = prodHours * numMach;

                //different than other report, can calculate pecentages when done
                for (var i = 0; i < numMach; i++) {
                    machUtilTable[i].totHours = totAvailHrs;
                    machUtilTable[i].workHours = prodHours;
                    if (machUtilTable[i].machOnHours == 0) {
                        machUtilTable[i].machPerUsage = 0;
                        machUtilTable[i].machPerIdle = 100.0;
                        machUtilTable[i].totPerUtil = 0.0;
                        machUtilTable[i].workPer = 0.0;
                    } else {
                        if (machUtilTable[i].machOffHours == 0) {
                            machUtilTable[i].machPerUsage = 100.0;
                            machUtilTable[i].machPerIdle = 0.0;
                            machUtilTable[i].totPerUtil = 100.0;
                            machUtilTable[i].workPer = 100.0;
                        } else {
                            machUtilTable[i].machPerUsage = machUtilTable[i].machOnHours / (machUtilTable[i].machOnHours + machUtilTable[i].machOffHours) * 100.0;
                            machUtilTable[i].machPerIdle = 100.0 - machUtilTable[i].machPerUsage;
                            machUtilTable[i].totPerUtil = machUtilTable[i].machOnHours / machUtilTable[i].totHours * 100.0;
                            machUtilTable[i].workPer = machUtilTable[i].machOnHours / machUtilTable[i].workHours * 100.0;
                        };
                    };
                };

                //now start the output
                //first record
                let machUtilOutputRec = new MachUtilOutputType(
                    "total on hrs",
                    machUtilTable[0].machOnHours.toFixed(2),
                    machUtilTable[1].machOnHours.toFixed(2),
                    machUtilTable[2].machOnHours.toFixed(2),
                    machUtilTable[3].machOnHours.toFixed(2),
                    machUtilTable[4].machOnHours.toFixed(2),
                    machUtilTable[5].machOnHours.toFixed(2),
                    machUtilTable[6].machOnHours.toFixed(2),
                    machUtilTable[7].machOnHours.toFixed(2),
                    machUtilTable[8].machOnHours.toFixed(2)
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "total off hrs",
                    machUtilTable[0].machOffHours.toFixed(2),
                    machUtilTable[1].machOffHours.toFixed(2),
                    machUtilTable[2].machOffHours.toFixed(2),
                    machUtilTable[3].machOffHours.toFixed(2),
                    machUtilTable[4].machOffHours.toFixed(2),
                    machUtilTable[5].machOffHours.toFixed(2),
                    machUtilTable[6].machOffHours.toFixed(2),
                    machUtilTable[7].machOffHours.toFixed(2),
                    machUtilTable[8].machOffHours.toFixed(2)
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "percent usage",
                    machUtilTable[0].machPerUsage.toFixed(1) + "%",
                    machUtilTable[1].machPerUsage.toFixed(1) + "%",
                    machUtilTable[2].machPerUsage.toFixed(1) + "%",
                    machUtilTable[3].machPerUsage.toFixed(1) + "%",
                    machUtilTable[4].machPerUsage.toFixed(1) + "%",
                    machUtilTable[5].machPerUsage.toFixed(1) + "%",
                    machUtilTable[6].machPerUsage.toFixed(1) + "%",
                    machUtilTable[7].machPerUsage.toFixed(1) + "%",
                    machUtilTable[8].machPerUsage.toFixed(1) + "%"
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "percent idle",
                    machUtilTable[0].machPerIdle.toFixed(1) + "%",
                    machUtilTable[1].machPerIdle.toFixed(1) + "%",
                    machUtilTable[2].machPerIdle.toFixed(1) + "%",
                    machUtilTable[3].machPerIdle.toFixed(1) + "%",
                    machUtilTable[4].machPerIdle.toFixed(1) + "%",
                    machUtilTable[5].machPerIdle.toFixed(1) + "%",
                    machUtilTable[6].machPerIdle.toFixed(1) + "%",
                    machUtilTable[7].machPerIdle.toFixed(1) + "%",
                    machUtilTable[8].machPerIdle.toFixed(1) + "%"
                );
                machUtilOutput.push(machUtilOutputRec);

                //insert blank line
                machUtilOutputRec = new MachUtilOutputType(
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                //insert separator
                machUtilOutputRec = new MachUtilOutputType(
                    "hours incl sat & sun",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "total available hrs",
                    machUtilTable[0].totHours.toFixed(2),
                    machUtilTable[1].totHours.toFixed(2),
                    machUtilTable[2].totHours.toFixed(2),
                    machUtilTable[3].totHours.toFixed(2),
                    machUtilTable[4].totHours.toFixed(2),
                    machUtilTable[5].totHours.toFixed(2),
                    machUtilTable[6].totHours.toFixed(2),
                    machUtilTable[7].totHours.toFixed(2),
                    machUtilTable[8].totHours.toFixed(2)
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "% usage of total",
                    machUtilTable[0].totPerUtil.toFixed(1) + "%",
                    machUtilTable[1].totPerUtil.toFixed(1) + "%",
                    machUtilTable[2].totPerUtil.toFixed(1) + "%",
                    machUtilTable[3].totPerUtil.toFixed(1) + "%",
                    machUtilTable[4].totPerUtil.toFixed(1) + "%",
                    machUtilTable[5].totPerUtil.toFixed(1) + "%",
                    machUtilTable[6].totPerUtil.toFixed(1) + "%",
                    machUtilTable[7].totPerUtil.toFixed(1) + "%",
                    machUtilTable[8].totPerUtil.toFixed(1) + "%"
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "% idle of total",
                    (100.0 - machUtilTable[0].totPerUtil).toFixed(1) + "%",
                    (100.0 - machUtilTable[1].totPerUtil).toFixed(1) + "%",
                    (100.0 - machUtilTable[2].totPerUtil).toFixed(1) + "%",
                    (100.0 - machUtilTable[3].totPerUtil).toFixed(1) + "%",
                    (100.0 - machUtilTable[4].totPerUtil).toFixed(1) + "%",
                    (100.0 - machUtilTable[5].totPerUtil).toFixed(1) + "%",
                    (100.0 - machUtilTable[6].totPerUtil).toFixed(1) + "%",
                    (100.0 - machUtilTable[7].totPerUtil).toFixed(1) + "%",
                    (100.0 - machUtilTable[8].totPerUtil).toFixed(1) + "%"
                );
                machUtilOutput.push(machUtilOutputRec);

                //insert blank line
                machUtilOutputRec = new MachUtilOutputType(
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                //insert separator
                machUtilOutputRec = new MachUtilOutputType(
                    "workday (mon-fri)",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "total workday hrs",
                    machUtilTable[0].workHours.toFixed(2),
                    machUtilTable[1].workHours.toFixed(2),
                    machUtilTable[2].workHours.toFixed(2),
                    machUtilTable[3].workHours.toFixed(2),
                    machUtilTable[4].workHours.toFixed(2),
                    machUtilTable[5].workHours.toFixed(2),
                    machUtilTable[6].workHours.toFixed(2),
                    machUtilTable[7].workHours.toFixed(2),
                    machUtilTable[8].workHours.toFixed(2)
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "% usage of workdays",
                    machUtilTable[0].workPer.toFixed(1) + "%",
                    machUtilTable[1].workPer.toFixed(1) + "%",
                    machUtilTable[2].workPer.toFixed(1) + "%",
                    machUtilTable[3].workPer.toFixed(1) + "%",
                    machUtilTable[4].workPer.toFixed(1) + "%",
                    machUtilTable[5].workPer.toFixed(1) + "%",
                    machUtilTable[6].workPer.toFixed(1) + "%",
                    machUtilTable[7].workPer.toFixed(1) + "%",
                    machUtilTable[8].workPer.toFixed(1) + "%"
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "% idle of workdays",
                    (100.0 - machUtilTable[0].workPer).toFixed(1) + "%",
                    (100.0 - machUtilTable[1].workPer).toFixed(1) + "%",
                    (100.0 - machUtilTable[2].workPer).toFixed(1) + "%",
                    (100.0 - machUtilTable[3].workPer).toFixed(1) + "%",
                    (100.0 - machUtilTable[4].workPer).toFixed(1) + "%",
                    (100.0 - machUtilTable[5].workPer).toFixed(1) + "%",
                    (100.0 - machUtilTable[6].workPer).toFixed(1) + "%",
                    (100.0 - machUtilTable[7].workPer).toFixed(1) + "%",
                    (100.0 - machUtilTable[8].workPer).toFixed(1) + "%"
                );
                machUtilOutput.push(machUtilOutputRec);


                //insert blank
                machUtilOutputRec = new MachUtilOutputType(
                    "_____________________",
                    "______",
                    "______",
                    "______",
                    "______",
                    "______",
                    "______",
                    "______",
                    "______",
                    "______"
                );
                machUtilOutput.push(machUtilOutputRec);


                //insert blank
                machUtilOutputRec = new MachUtilOutputType(
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                //insert separator
                machUtilOutputRec = new MachUtilOutputType(
                    "Department (all mach)",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "number of machines",
                    numMach,
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                //insert blank
                machUtilOutputRec = new MachUtilOutputType(
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "total hours",
                    deptTotAvailHrs.toFixed(2),
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "usage hours",
                    deptTotOnHrs.toFixed(2),
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                let deptOnPer = deptTotOnHrs / deptTotAvailHrs * 100.0;
                machUtilOutputRec = new MachUtilOutputType(
                    "percent usage",
                    deptOnPer.toFixed(1) + "%",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "idle hours",
                    deptTotOffHrs.toFixed(2),
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                let deptOffPer = deptTotOffHrs / deptTotAvailHrs * 100.0;
                machUtilOutputRec = new MachUtilOutputType(
                    "percent idle",
                    deptOffPer.toFixed(1) + "%",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                //insert blank
                machUtilOutputRec = new MachUtilOutputType(
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "workday (mon-fri)",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "total workday hrs",
                    deptProdHours.toFixed(2),
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                let deptProdOnPer = deptTotOnHrs / deptProdHours * 100.0;
                let deptProdOffPer = (100.0 - deptProdOnPer);
                machUtilOutputRec = new MachUtilOutputType(
                    "% workday usage",
                    deptProdOnPer.toFixed(1) + "%",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                machUtilOutputRec = new MachUtilOutputType(
                    "% workday idle",
                    deptProdOffPer.toFixed(1) + "%",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " ",
                    " "
                );
                machUtilOutput.push(machUtilOutputRec);

                res.render('report_mach_util', {
                    searchStartDate: searchStartDate_str,
                    searchEndDate: searchEndDate_str,
                    reportStartDate: reportStartDate_str,
                    reportEndDate: reportEndDate_str,
                    outputObj: machUtilOutput
                });
            }); //query for read logfiles  
        }); //query to write to user log	
    } else {
        var actionDone = 'log file list';
        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            'timed out',
            ' ',
            ' ',
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
            res.render('index');
        });
    };
});


module.exports = router;