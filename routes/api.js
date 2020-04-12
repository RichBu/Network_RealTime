//
// backend API's for use in upoading logged events
//

let fs = require('fs')
let path = require('path');
let express = require('express');

let router = express.Router();

var connection = require('../connection');

let fileLoc = './public/videos/';

let S = require('string');

const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const numeral = require("numeral");
const math = require('mathjs');
const sprintf = require('sprintf-js').sprintf;




//put in a separate class
class userLogRecStoreType {
    constructor(_timeStr, _clientIP, _action_done, _action_string) {
        this.timeStr = _timeStr;
        this.clientIP = _clientIP;
        this.action_done = _action_done;
        this.action_string = _action_string;
    }
};


//post route to store a log file record
router.post('/logfile', function(req, res, next) {
    var fileNameToAdd = req.body.fileName;
    var loginValid = 'false';
    var outputUrl = '/';

    console.log('at post to store log file record');
    console.log('add this file: ' + fileNameToAdd);

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'api-post log file';
        var actionString = 'add a log file name to db';

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
            //log has been written, now write to the log file table

            var query = "INSERT INTO files_log (time_of_upload_str, filename_str ) VALUES (?, ?)";
            connection.query(query, [
                userLogRec.timeStr,
                fileNameToAdd
            ], function(err, response) {
                //should check if there is an error
                //return the proper code
                if (err) {
                    console.log("error at api ...");
                    console.log(err);
                } else {
                    res.status(201).send(); //201 means record has been created
                }

                //res.render('logfile_list', {outputObj: logFileListOutput});
            }); //query to write to files log  
        }); //query to write to user log	
    } else {
        var actionDone = 'api-post log file';
        var actionString = 'tried to add but timed out';

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
            res.render('index');
        });
    };
});



//post to the events by time
//need to send in utc pieces so Node JS can assemble UTC easily
router.post('/eventbytime', function(req, res, next) {
    console.log('at API event by time');
    console.log('add this time: ' + req.body.startTimeStr);

    var _startTimeStr = req.body.startTimeStr;
    var _endTimeStr = req.body.endTimeStr;
    var _eventDuration = req.body.eventDuration;
    var _ontim_utc_yr = req.body.ontim_utc_yr;
    var _ontim_utc_mon = req.body.ontim_utc_mon;
    var _ontim_utc_day = req.body.ontim_utc_day;
    var _ontim_utc_hr = req.body.ontim_utc_hr;
    var _ontim_utc_min = req.body.ontim_utc_min;
    var _ontim_utc_sec = req.body.ontim_utc_sec;
    var _onTime_utc = Date.UTC(
        _ontim_utc_yr, _ontim_utc_mon, _ontim_utc_day,
        _ontim_utc_hr, _ontim_utc_min, _ontim_utc_sec
    );

    var _offtim_utc_yr = req.body.offtim_utc_yr;
    var _offtim_utc_mon = req.body.offtim_utc_mon;
    var _offtim_utc_day = req.body.offtim_utc_day;
    var _offtim_utc_hr = req.body.offtim_utc_hr;
    var _offtim_utc_min = req.body.offtim_utc_min;
    var _offtim_utc_sec = req.body.offtim_utc_sec;
    var _offTime_utc = Date.UTC(
        _offtim_utc_yr, _offtim_utc_mon, _offtim_utc_day,
        _offtim_utc_hr, _offtim_utc_min, _offtim_utc_sec
    );

    var _durtim_utc_yr = req.body.durtim_utc_yr;
    var _durtim_utc_mon = req.body.durtim_utc_mon;
    var _durtim_utc_day = req.body.durtim_utc_day;
    var _durtim_utc_hr = req.body.durtim_utc_hr;
    var _durtim_utc_min = req.body.durtim_utc_min;
    var _durtim_utc_sec = req.body.durtim_utc_sec;
    var _durTime_utc = Date.UTC(
        _durtim_utc_yr, _durtim_utc_mon, _durtim_utc_day,
        _durtim_utc_hr, _durtim_utc_min, _durtim_utc_sec
    );
    //forget what got sent over, do the math here
    _durTime_utc = _offTime_utc - _onTime_utc;

    var _m1 = req.body.m1;
    var _m2 = req.body.m2;
    var _m3 = req.body.m3;
    var _m4 = req.body.m4;
    var _m5 = req.body.m5;
    var _m6 = req.body.m6;
    var _m7 = req.body.m7;
    var _m8 = req.body.m8;
    var _m9 = req.body.m9;

    var loginValid = 'false';
    var outputUrl = '/';

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'api-post event by time';
        var actionString = 'add an event by time';

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
            //log has been written, now write to the log file table	  
            var query = "INSERT INTO event_bytime (start_time_str, end_time_str, event_duration, on_time_utc, off_time_utc, dur_time_utc, m1, m2, m3, m4, m5, m6, m7, m8, m9) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            connection.query(query, [
                _startTimeStr,
                _endTimeStr,
                _eventDuration,
                _onTime_utc,
                _offTime_utc,
                _durTime_utc,
                _m1, _m2, _m3, _m4, _m5, _m6, _m7, _m8, _m9
            ], function(err, response) {
                //should check if there is an error
                //return the proper code
                if (err) {
                    console.log("error at api ...");
                    console.log(err);
                } else {
                    res.status(201).send(); //201 means record has been created
                }

                //res.render('logfile_list', {outputObj: logFileListOutput});
            }); //query to write to event by time 
        }); //query to write to user log	
    } else {
        var actionDone = 'api-post event by time';
        var actionString = 'tried to add but timed out';

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
            res.render('index');
        });
    };
});



