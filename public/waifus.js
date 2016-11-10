//initialize app
var app = angular.module("waifus", ["ngRoute"]);

//maps proper html files and controllers to different routes
app.config(function ($routeProvider, $locationProvider) {
	$routeProvider
	.when("/", {
		templateUrl: "waifuFeed.html",
		controller: "waifuFeedController"
	})
	.when("/signup", {
		templateUrl: "signUp.html",
		controller: "signUpController"
	})
});

//controller for the home page that includes the main feed of waifus
app.controller("waifuFeedController", function ($scope, $http) {

	//loads feed with data upon first opening the page
	updateWaifusFeed();

	//signs user into account
	$scope.signIn = function () {
		$http.put("/userAccounts/signIn", {username: $scope.username, password: $scope.password}).then(function () {
			alert("signed in");
			$scope.username = "";
			$scope.password = "";
			updateWaifusFeed();
		}, function (err) {
			alert("bad username or password or both");
			$scope.username = "";
			$scope.password = "";
			updateWaifusFeed();
		});
	};

	//sends new waifu to database
	$scope.submitWaifu = function () {
		$http.post("/waifus", {newWaifuName: $scope.newWaifuName, newWaifuPic: $scope.newWaifuPic}).then(function () {
			$scope.newWaifuName = "";
			$scope.newWaifuPic = "";
			updateWaifusFeed();
		});
	}
	
	//deletes waifu from database
	$scope.deleteWaifu = function (waifu) {
		$http.put("/waifus/delete", {waifuToDeleteId: waifu._id}).then(function () {
			updateWaifusFeed();
		});
	}

	//calls to update feed when page is loaded or database is changed
	function updateWaifusFeed () {
		$http.get("/waifus").then(function (response) {
			$scope.waifus = response.data;
		});
	}
});

//controller for sign up for new account page
app.controller("signUpController", function ($scope, $http) {

	//sends new account to database
	$scope.submitNewUserAccount = function () {
		var newUserAccount = {
			username: $scope.newUsername,
			password: $scope.newPassword
		};
		$http.post("/userAccounts", newUserAccount).then(function () {
			$scope.newUsername = "";
			$scope.newPassword = "";
		});
	}
});