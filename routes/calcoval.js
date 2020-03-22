let fs      = require('fs')
let path    = require('path');
let express = require('express');

let router  = express.Router();

var connection = require('../connection');

let fileLoc = './public/videos/';

const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const numeral = require("numeral");
const math = require('mathjs');


//put in a separate file
class userActionLogRecStoreType {
	constructor(_timeStr, _ip_addr, _action_done, _rollDiam, _diamXdir, _cavityDepth, _calcXval, _calcYmin, _calcYmax, _calcScaleMin, _calcScaleMax){
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
}


router.get('/', function(req, res, next) {
	//this is the root route for /calcoval 
	//it is now thru a post call so display nothing if the user
	//bookmarks this location
	});
	

router.post('/do-calc-oval', function(req, res, next) {
		var outputUrl = "/";
		var _rollDiam = req.body.rollDiam;
		var _cavityDiam = req.body.cavityDiam;
		var _cavityDepth =  req.body.cavityDepth;

		var numDec = 4;
		var rollDiamOut = math.format((_rollDiam*1.0),  {notation: 'fixed', precision: numDec});
		var cavityDiamOut = math.format((_cavityDiam*1.0),  {notation: 'fixed', precision: numDec});
		var cavityDepthOut = math.format((_cavityDepth*1.0),  {notation: 'fixed', precision: numDec});

		var diamDiff01 = _rollDiam - _cavityDepth;     //this is the 1/2 deep point
		var diamDiff02 = _rollDiam - (_cavityDepth*2.0); //this is at max depth of cavity 

		var ratio01 = _rollDiam / diamDiff01;  //at 1/2 point
		var ratioMinOut = math.format(ratio01,  {notation: 'fixed', precision: numDec});
		var ratioMinPer = (ratioMinOut - 1.0) * 100.0;
		var ratioMinPerOut = math.format(ratioMinPer,  {notation: 'fixed', precision: 2});

		var ratio02 = _rollDiam / diamDiff02;  //at max depth 
		var ratioMaxOut = math.format(ratio02,  {notation: 'fixed', precision: numDec});
		var ratioMaxPer = (ratioMaxOut - 1.0) * 100.0 ;
		var ratioMaxPerOut = math.format(ratioMaxPer,  {notation: 'fixed', precision: 2});

		var Ydim01calc = ratio01 * _cavityDiam;
		var Ydim01out = math.format(Ydim01calc,  {notation: 'fixed', precision: numDec});
		var Ydim02calc = ratio02 * _cavityDiam;
		var Ydim02out = math.format(Ydim02calc,  {notation: 'fixed', precision: numDec});

		//store to the log first
		let userLogRec = new userActionLogRecStoreType(
			moment().format("YYYY-MM-DD  HH:mm a"),
			//"10.10.10.190",
			req.session.clientIP,
			"calculation",
			rollDiamOut, 			//diam
			cavityDiamOut, 		 	//dimXdir
			cavityDepthOut, 		//cavityDepth
			cavityDiamOut, 			//calcXval
			Ydim01out, 				//calcYmin
			Ydim02out, 				//calcYmax
			ratioMinOut, 			//calcScaleMin
			ratioMaxOut			  	//calcScaleMax
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
		  ], function (err, response) {
			  //wrote the action log, so can render the page
			  res.render('calc_results', 
			  {
			  rollDiam: rollDiamOut,
			  cavityDiam: cavityDiamOut,
			  cavityDepth: cavityDepthOut,
			  Ydim01: Ydim01out,
			  Ydim02: Ydim02out,
			  ratioMin: ratioMinOut,
			  ratioMinPer: ratioMinPerOut,
			  ratioMax: ratioMaxOut,
			  ratioMaxPer: ratioMaxPerOut
			  });  
		  });
	});		

module.exports = router;
