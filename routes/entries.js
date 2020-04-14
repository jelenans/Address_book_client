// using the native Node.js driver to access MongoDB 
var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

 //defining server and database
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('entriesdb', server);
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'entries' database");
        db.collection('entries', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'entries' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

//defining functions and exporting them so that we can use them in other files
 

 //finding contact by id 
 //(eq of calling this function: http://localhost:3000/entries/54426b745bf85bb818cc0967)
exports.findById = function(req, res, next) {
    // if (req.params.id) {
     
    var id = req.params.id;
    console.log('findById: ' + id);
    console.log('Retrieving entry: ' + id);
    db.collection('entries', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
    // }
    // else
    // {
    //      next(); // pass control to the next route handler
    // }
};

exports.index = function(req, res) {
  res.render('index.html');
};

 //finding contact by any string, 
 //checking if it matches name, surname or phone number 
exports.findByAny = function(req, res, next) {
    // if (!req.params.name ) {
    //     next(); // pass control to the next route handler
    // }
    // else
    // {

    var name = req.params.name;
     console.log('Retrieving entry: ' + name);
    

    db.collection('entries', function(err, collection) {
            collection.find({
                $or: [{'name':name},{'surname':name},{'phone':name},{'email':name}]}).toArray(function(err, item) {
            res.send(item);
        });
    });
    // }
};

 //listing all available contacts
exports.findAll = function(req, res) {
    db.collection('entries', function(err, collection) {
        collection.find().toArray(function(err, items) {
           res.send(items);
          //res.render('index',{contacts: items});
          //res.sendfile('./public/index.html', {contacts: items});
        });
    });
};
 

 //adding, updating and deleting a contact 

 exports.addEntry = function(req, res) {
    var entry = req.body;
    console.log('Adding entry: ' + JSON.stringify(entry));
    db.collection('entries', function(err, collection) {
        collection.insert(entry, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}
 
exports.updateEntry = function(req, res) {
    var id = req.params.id;
    var entry = req.body;
    console.log('Updating entry: ' + id);
    console.log(JSON.stringify(entry));
    db.collection('entries', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, entry, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating entry: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(entry);
            }
        });
    });
}
 
exports.deleteEntry = function(req, res) {
    var id = req.params.id;
    console.log('Deleting entry: ' + id);
    db.collection('entries', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}
 
// Populate database with sample data 
//-- Only once: the first time the application is started.
var populateDB = function() {
 
    var entries = [
    {
        name: "John",
        surname: "Smith",
        email: "john.smith@gmail.com",
        phone: "066227635"
    },
    {
        name: "Carmen",
        surname: "Doag",
        email: "carmen_doag@hotmail.com",
        phone: "098234777"
    }];
 
    	db.collection('entries', function(err, collection) {
        collection.insert(entries, {safe:true}, function(err, result) {});
    });
 
};
