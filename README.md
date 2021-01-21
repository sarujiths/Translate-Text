# Translate Text

The Translate text can dynamically translate text between thousands of language pairs.The Translate Text lets websites and programs integrate with the translation service programmatically. 

Google Translate API provided by [Rapid API](https://rapidapi.com/googlecloud/api/google-translate1) which is a RESTful API, is used for API calls.

**Table of contents**
* [Technology used](#technology-used)
* [Project Setup](#project-setup)
  * [Buy an API](#buy-an-api)
  * [Install client libraries](#install-client-libraries)
  * [Using client libraries](#using-client-libraries)
* [Running the server](#running-the-server)
  * [Execution of code](#execution-of-code)
* [Supporting Versions](#supporting-versions)
* [License](#license)

## Technology used

Translate Text uses a number of open source projects to work properly:

* HTML 5.0
* node.js
* Express

## Project Setup

### Buy an API

1. Buy a Google Translate API at [Rapid  API](https://rapidapi.com/googlecloud/api/google-translate1)
2. Enable the API
3. Copy your API key
4. Test any Endpoint once to check the API key

### Install client libraries

Install the client libraries used, before starting the server

```sh
$ npm install express
$ npm install memory-cache
```

### Using client libraries
```javascript
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
```

## Running the server

First run `TranslateText.js` node.js file which act as a server
```sh
$ node TranslateText.js
```
Open `client.html` file. Then enter the text to be translated and select the target text.
Finally, click the `Translate` button.

#### Execution of the code:
1. Reads the query string.
2. Detects the source language through API/get from cache.
3. Translates the text to target language through API/get from cache.
4. Displays the translated text through responce.

## Supporting Versions

Our client libraries follow the [Node.js release schedule](https://nodejs.org/en/about/releases/).
Libraries are compatible with all current _active_ and _maintenance_ versions of
Node.js.

Client libraries targeting some end-of-life versions of Node.js are available, and
can be installed via npm [dist-tags](https://docs.npmjs.com/cli/dist-tag).
The dist-tags follow the naming convention `legacy-(version)`.

_Legacy Node.js versions are supported as a best effort:_

* Legacy versions will not be tested in continuous integration.
* Some security patches may not be able to be backported.
* Dependencies will not be kept up-to-date, and features will not be backported.

#### Legacy tags available

* `legacy-8`: install client libraries from this dist-tag for versions
  compatible with Node.js 8.

## License

Apache Version 2.0
See [LICENSE](https://github.com/googleapis/nodejs-translate/blob/master/LICENSE)
