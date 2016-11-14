var express = require("express");
var MongoClient = require("mongodb").MongoClient, assert = require("assert");
//var url = "mongodb://localhost:27017/waifus";
//var url = process.env.MONGOLAB_URI;
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var app = express();
var jwt = require("jwt-simple");
var JWT_SECRET = "SatsukiKiryuinBestWaifu";
app.use(bodyParser.json());
app.use(express.static("public"));
ObjectId = require("mongodb").ObjectID;

//Check Mongodb connection
MongoClient.connect(process.env.MONGOLAB_URI, function (err, db) {
	assert.equal(null, err);
	console.log("Connection succesful!");
	db.close();
});



//Get waifus data from database
app.get("/waifus", function (req, res) {
	MongoClient.connect(process.env.MONGOLAB_URI, function (err, db) {
		assert.equal(null, err);
		var waifuCollection = db.collection("waifus");
		waifuCollection.find({}).toArray(function (err, waifus) {
    		assert.equal(err, null);
    		res.json(waifus);
    		db.close();
  		});
	});
});

//calls postWaifu function to add a new waifu to database
app.put("/waifus", function (req, res) {
  var token = req.headers.authorization;
  var decodedToken = jwt.decode(token, JWT_SECRET);
  var newWaifu = {
    name: req.body.newWaifuName,
    imageAddress: req.body.newWaifuPic,
    accountUsername: decodedToken.username,
    accountId: decodedToken._id
  };
	MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
  		assert.equal(null, err);
  		postWaifu(db, newWaifu, function() {
      		db.close();
          res.send(true);
  		});
	});
});

//calls deleteWaifu function to delete a waifu from database
app.put("/waifus/delete", function (req, res) {
	MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
  		assert.equal(null, err);
  		deleteWaifu(db, req.body.waifuToDeleteId, function() {
      		db.close();
          res.send(true);
  		});
	});
});

//calls submitNewAccount function to add a new user account to database
app.put("/userAccounts", function (req, res) {
  MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      assert.equal(null, err);
      submitNewAccount(db, req.body.username, req.body.password, function(success) {
          db.close();
          res.send(success);
      });
  });
});

//checks if inputted username and pasword are in database and if they are logs into that account
app.put("/userAccounts/signIn", function (req, res) {
  MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      assert.equal(null, err);
      userSignIn(db, req.body.username, req.body.password, 
        function (validUserAccount) {
          console.log("Valid account, returning token.");
          db.close();
          var token = jwt.encode(validUserAccount, JWT_SECRET);
          return res.json({token: token});
        },
        function () {
          console.log("Invalid account, returning error.");
          db.close();
          return res.status(400).send();
        }
      );
  });
});

//Gives port for app to listen on
app.listen(process.env.PORT, function () {
	console.log("App listening on port 3000.");
});

//function that posts new waifu into database
var postWaifu = function (db, newWaifu, callback) {
  console.log(newWaifu);
  if (typeof newWaifu.name === "string") {
  	db.collection("waifus").insertOne(
  		newWaifu,
  		function (err, result) {
      		assert.equal(err, null);
      		console.log("Inserted " + newWaifu.name + " into the waifus collection.");
      		callback();
    	}
    );
  } else {
    console.log("Name or image link invalid no waifu added.");
    callback();
  }
}

//function that deletes a selected waifu from the database
var deleteWaifu = function (db, id, callback) {
	var idObject = ObjectId(id);
	db.collection("waifus").deleteOne(
		{"_id" : idObject},
		function(err, deletedWaifu) {
    		assert.equal(err, null);
    		console.log("Removed waifu from collection.");
    		callback();
  		}
    );
}

//function that submits a new user account to the database
var submitNewAccount = function (db, username, password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      db.collection("userAccounts").findOne(
        {username: username},
        function (err, selectedAccount) {
          if (selectedAccount === null) {
            db.collection("userAccounts").insertOne(
              {"username" : username, "password" : hash},
              function (err, submittedAccount) {
                assert.equal(err, null);
                console.log("Added new user account " + username + " into the userAccounts collection.");
                callback(true);
              }
            );
          } else {
            console.log("Account with the username " + username + " already exits no new account created.");
            callback(false);
          }
        }
      );
    });
  });
}

//function that checks users entered credentials are valid and if they are signs user in
var userSignIn = function (db, username, password, validCallback, invalidCallback) {
  db.collection("userAccounts").findOne(
    {username: username},
    function (err, selectedAccount) {
      console.log("About to run bcrypt.compare");
      console.log("password = " + password);
      if(selectedAccount !== null) {
        bcrypt.compare(password, selectedAccount.password, function (err, result) {
          if (result) {
            //console.log{"Account valid logged in."};
            validCallback(selectedAccount);
          } else {
            console.log("selectedAccount evaluates to not null so the username exists but the input password doesn't match");
            invalidCallback();
          }
        });
      } else {
        console.log("selectedAccount evaluates to null so the input username is not in the database.")
        invalidCallback();
      }
    }
  );
}