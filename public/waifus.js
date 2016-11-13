//initialize app
var app = angular.module("waifus", ["ngRoute", "ngCookies"]);

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

//checks if user has a login cookie and logs them in if they do
app.run(function ($rootScope, $cookies) {
	if ($cookies.get("token") && $cookies.get("currentUser")) {
		$rootScope.token = $cookies.get("token");
		$rootScope.currentUser = $cookies.get("currentUser");
	};
	console.log($cookies.get("currentUser"));
});

//controller for the home page that includes the main feed of waifus
app.controller("waifuFeedController", function ($rootScope, $scope, $http, $cookies) {

	//loads feed with data upon first opening the page
	updateWaifusFeed();

	//signs user into account
	$scope.signIn = function () {
		$http.put("/userAccounts/signIn", {username: $scope.username, password: $scope.password}).then(function (response) {
			$cookies.put("token", response.data.token);
			$cookies.put("currentUser", $scope.username);
			$rootScope.currentUser = $scope.username;
			$rootScope.token = response.data.token;
			$scope.failedAttempt = null;
			updateWaifusFeed();
		}, function (err) {
			$scope.username = "";
			$scope.password = "";
			$scope.failedAttempt = true;
			updateWaifusFeed();
		});
	}

	//logs user out and removes related cookies
	$scope.logout = function () {
		$cookies.remove("token");
		$cookies.remove("currentUser");
		$rootScope.token = null;
		$rootScope.currentUser = "";
		$scope.username = "";
		$scope.password = "";
		updateWaifusFeed();
	}

	//sends new waifu to database
	$scope.submitWaifu = function () {
		$http.post("/waifus",
			{newWaifuName: $scope.newWaifuName, newWaifuPic: $scope.newWaifuPic},
			{headers: {
				"authorization": $rootScope.token
			}}
			).then(function () {
			$scope.newWaifuName = "";
			$scope.newWaifuPic = "";
			updateWaifusFeed();
		});
		$scope.newWaifuName = "";
		$scope.newWaifuPic = "";
		updateWaifusFeed();
	}
	
	//deletes waifu from database
	$scope.deleteWaifu = function (waifu) {
		$http.put("/waifus/delete", {waifuToDeleteId: waifu._id}).then(function () {
			updateWaifusFeed();
		});
		updateWaifusFeed();
	}

	//calls for each element in waifus feed and will show a delete button for every waifu in feed
	//that was uploaded by the currently logged in user
	$scope.showButton = function (waifu) {
		var currentUsername = $cookies.get("currentUser");
		if (currentUsername === waifu.accountUsername) {
			return true;
		}
		return false;
	}

	//calls to update feed when page is loaded or database is changed
	function updateWaifusFeed () {
		$http.get("/waifus").then(function (response) {
			console.log($cookies.get("currentUser"));
			$scope.waifus = response.data;
		});
	}
});

//controller for sign up for new account page
app.controller("signUpController", function ($scope, $http) {

	//sends new account to database
	$scope.submitNewUserAccount = function () {
		$http.post("/userAccounts", {username: $scope.newUsername, password: $scope.newPassword}).then(function () {
			$scope.newAccountCreated = true;
			$scope.newUsername = "";
			$scope.newPassword = "";
		});
	}
});