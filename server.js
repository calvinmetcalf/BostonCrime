#!/bin/env node
//  OpenShift sample Node application

var express = require('express');
var fs      = require('fs');
var request = require('request');
var xml2js = require('xml2js');
var d = [];
d.date = new Date(1900,1,1);

//  Local cache for static content [fixed and loaded at startup]
var zcache = { 'index.html': '','map.js':'','map.css':'','smallgreen.png':'',
'favicon.ico':''};
zcache['index.html'] = fs.readFileSync('./index.html'); 
zcache['map.js'] = fs.readFileSync('./map.js'); 
zcache['map.css'] = fs.readFileSync('./map.css'); 
zcache['smallgreen.png'] = fs.readFileSync('./smallgreen.png');
zcache['favicon.ico'] = fs.readFileSync('./favicon.ico');
// Create "express" server.
var cwm  = express.createServer();

/*  =====================================================================  */
/*  Setup route handlers.  */
/*  =====================================================================  */

// Handler for GET /health
cwm.get('/health', function(req, res){
    res.send('1');
});
cwm.get('/date', function(req, res){
    res.send(d.date);
});
cwm.enable("jsonp callback");
cwm.get('/crime', function(req, res){
  var yest = new Date();
  yest.setDate(yest.getDate()-1);
  if(d.date<yest){
  getCrime(res);
  }else{
  res.json(d.data);
  }
});


// Handler for GET /
cwm.get('/', function(req, res){
    res.send(zcache['index.html'], {'Content-Type': 'text/html'});
});
cwm.get('/map.js', function(req, res){
    res.send(zcache['map.js'], {'Content-Type': 'application/javascript'});
});

cwm.get('/map.css', function(req, res){
    res.send(zcache['map.css'], {'Content-Type': 'text/css'});
});
cwm.get('/smallgreen.png', function(req, res){
    res.send(zcache['smallgreen.png'], {'Content-Type': 'image/png'});
cwm.get('/favicon.ico', function(req, res){
    res.send(zcache['favicon.ico'], {'Content-Type': 'image/vnd.microsoft.icon'});
});

//  Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_INTERNAL_IP;
var port    = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
}

//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

//  And start the app on that interface (and port).
cwm.listen(port, ipaddr, function() {
   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});
var getCrime = function(res){
request('http://hubmaps.cityofboston.gov/open_gov/XML/BPDCrime.xml', function (error, response, body) {
  if (!error && response.statusCode == 200) {
   var parser = new xml2js.Parser();
     parser.parseString(body, function (err, result) {
       res.json(result);
        console.log('Done');
        d.data = result;
        d.date= new Date();
    });
  }
})
}
