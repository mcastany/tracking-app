var express = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var app = express();

var env = process.env.NODE_ENV || 'development';

var server = app.listen(process.env.PORT || 4730);;

app.use(bodyParser()); 						
app.use(methodOverride()); 	

if ('production' != env) {
   app.use(require('errorhandler')());
}

app.route('/')
.get(function(req, res) {
  res.type('text/plain');
  res.send('NodeJS Configured in AppHarbor');
});

exports = module.exports = app;
exports.use = function() {
  app.use.apply(app, arguments);
};