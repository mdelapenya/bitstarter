#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

var CHECKSFILE_DEFAULT = "checks.json";

var checks;

var getHtmlFromFile = function(infile) {
  fs.readFile(infile, function(err, result) {
    if (err) {
      console.error(infile + " does not exist.", err);
    }
    else {
      var fn = cheerio.load(result);

      _checkContent(fn);
    }
  });
};

var getHtmlFromURL = function(inurl) {
  var url = restler.get(inurl);

  url.on("complete", function(result) {
    if (result instanceof Error) {
      console.error(inurl + " is not a valid URL.", result);
    }
    else {
      var fn = cheerio.load(result);

      _checkContent(fn);
    }
  });
};

var _checkContent = function(processFunction) {
  var out = {};

  checks.forEach(function(item) {
    out[item] = processFunction(item).length > 0;
  });

  var outJson = JSON.stringify(out, null, 4);

  console.log(outJson);

  return out;
};

/*
* It's better to read the check file in a synchronous way: we need that file to process
*/
var _loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

if(require.main == module) {
  program
    .option('-c, --checks [checks_filename]', 'The file where html markup is defined.', CHECKSFILE_DEFAULT)
    .option('-f, --file [hd_file]', 'Hard-disk File to check.')
    .option('-u, --url [application_url]', 'URL where the application is deployed.')
    .parse(process.argv);

  checks = _loadChecks(program.checks).sort();

  if (program.file) {
    getHtmlFromFile(program.file);
  }

  if (program.url) {
    getHtmlFromURL(program.url);
  }
}
else {
  exports.getHtmlFromFile = getHtmlFromFile;
  exports.getHtmlFromURL = getHtmlFromURL;
}