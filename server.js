// server.js
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var mongodb = require('mongodb');
var MONGODB_URI = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
res.render('home', {pageData: {name : ['', '']}});
});

app.get('/*', function(req, res){
  var _sUrl = req.url;
  var sUrl = _sUrl.substring(1);
  var url='';
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(MONGODB_URI, function(err, db) {
  assert.equal(null, err);
  var query = {code: sUrl};
  db.collection("shorturl").find(query).toArray(function(err, result) {  
    if (err) throw err;
    if (result != ''){
      url = result[0].url;
      db.close(); 
      res.redirect(url);
    } else {db.close();
       res.render('home', {pageData: {name : ['', '']}});
    }    
  });});

  });

app.post('/', function(req, res) {  
 var url = req.body.url;
 url = url.trim();
 var sUrl = '';
 var validUrl = require('valid-url');  
 if (validUrl.isUri(url) && url != ''){
     var MongoClient = require('mongodb').MongoClient;    
     MongoClient.connect(MONGODB_URI, function(err, db) {
      assert.equal(null, err);
      var query = {url: url};
      db.collection(process.env.COLLECTION1).find(query).toArray(function(err, result) {
      if (err) throw err;
      if (result == ''){
        var time = Date.now();
        sUrl = time.toString(36);
	      db.collection(process.env.COLLECTION1).insertOne({  
        "code":sUrl,
        "url":url ,
        "date" : time},                         
         function(err, result) {assert.equal(err, null);
         }                         );
         db.close();        
      }
        else
         { sUrl = result[0].code ;   
        db.close();}
        res.render('home', {pageData: {name : [url, 'https://silly-flower.glitch.me/' + sUrl]}});   
    });
   });     
	  }
	  else	  
	  { 
     res.render('home', {pageData: {name : ['Not Valid url', '']}});}
});	  

var listener = app.listen(process.env.PORT);