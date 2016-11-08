var express = require("express");
var MongoClient = require("mongodb").MongoClient, assert = require("assert");
var url = "mongodb://localhost:27017/waifus";
var bodyParser = require("body-parser");
var app = express();


MongoClient.connect(url, function (err, db) {
	assert.equal(null, err);
	console.log("Connection succesful!");
	db.close();
});

app.use(bodyParser.json());

app.use(express.static("public"));
/*
var waifus = [
		["Satsuki Kiryuin", "Satsuki Kiryuin"],
		["Maki Nishikino", "https://myanimelist.cdn-dena.com/images/characters/9/196139.jpg"],
		["Papi", "https://pbs.twimg.com/profile_images/646956793650765824/imehwa-j.png"],
		["Misaki Nakahara", "http://statici.behindthevoiceactors.com/behindthevoiceactors/_img/chars/misaki-nakahara-welcome-to-the-nhk-37.2.jpg"],
		["Chika Takami", "http://statici.behindthevoiceactors.com/behindthevoiceactors/_img/chars/chika-takami--98.7.jpg"]
	];

	db.waifus.insert({name: "Maki Nishikino", imageAddress: "https://myanimelist.cdn-dena.com/images/characters/9/196139.jpg"});
*/
app.get("/waifus", function (req, res, next) {
	MongoClient.connect(url, function (err, db) {
		assert.equal(null, err);
		console.log("Connection succesful inside app.get!");
		var waifuCollection = db.collection('waifus');
		var numberOfWaifus = waifuCollection.count();
		waifuCollection.find({}).toArray(function (err, waifus) {
    		assert.equal(err, null);
    		console.log("numberOfWaifus = " + numberOfWaifus);
    		console.log("Found the following waifus");
    		console.log("waifus: " + waifus[1].name);
    		for (var i = 0; i < numberOfWaifus; i++) {
    			console.log(waifus[i].name + " ")
    		}
    		res.json(waifus);
    		db.close();
  		});
	});
	//res.send(waifus);
});

app.post("/waifus", function (req, res, next) {
	/*
	waifus.push([req.body.newWaifuName, req.body.newWaifuPic]);
	res.send();
	*/
	MongoClient.connect(url, function(err, db) {
  		assert.equal(null, err);
  		postWaifu (db, req.body.newWaifuName, req.body.newWaifuPic, function() {
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
    		console.log("Inserted a waifu into the waifus collection.");
    		callback();
  		}
  	);
}