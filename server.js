var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());

app.use(express.static("public"));

var waifus = [
		["Satsuki Kiryuin", "http://vignette2.wikia.nocookie.net/kill-la-kill/images/f/f0/Op_satsuki.jpg/revision/latest?cb=20131214014248"],
		["Maki Nishikino", "https://myanimelist.cdn-dena.com/images/characters/9/196139.jpg"],
		["Papi", "https://pbs.twimg.com/profile_images/646956793650765824/imehwa-j.png"],
		["Misaki Nakahara", "http://statici.behindthevoiceactors.com/behindthevoiceactors/_img/chars/misaki-nakahara-welcome-to-the-nhk-37.2.jpg"],
		["Chika Takami", "http://statici.behindthevoiceactors.com/behindthevoiceactors/_img/chars/chika-takami--98.7.jpg"]
	];

app.get("/waifus", function (req, res, next) {
	res.send(waifus);
});

app.post("/waifus", function (req, res, next) {
	waifus.push([req.body.newWaifuName, req.body.newWaifuPic]);
	res.send();
});

app.listen(3000, function () {
	console.log("App listening on port 3000.");
});