//requiring modules
var express = require('express'),
    entry = require('./routes/entries'),
    http= require('http');
 
 //creating app
var app = express();
 

app.configure(function () {

    app.set('views', __dirname + '/views');
    // view engine setup
	//app.set('view engine', 'jade');

    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'ejs');
   
    //middleware,when server rcvs request from client
    //it doesnt pass directly to trout function,it lets bodyParse parse body so 
    //we can actually use body when we get to specific callback route function
	app.use(express.bodyParser()); // used to parse JSON object given in the request body
    
    //important to use it after body parser!!!! 
    //(first we need parsed body bfr we apply f-ions)

    //method override is neccessary bcs browsers actually cant make put or delete just
    //post and get so we can do _method to do put delete 
	app.use(express.methodOverride());

    //to make sure our routes get called bfr static folder gets searched
    //search our list of routes and match the right one bfr you drop request down to static folder
 	//for eq counting no.of downloads
    app.use(app.router);

    //static folder for stylesheets, images etc.
	app.use(express.static(__dirname + '/public'));
});
 


 //creating routes and assigning corresponding functions to them
 //(that we defined in  entries module)
app.get('/', entry.index);
app.get('/oauth2callback', entry.index);
app.get('/entries', entry.findAll);
app.get('/entries/:id', entry.findById);
app.get('/entries/find/:name', entry.findByAny);
app.post('/entries', entry.addEntry);
app.put('/entries/:id', entry.updateEntry);
app.delete('/entries/:id', entry.deleteEntry);
 
//creating server
http.createServer(app).listen(3000),function(){
    console.log('Listening on port 3000...');
 }