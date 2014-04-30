var express = require('express');
var app = express();
var env = app.get('env');

var server = app.listen(process.env.PORT || 4730);;

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

if ('production' != env) {
    app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  res.type('text/plain');
  res.send('NodeJS Configured in AppHarbor');
});

exports = module.exports = app;
exports.use = function() {
  app.use.apply(app, arguments);
};