/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
// Import required modules 
var express = require("express");
var unirest = require("unirest");
var mcache = require("memory-cache");

// Creating instance object for Express
var app = express();

var apikey = 'YOUR_API_KEY';

// This part allows the code to use sub-directory files
app.use(express.static('public'));
app.get('/client.html', function (req, res) {
   res.sendFile( __dirname + "/" + "client.html" );
})

// Function that detects and returns the source language of text
function findLanguage(text){
	var req = unirest("POST", "https://google-translate1.p.rapidapi.com/language/translate/v2/detect");
	req.headers({
		"content-type": "application/x-www-form-urlencoded",
		"accept-encoding": "application/gzip",
		"x-rapidapi-key": apikey,
		"x-rapidapi-host": "google-translate1.p.rapidapi.com",
		"useQueryString": true
	});
	req.form({
		"q": text
	});
	req.end(function (res) {
		if (res.error) throw new Error(res.error);
		var result=res.body.data.detections[0][0].language;
		return result;
	});
}

//This responds a GET request for the /translate page.
app.get('/translate', function(req, res) {
	
	// Storing query text
	var querytext=req.query.text;
	var querytarget=req.query.target;
	var textsource;
	var translated;
	
	// Checking cache memory for source of given text
	// if available, it will get for cache, 
	// else make an API call through findLanguage function
	var key='_projtranslate_source_'+querytext;
	var cachedbody=mcache.get(key);
	if(cachedbody && cachedbody!='undefined'){
		textsource=cachedbody;
	} else {
		textsource=findLanguage(querytext);
		//stores result in cache memory
		mcache.put(key,textsource);
	}
	
	// Checking cache memory for translation of given text
	// if available, it will get for cache, 
	// else make an API call
	var key2='_projtranslate_translate_'+querytext+'_'+textsource;
	var cachedbody2=mcache.get(key);
	
	if(cachedbody2 && cachedbody2!='undefined'){
		
		// Prepare output in JSON format
		responce = {
			translated_text:cachedbody2
		};
		res.end(JSON.stringify(responce));
	} else {
		var req = unirest("POST", "https://google-translate1.p.rapidapi.com/language/translate/v2");
		req.headers({
			"content-type": "application/x-www-form-urlencoded",
			"accept-encoding": "application/gzip",
			"x-rapidapi-key": apikey,
			"x-rapidapi-host": "google-translate1.p.rapidapi.com",
			"useQueryString": true
		});
		req.form({
			"q": querytext,
			"source": textsource,
			"target": querytarget
		});
		req.end(function (resp) {
			if (resp.error) throw new Error(resp.error);
		
			translated=resp.body.data.translations[0].translatedText;
			
			//stores result in cache memory
			mcache.put(key2,translated);
			
			// Prepare output in JSON format
			responce = {
					translated_text:translated
			};
			res.end(JSON.stringify(responce));
		});
	}
})

// Creating server in 8081 port
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})