//post to the events by machine
//need to send in utc pieces so Node JS can assemble UTC easily
router.post('/eventbymach', function(req, res, next) {
    console.log('at API event by machine');
    console.log('add this time: ' + req.body.startTimeStr);

    var _machNumStr = req.body.machNumStr;
    var _machNum = req.body.machNum;
    var _eventStr = req.body.eventStr;

    var _startTimeStr = req.body.startTimeStr;
    var _starttime_utc_yr = req.body.starttime_utc_yr;
    var _starttime_utc_mon = req.body.starttime_utc_mon;
    var _starttime_utc_day = req.body.starttime_utc_day;
    var _starttime_utc_hr = req.body.starttime_utc_hr;
    var _starttime_utc_min = req.body.starttime_utc_min;
    var _starttime_utc_sec = req.body.starttime_utc_sec;
    var _startTime_utc = Date.UTC(
        _starttime_utc_yr, _starttime_utc_mon, _starttime_utc_day,
        _starttime_utc_hr, _starttime_utc_min, _starttime_utc_sec
    );

    var _endTimeStr = req.body.endTimeStr;
    var _endtime_utc_yr = req.body.endtime_utc_yr;
    var _endtime_utc_mon = req.body.endtime_utc_mon;
    var _endtime_utc_day = req.body.endtime_utc_day;
    var _endtime_utc_hr = req.body.endtime_utc_hr;
    var _endtime_utc_min = req.body.endtime_utc_min;
    var _endtime_utc_sec = req.body.endtime_utc_sec;
    var _endTime_utc = Date.UTC(
        _endtime_utc_yr, _endtime_utc_mon, _endtime_utc_day,
        _endtime_utc_hr, _endtime_utc_min, _endtime_utc_sec
    );

    var testStr = "";
    testStr = _eventStr;
    var _eventDuration_utc = _endTime_utc - _startTime_utc;
    var _onTime_utc = 0; //need to set from duration
    var _offTime_utc = 0; //need to set from duration
    if (testStr.includes("off")) {
        //if there is "off" in the event string then it means machine 
        //was turned off, so it was on during the duration
        _offTime_utc = _eventDuration_utc;
    } else {
        //must be off time
        _onTime_utc = _eventDuration_utc;
    };

    var loginValid = 'false';
    var outputUrl = '/';

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'api-post event by time';
        var actionString = 'add an event by time';

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
            //log has been written, now write to the log file table	  
            var query = "INSERT INTO event_bymach (mach_num_str, mach_num, event_str, start_time_str, end_time_str, start_time_utc, end_time_utc,  event_duration_utc, on_time_utc, off_time_utc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            connection.query(query, [
                _machNumStr,
                _machNum,
                _eventStr,
                _startTimeStr,
                _endTimeStr,
                _startTime_utc,
                _endTime_utc,
                _eventDuration_utc,
                _onTime_utc,
                _offTime_utc
            ], function(err, response) {
                //should check if there is an error
                //return the proper code
                if (err) {
                    console.log("error at api ...");
                    console.log(err);
                } else {
                    res.status(201).send(); //201 means record has been created
                }

                //res.render('logfile_list', {outputObj: logFileListOutput});
            }); //query to write to event by time 
        }); //query to write to user log	
    } else {
        var actionDone = 'api-post event by machine';
        var actionString = 'tried to add but timed out';

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
            res.render('index');
        });
    };
});





