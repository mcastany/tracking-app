var express = require('express');
var fs      = require('fs');
var mongodb = require('mongodb');

var App = function(){

  // Scope
  var self = this;

  // Setup
  self.dbServer = new mongodb.Server("ds029817.mongolab.com",parseInt("29817"));
  self.db = new mongodb.Db("appharbor_e6a2bd7e-24ec-441f-a7cf-574cf646c8e8", self.dbServer, {auto_reconnect: true});
  self.dbUser = "appharbor_e6a2bd7e-24ec-441f-a7cf-574cf646c8e8";
  self.dbPass = "a1cmfsf7qdk52se1413rjla6s0";
  self.collectionName = "locations";
  self.port = parseInt(process.env.PORT) || 8080;

  self.routes = {};
  self.routes['health'] = function(req, res){ res.send('1'); };
  self.routes['returnLocations'] = function(req, res){
    self.db.collection(self.collectionName).find().toArray(function(err, names) {
        res.header("Content-Type:","application/json");
        res.end(JSON.stringify(names));
    });
  };
  self.routes['createLocation'] = function(req, res){
	var name = req.body.name;
	var date = req.body.date;
	var time = req.body.time;
    var lat = req.body.lat;
    var lon = req.body.lon;
     
	var element = {
		'user' : name, 
		'date': date,
		'time': time,
		'pos' : [lat, lon]
		};
		
	console.log('%s: Node Creating element: lat: %s long:%s ...', Date(Date.now()), lat, lon);
    self.db.collection(self.collectionName).insert(element), function(result){
		res.header("Content-Type:","application/json");
		res.end({status : 'success'});
    };
  };
  self.routes['returnLocationsByUser'] = function(req, res){
	var user = req.params.user;
  
    console.log("Searching user: " + user);
	self.db.collection(self.collectionName).find({"user" : user}).toArray(function(err,names){
		res.header("Content-Type:","application/json");
		res.end(JSON.stringify(names));
	});
  };
  self.routes['returnLocationsByUserByDate'] = function(req, res){
    var user = req.params.user;
	var date = req.params.date;
	
	console.log("Searching user: " + user + " and data: " + date);
	
	self.db.collection(self.collectionName).find({"user" : user, "date" : date}).toArray(function(err,names){
		res.header("Content-Type:","application/json");
		res.end(JSON.stringify(names));
	});
  };
  
  // Web app urls
  self.app  = express();
  self.app.use(express.compress());
  
  // Serve up content from public directory
  self.app.use(express.static(__dirname + '/public'));

  //This uses the Connect frameworks body parser to parse the body of the post request
  self.app.configure(function () {
    self.app.use(express.bodyParser());
    self.app.use(express.methodOverride());
    self.app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  //define all the url mappings
  self.app.get('/health', self.routes['health']);
  self.app.get('/api/locations', self.routes['returnLocations']);
  self.app.post('/api/locations', self.routes['createLocation']);
  self.app.get('/api/locations/:user', self.routes['returnLocationsByUser']);
  self.app.get('/api/locations/:user/:date', self.routes['returnLocationsByUserByDate']);

  // Logic to open a database connection. We are going to call this outside of app so it is available to all our functions inside.
  self.connectDb = function(callback){
    self.db.open(function(err, db){
      if(err){ throw err };
	  
	  console.log('Database connected');
      self.db.authenticate(self.dbUser, self.dbPass, function(err, res){
        if(err){ console.log("Marcos"); throw err };
		
		console.log('Authentication succeed!!');
        callback();
      });
    });
  };
  
  //starting the nodejs server with express
  self.startServer = function(){
    self.app.listen(self.port, self.ipaddr, function(){
      console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddr || "localhost", self.port);
    });
  }

  // Destructors
  self.terminator = function(sig) {
    if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...', Date(Date.now()), sig);
      process.exit(1);
    };
    console.log('%s: Node server stopped.', Date(Date.now()) );
  };

  process.on('exit', function() { self.terminator(); });

  self.terminatorSetup = function(element, index, array) {
    process.on(element, function() { self.terminator(element); });
  };

  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'].forEach(self.terminatorSetup);

};

//make a new express app
var app = new App();

//call the connectDb function and pass in the start server command
app.connectDb(app.startServer);
