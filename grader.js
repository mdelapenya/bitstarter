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
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fierce-reaches-1073.herokuapp.com";

var checks;

var cheerioHtmlFile = function(infile) {
  fs.readFile(infile, function(content) {
    var fn = cheerio.load(content);

    checkContent(cheerio.load(content));
  });
};

var cheerioURLFile = function(inurl) {
  var url = restler.get(inurl);

  url.on("complete", function(result) {
    if (result instanceof Error) {
      console.error(inurl + " is not a valid URL. Exiting.", result);
    }
    else {
      var fn = cheerio.load(result);

      checkContent(fn);
    }
  });
};

/*
* It's better to read the check file in a synchronous way: we need that file to process
*/
var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkContent = function(processFunction) {
  var out = {};

  for(var ii in checks) {
    var present = processFunction(checks[ii]).length > 0;

    out[checks[ii]] = present;
  }

  var outJson = JSON.stringify(out, null, 4);

  console.log(outJson);

  return out;
};

if(require.main == module) {
  program
    .option('-c, --checks [checks_filename]', 'The file where html markup is defined.', CHECKSFILE_DEFAULT)
    .option('-f, --file [hd_file]', 'Hard-disk File to check.')
    .option('-u, --url [application_url]', 'URL where the application is deployed.')
    .parse(process.argv);

  checks = loadChecks(program.checks).sort();

  if (program.file) {
    program.file.forEach(cheerioHtmlFile);
  }

  if (program.url) {
    cheerioURLFile(program.url);
  }
}
else {
  exports.checkContent = checkContent;
}