//post route to store RT data
router.post('/update-rt-data', function(req, res, next) {
    const numMach = 10;

    var M1 = req.body.M1;
    var M2 = req.body.M2;
    var M3 = req.body.M3;
    var M4 = req.body.M4;
    var M5 = req.body.M5;
    var M6 = req.body.M6;
    var M7 = req.body.M7;
    var M8 = req.body.M8;
    var M9 = req.body.M9;
    var M10 = req.body.M10;

    let currDate = moment();
    let currDateUnix = moment.unix(currDate);

    var loginValid = 'false';
    var outputUrl = '/';

    console.log('at update-rt-data post route');

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (req.session.logged_in != true) {
        req.session.loginName = " ";
        req.session.password = " ";
        req.session.fullName = " ";
    };
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'api-post RT update';
        var actionString = 'update RT data';

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            req.session.loginName,
            req.session.password,
            req.session.fullName,
            actionDone
        );


        /*
        var query = "INSERT INTO user_log (time_str, ip_addr, loginName, password, fullName, action_done) VALUES (?, ?, ?, ?, ?, ? )";
        connection.query(query, [
            userLogRec.timeStr,
            userLogRec.clientIP,
            userLogRec.loginName,
            userLogRec.password,
            userLogRec.fullName,
            userLogRec.action_done
        ], function(err, response) {
        */
        //log has been written, now write to the log file table

        currDate = moment();
        console.log("curr date =" + currDate);
        currDateUnix = currDate.valueOf();
        currDateUnix_int = parseInt(currDateUnix);
        //currDateUnix = currDateUnix.valueOf;
        console.log("unix=" + currDateUnix_int);
        console.log("date to write to = " + moment(currDateUnix_int).format("YYYY-MM-DD HH:mm:ss"));
        let currDateStr = currDate.format("YYYY-MM-DD HH:mm:ss");
        console.log("curr date as a string = " + currDateStr);

        for (var machLp = 0; machLp < (numMach); machLp++) {
            //loop thru all of the machines
            var outMachNum = "";
            var outMachCode = "";
            switch (machLp) {
                case 0:
                    outMachNum = "01";
                    outMachCode = M1;
                    break;
                case 1:
                    outMachNum = "02";
                    outMachCode = M2;
                    break;
                case 2:
                    outMachNum = "03";
                    outMachCode = M3;
                    break;
                case 3:
                    outMachNum = "04";
                    outMachCode = M4;
                    break;
                case 4:
                    outMachNum = "05";
                    outMachCode = M5;
                    break;
                case 5:
                    outMachNum = "06";
                    outMachCode = M6;
                    break;
                case 6:
                    outMachNum = "07";
                    outMachCode = M7;
                    break;
                case 7:
                    outMachNum = "08";
                    outMachCode = M8;
                    break;
                case 8:
                    outMachNum = "09";
                    outMachCode = M9;
                    break;
                case 9:
                    outMachNum = "10";
                    outMachCode = M10;
                    break;
            }; //switch statement

            //now need to make the query be synchronous instead of async
            var continF = 0
            var query2 = "UPDATE rt_data SET mach_stat_code=? WHERE mach_num=?";
            connection.query(query2, [
                outMachCode,
                outMachNum
            ], function(err2, response2) {
                //should check if there is an error
                continF = 1;
                /*
                var query3 = "UPDATE mach_rt SET mach_stat_code=? WHERE mach_num=?";
                connection.query(query3, [
                    "99",
                    "0000" //currDateUnix
                ], function(err3, response3) {
                    //should check if there is an error
                    continF = 1;
                });
                */
            });
        }; //for loop

        //stored all the data now store the time done
        var query3 = "UPDATE rt_data SET mach_stat_code=? WHERE mach_num=?";
        connection.query(query3, [
            currDateUnix_int,
            "99"
        ], function(err2, response2) {
            //should check if there is an error
            continF = 1;
        });

        res.status(201).send(); //201 means record has been created
        //}); //query to write to user log	
    } else {
        var actionDone = 'api-post RT data';
        var actionString = 'tried to add but timed out';

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            req.session.loginName,
            req.session.password,
            req.session.fullName,
            req.session.actionDone
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
            res.render('index');
        });
    };
}); //update-rt-data



