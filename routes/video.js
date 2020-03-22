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
class userLogRecStoreType {
	constructor( _timeStr, _clientIP, _loginName, _password, _fullName, _action_done ) {
	  this.timeStr = _timeStr;
	  this.clientIP = _clientIP;
	  this.loginName = _loginName;
	  this.password = _password;
	  this.fullName = _fullName;
	  this.action_done = _action_done
	}
  };


//
//	Stream the video
//
router.get('/play/:movieID', function(req, res, next) {
	//routine to render the video playback page
	console.log('at the play video route')
	if (req.session.logged_in === true ) {
		let _movieID = req.params.movieID;
		let actionDone = 'play ' + _movieID;
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
		  ], function (err, response) {
			//user log written can continue  
			var queryStr = "SELECT * FROM movies WHERE movie_id = ?";
			connection.query(queryStr, [_movieID], function (err, response) {
				//all of the sessions of previous times pulled out
				//console.log(response);
				//console.log(response);
				//connection.end();
				let sqlTitle = response[0].title;
				let sqlShort_descrip = response[0].short_descrip;
				let sqlLong_descrip = response[0].long_descrip;
				let sqlLink_on_GoogleDrive = response[0].link_on_GoogleDrive;
				let sqlLink_mpeg_location = response[0].link_mpeg_location;
				let sqlLink_mpeg_name = response[0].link_mpeg_name;
		
				let videoFileOut = "";
				let isOnGoogleDriveF = 'N';
				let videoTagOut = "";
		
				if (sqlLink_on_GoogleDrive === 'N') {
					//not on the google drive, so do nothing with data ?
					videoFileOut = sqlLink_mpeg_name;
					isOnGoogleDriveF = 'N';
					videoTagOut = process.env.BASE_URL + '/video/' + videoFileOut + '/' + isOnGoogleDriveF;
				} else {
					videoFileOut = sqlLink_on_GoogleDrive + sqlLink_mpeg_name
					isOnGoogleDriveF = 'Y';
					videoTagOut = videoFileOut;
				};
		
				res.render('play_video', {
					base_url: process.env.BASE_URL,
					//videoTitle: 'toystory.mp4',
					videoTitle: sqlTitle,
					videoFile: videoFileOut,
					videoTag: videoTagOut,
					isOnGoogleDrive: isOnGoogleDriveF,
					shortDescrip: sqlShort_descrip,
					longDescrip: sqlLong_descrip
				});
			});				
		  });
	} else {
		//not logged in bump back out
		res.render('index');
	};
});


router.get('/display', function(req, res, next) {
	//display list of videos
	var videoListOutput = [];
	var videoListOutput2 = [];

	//check if logged in
	if (req.session.logged_in === true ) {
		var actionDone = 'video list';		
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
		  ], function (err, response) {
		  //what to do after the log has been written

		  var queryStr = "SELECT * FROM movies";

		  function videoListObj( _movieID, _videoTitle, _fileName, _shortDescrip, _longDescrip ) {
			  this.movieID = _movieID;
			  this.videoTitle = _videoTitle;
			  this.fileName = _fileName;
			  this.shortDescrip = _shortDescrip;
			  this.longDescrip = _longDescrip
		  };
	  
		  connection.query(queryStr, [], function (err, response) {
			  //all of the sessions of previous times pulled out
			  //console.log(response);
			  for (var i = 0; i < response.length; i++) {
				  //loop thru all of the responses
				  videoListOutput.push(new videoListObj(
					  response[i].movie_id,
					  response[i].title,
					  response[i].link_mpeg_name,
					  response[i].short_descrip,
					  response[i].long_descrip
				  ));
			  };
			  //console.log(videoListOutput);
			  res.render('video_list', {outputObj: videoListOutput});
			  //connection.end();
		  }); //query for read movies  
		});  //query to write to user log	
	} else {
		var actionDone = 'video list';		
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
		  ], function (err, response) {
			res.render('index');
		  });
	};
});


router.get('/:videoTitle/:isGoogleDrive', function(req, res, next) {
	//
	//	1.	Path to the movie to stream
	//
	//let file = fileLoc + 'toystory.mp4';
	if (isGoogleDrive=='Y') {
		//on Google Drive so the file is just the videoTitle
		let file = req.params.videoTitle;
	} else {
		let file = fileLoc + req.params.videoTitle;
	};
	
	
	//let file = "https://drive.google.com/file/d/1DG1NjPcn1gMWGJ0ywIMdFEXv9LqamtDx/view?usp=sharing";
	//let file = "https://drive.google.com/uc?export=download&id=1DG1NjPcn1gMWGJ0ywIMdFEXv9LqamtDx"
	//          
	//	2.	Get meta information from the file. In this case we are interested
	//		in its size.
	//
	fs.stat(file, function(err, stats) {

		//
		//	1.	If there was an error reading the file stats we inform the
		//		browser of what actual happened
		//
		if(err)
		{
			//
			//	1.	Check if the file exists
			//
console.log('err on file ...');

			if(err.code === 'ENOENT')
			{
				//
				// 	->	404 Error if file not found
				//
console.log('files not found');

				return res.sendStatus(404);
			}

			//
			//	2.	IN any other case, just output the full error
			//
			return next(err)
		}

		//
		//	2.	Save the range the browser is asking for in a clear and
		//		reusable variable
		//
		//		The range tells us what part of the file the browser wants
		//		in bytes.
		//
		//		EXAMPLE: bytes=65534-33357823
		//
		let range = req.headers.range;

		//
		//	3.	Make sure the browser ask for a range to be sent.
		//
		if(!range)
		{
			//
			// 	1.	Create the error
			//
			let err = new Error('Wrong range');
				err.status = 416;

			//
			//	->	Send the error and stop the request.
			//
			return next(err);
		}

		//
		//	4.	Convert the string range in to an array for easy use.
		//
		let positions = range.replace(/bytes=/, '').split('-');

		//
		//	5.	Convert the start value in to an integer
		//
		let start = parseInt(positions[0], 10);

		//
		//	6.	Save the total file size in to a clear variable
		//
		let file_size = stats.size;

		//
		//	7.	IF 		the end parameter is present we convert it in to an
		//				integer, the same way we did the start position
		//
		//		ELSE 	We use the file_size variable as the last part to be
		//				sent.
		//
		let end = positions[1] ? parseInt(positions[1], 10) : file_size - 1;

		//
		//	8.	Calculate the amount of bits will be sent back to the
		//		browser.
		//
		let chunksize = (end - start) + 1;

		//
		//	9.	Create the header for the video tag so it knows what is
		//		receiving.
		//
		let head = {
			'Content-Range': 'bytes ' + start + '-' + end + '/' + file_size,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/mp4'
		}

		//
		//	10.	Send the custom header
		//
		res.writeHead(206, head);

		//
		//	11.	Create the createReadStream option object so createReadStream
		//		knows how much data it should be read from the file.
		//
		let stream_position = {
			start: start,
			end: end
		}

		//
		//	12.	Create a stream chunk based on what the browser asked us for
		//
		let stream = fs.createReadStream(file, stream_position)

		//
		//	13.	Once the stream is open, we pipe the data through the response
		//		object.
		//
		stream.on('open', function() {

			stream.pipe(res);

		})

		//
		//	->	If there was an error while opening a stream we stop the
		//		request and display it.
		//
		stream.on('error', function(err) {

			return next(err);

		});

	});

});

module.exports = router;
