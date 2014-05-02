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
  
  //self.ipaddr  = process.env.OPENSHIFT_NODEJS_IP;
  self.port    = parseInt(process.env.PORT) || 8080;

  // Web app logic
  self.routes = {};
  self.routes['health'] = function(req, res){ res.send('1'); };
  
  /*
  //returns all the parks in the collection
  self.routes['returnAllParks'] = function(req, res){
    self.db.collection(selft.collectionName).find().toArray(function(err, names) {
        res.header("Content-Type:","application/json");
        res.end(JSON.stringify(names));
    });
  };

  //find a single park by passing in the objectID to the URL
  self.routes['returnAPark'] = function(req, res){
      var BSON = mongodb.BSONPure;
      var parkObjectID = new BSON.ObjectID(req.params.id);
      self.db.collection(selft.collectionName).find({'_id':parkObjectID}).toArray(function(err, names){
              res.header("Content-Type:","application/json");
              res.end(JSON.stringify(names));
      });
  };

  //find parks near a certain lat and lon passed in as query parameters (near?lat=45.5&lon=-82)
  self.routes['returnParkNear'] = function(req, res){
      //in production you would do some sanity checks on these values before parsing and handle the error if they don't parse
      var lat = parseFloat(req.query.lat);
      var lon = parseFloat(req.query.lon);

      self.db.collection(selft.collectionName).find( {"pos" : {$near: [lon,lat]}}).toArray(function(err,names){
          res.header("Content-Type:","application/json");
          res.end(JSON.stringify(names));
       });
  };

  self.routes['returnParkNameNear'] = function(req, res){
      var lat = parseFloat(req.query.lat);
      var lon = parseFloat(req.query.lon);
      var name = req.params.name;
      self.db.collection(selft.collectionName).find( {"Name" : {$regex : name, $options : 'i'}, "pos" : { $near : [lon,lat]}}).toArray(function(err,names){
          res.header("Content-Type:","application/json");
          res.end(JSON.stringify(names));
      });
  };

  self.routes['postAPark'] = function(req, res){

     var name = req.body.name;
     var lat = req.body.lat;
     var lon = req.body.lon;
     console.log(req.body);

     self.db.collection(selft.collectionName).insert({'Name' : name, 'pos' : [lon,lat ]}), function(result){
         //we should have caught errors here for a real app
         res.end('success');
     };
  };
  */
  
  self.routes['returnLocations'] = function(req, res){
    self.db.collection(self.collectionName).find().toArray(function(err, names) {
        res.header("Content-Type:","application/json");
        res.end(JSON.stringify(names));
    });
  };

  self.routes['createLocation'] = function(req, res){
	 var name = req.body.name;
	 var date = req.body.date;
     var lat = req.body.lat;
     var lon = req.body.lon;
     
	 console.log(req.body);
	 
	 var element = {
		'user' : name, 
		'date': date,
		'pos' : [lon,lat ]
		};

     self.db.collection(self.collectionName).insert(element), function(result){
		   res.end('success');
     };
  
  
  }
  
  self.routes['returnLocationsByUser'] = function(req, res){
	var user = req.params.user;
  
	console.log("Searching for user: " + user);
  
	self.db.collection(self.collectionName).find({"user" : user}).toArray(function(err,names){
		res.header("Content-Type:","application/json");
		res.end(JSON.stringify(names));
	});
  };
  
  self.routes['returnLocationsByUserByDate'] = function(req, res){
    var user = req.params.user;
	var date = req.params.date;
	
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
        callback();
      });
    });
  };
  
  //starting the nodejs server with express
  self.startServer = function(){
    self.app.listen(self.port, self.ipaddr, function(){
      console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddr, self.port);
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