//post route to retrieve RT data
router.post('/read-rt-data', function(req, res, next) {
    const numMach = 9;

    var M0 = "";
    var M1 = "";
    var M2 = "";
    var M3 = "";
    var M4 = "";
    var M5 = "";
    var M6 = "";
    var M7 = "";
    var M8 = "";
    var M9 = "";
    var M10 = "";

    var loginValid = 'false';
    var outputUrl = '/';

    console.log('at read-rt-data post route');

    var dataOutput = [];

    //check if logged in, later feature
    //for now, bypass
    let noLogin = true;
    if (req.session.logged_in != true) {
        req.session.loginName = " ";
        req.session.password = " ";
        req.session.fullName = " ";
    };
    if (noLogin || req.session.logged_in === true) {
        var actionDone = 'api-post RT read';
        var actionString = 'update RT data';

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            req.session.loginName,
            req.session.password,
            req.session.fullName,
            actionDone
        );


        //outputObj is for rt-data	
        function outputObj(_mach_num, _mach_stat_code, _fault_code, _fault_descrip) {
            this.mach_num = _mach_num,
                this.mach_stat_code = _mach_stat_code,
                this.fault_code = _fault_code,
                this.fault_descrip = _fault_descrip
        };

        let updateDate = moment();
        let updateDate_int = 0;
        let updateDateStr = "";
        var query2 = "SELECT * FROM rt_data";
        connection.query(query2, [], function(err, response) {
            for (var i = 0; i < response.length; i++) {
                //loop thru all of the responses
                if (response[i].mach_num == "99") {
                    updateDate_int = parseInt(response[i].mach_stat_code);
                    console.log("update int = " + updateDate_int);
                    updateDate = moment(updateDate_int);
                    updateDateStr = updateDate.format("HH:mm:ss MM/DD/YYYY");
                    console.log("update date = " + updateDateStr);
                    dataOutput.push(new outputObj(
                        "99",
                        updateDateStr,
                        "00",
                        " "
                    ));
                } else {
                    dataOutput.push(new outputObj(
                        response[i].mach_num,
                        response[i].mach_stat_code,
                        response[i].fault_code,
                        response[i].fault_descrip
                    ));
                };
            };

            //calculate the time difference
            let currDateUnix = moment().valueOf();
            let updDate = moment(updateDate_int);
            let curDate = moment(currDateUnix);
            let diffTotSecs_mom = curDate.diff(updDate, 'seconds');
            let diffTotSecs = diffTotSecs_mom.valueOf();
            let tempCalc = diffTotSecs / 3600.0;
            let diffHours = math.floor(tempCalc).valueOf();
            let diffHoursStr = sprintf("0%i", diffHours);
            tempCalc = (diffTotSecs - diffHours * 3600.0) / 60.0;
            let diffMin = math.floor(tempCalc).valueOf();
            tempCalc = (diffTotSecs - diffHours * 3600.0 - diffMin * 60.0);
            let diffSec = math.floor(tempCalc).valueOf();
            let diffStr = sprintf("%'02i", diffHours) + ":" + sprintf("%'02i", diffMin) + ":" + sprintf("%'02i", diffSec);

            console.log("curr date = " + curDate.format("HH:mm:ss"));
            console.log("upd date = " + updDate.format("HH:mm:ss"));
            console.log("diff str = " + diffStr);
            console.log(" ");
            dataOutput.push(new outputObj(
                "98",
                diffStr
            ));
            res.status(201).send(dataOutput); //201 means record has been created
        });

    } else {
        var actionDone = 'api-post RT data';
        var actionString = 'tried to add but timed out';

        let userLogRec = new userLogRecStoreType(
            moment().format("YYYY-MM-DD  HH:mm a"),
            req.session.clientIP,
            req.session.loginName,
            req.session.password,
            req.session.fullName,
            req.session.actionDone
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
            res.render('index');
        });
    };
}); //read-rt-data


module.exports = router;