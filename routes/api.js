//
// backend API's for use in upoading logged events
//

let fs      = require('fs')
let path    = require('path');
let express = require('express');

let router  = express.Router();

var connection = require('../connection');

let fileLoc = './public/videos/';

let S       = require('string');

const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const numeral = require("numeral");
const math = require('mathjs');



//put in a separate class
class userLogRecStoreType {
	constructor( _timeStr, _clientIP, _action_done, _action_string ) {
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
	if (noLogin || req.session.logged_in === true ) {
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
		  ], function (err, response) {
		  //log has been written, now write to the log file table
		
		  var query = "INSERT INTO files_log (time_of_upload_str, filename_str ) VALUES (?, ?)";
		  connection.query(query, [
			userLogRec.timeStr,
			fileNameToAdd
			], function (err, response) {
			  //should check if there is an error
			  //return the proper code
			  if (err) {
				  console.log("error at api ...");
				  console.log(err);
			  } else {
				res.status(201).send();  //201 means record has been created
			  }
		
			  //res.render('logfile_list', {outputObj: logFileListOutput});
		  }); //query to write to files log  
		});  //query to write to user log	
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
		  ], function (err, response) {
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
	var _ontim_utc_yr  = req.body.ontim_utc_yr;
	var _ontim_utc_mon = req.body.ontim_utc_mon;
	var _ontim_utc_day = req.body.ontim_utc_day;
	var _ontim_utc_hr  = req.body.ontim_utc_hr;
	var _ontim_utc_min = req.body.ontim_utc_min;
	var _ontim_utc_sec = req.body.ontim_utc_sec;
	var _onTime_utc = Date.UTC(
		_ontim_utc_yr, _ontim_utc_mon, _ontim_utc_day,
		_ontim_utc_hr, _ontim_utc_min, _ontim_utc_sec
	);

	var _offtim_utc_yr  = req.body.offtim_utc_yr;
	var _offtim_utc_mon = req.body.offtim_utc_mon;
	var _offtim_utc_day = req.body.offtim_utc_day;
	var _offtim_utc_hr  = req.body.offtim_utc_hr;
	var _offtim_utc_min = req.body.offtim_utc_min;
	var _offtim_utc_sec = req.body.offtim_utc_sec;
	var _offTime_utc = Date.UTC(
		_offtim_utc_yr, _offtim_utc_mon, _offtim_utc_day,
		_offtim_utc_hr, _offtim_utc_min, _offtim_utc_sec
	);

	var _durtim_utc_yr  = req.body.durtim_utc_yr;
	var _durtim_utc_mon = req.body.durtim_utc_mon;
	var _durtim_utc_day = req.body.durtim_utc_day;
	var _durtim_utc_hr  = req.body.durtim_utc_hr;
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
	if (noLogin || req.session.logged_in === true ) {
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
		  ], function (err, response) {
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
			], function (err, response) {
			  //should check if there is an error
			  //return the proper code
			  if (err) {
				  console.log("error at api ...");
				  console.log(err);
			  } else {
				res.status(201).send();  //201 means record has been created
			  }
		
			  //res.render('logfile_list', {outputObj: logFileListOutput});
		  }); //query to write to event by time 
		});  //query to write to user log	
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
		  ], function (err, response) {
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
	var _onTime_utc = 0;  //need to set from duration
	var _offTime_utc = 0; //need to set from duration
	if (testStr.includes("off")) {
		//if there is "off" in the event string then it means machine 
		//was turned off, so it was on during the duration
		_offTime_utc = _eventDuration_utc;
	}  else {
		//must be off time
		_onTime_utc = _eventDuration_utc;
	};

	var loginValid = 'false';
	var outputUrl = '/';

	//check if logged in, later feature
	//for now, bypass
	let noLogin = true;
	if (noLogin || req.session.logged_in === true ) {
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
		  ], function (err, response) {
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
			], function (err, response) {
			  //should check if there is an error
			  //return the proper code
			  if (err) {
				  console.log("error at api ...");
				  console.log(err);
			  } else {
				res.status(201).send();  //201 means record has been created
			  }
		
			  //res.render('logfile_list', {outputObj: logFileListOutput});
		  }); //query to write to event by time 
		});  //query to write to user log	
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
		  ], function (err, response) {
			res.render('index');
		  });
	};
});


module.exports = router;
