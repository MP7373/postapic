var express = require("express");
var MongoClient = require("mongodb").MongoClient, assert = require("assert");
var url = "mongodb://localhost:27017/waifus";
var bodyParser = require("body-parser");
var app = express();
ObjectId = require('mongodb').ObjectID;

MongoClient.connect(url, function (err, db) {
	assert.equal(null, err);
	console.log("Connection succesful!");
	db.close();
});

app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/waifus", function (req, res, next) {
	MongoClient.connect(url, function (err, db) {
		assert.equal(null, err);
		var waifuCollection = db.collection('waifus');
		waifuCollection.find({}).toArray(function (err, waifus) {
    		assert.equal(err, null);
    		res.json(waifus);
    		db.close();
  		});
	});
});

app.post("/waifus", function (req, res, next) {
	MongoClient.connect(url, function(err, db) {
  		assert.equal(null, err);
  		postWaifu (db, req.body.newWaifuName, req.body.newWaifuPic, function() {
      		db.close();
  		});
	});
});

app.put("/waifus/delete", function (req, res, next) {
	MongoClient.connect(url, function(err, db) {
  		assert.equal(null, err);
  		deleteWaifu (db, req.body.waifuToDeleteId, function() {
      		db.close();
  		});
	});
});

app.listen(3000, function () {
	console.log("App listening on port 3000.");
});

var postWaifu = function (db, name, imageAddress, callback) {
	db.collection('waifus').insertOne(
		{"name" : name, "imageAddress" : imageAddress},
		function(err, result) {
    		assert.equal(err, null);
    		console.log("Inserted waifu into the waifus collection.");
    		callback();
  		}
  	);
}

var deleteWaifu = function (db, id, callback) {
	var idObject = ObjectId(id);
	db.collection('waifus').deleteOne(
		{"_id" : idObject},
		function(err, result) {
    		assert.equal(err, null);
    		console.log("Removed waifu from collection.");
    		callback();
  		}
    );
}