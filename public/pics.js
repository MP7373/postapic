//initialize app
var app = angular.module("postapic", ["ngRoute", "ngCookies"]);

//maps proper html files and controllers to different routes
app.config(function ($routeProvider, $locationProvider) {
	$routeProvider
	.when("/", {
		templateUrl: "picFeed.html",
		controller: "picFeedController"
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
});

//controller for the home page that includes the main feed of pics
app.controller("picFeedController", function ($rootScope, $scope, $http, $cookies, $location, $anchorScroll) {

	//loads feed with data upon first opening the page
	updatePicFeed();

	//signs user into account
	$scope.signIn = function () {
		$http.put("/userAccounts/signIn", {username: $scope.username, password: $scope.password}).then(function (response) {
			$cookies.put("token", response.data.token);
			$cookies.put("currentUser", $scope.username);
			$rootScope.currentUser = $scope.username;
			$rootScope.token = response.data.token;
			$scope.failedAttempt = null;
			updatePicFeed();
		}, function (err) {
			$scope.username = "";
			$scope.password = "";
			$scope.failedAttempt = true;
			updatePicFeed();
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
		updatePicFeed();
	}

	//sends new pic to database
	$scope.submitPic = function () {
		$http.put("/pics",
			{newPicName: $scope.newPicName, newPic: $scope.newPic},
			{headers: {
				"authorization": $rootScope.token
			}}
		).then(function () {
			$scope.newPicName = "";
			$scope.newPic = "";
			updatePicFeed();
		},
		function () {
			$scope.newPicName = "";
			$scope.newPic = "";
			updatePicFeed();
		});
	}
	
	//deletes pic from database
	$scope.deletePic = function (pic) {
		$http.put("/pics/delete", {picToDeleteId: pic._id}).then(function () {
			updatePicFeed();
		},
		function () {
			updatePicFeed();
		});
	}

	//calls for each element in pic feed and will show a delete button for every pic in feed
	//that was uploaded by the currently logged in user
	$scope.showButton = function (pic) {
		var currentUsername = $cookies.get("currentUser");
		if (currentUsername === pic.accountUsername) {
			return true;
		}
		return false;
	}

	//returns to top of page
	$scope.goToTop = function () {
		$location.hash("pageTop");
		$anchorScroll();
	}

	//calls to update feed when page is loaded or database is changed
	function updatePicFeed () {
		$http.get("/pics").then(function (res) {
			$rootScope.pics = res.data;
		});
	}
});

//controller for sign up for new account page
app.controller("signUpController", function ($scope, $http) {

	//sends new account to database
	$scope.submitNewUserAccount = function () {
		$http.put("/userAccounts", {username: $scope.newUsername, password: $scope.newPassword}).then(function (res) {
			if (res.data === true) {
				$scope.newAccountCreated = true;
				$scope.accountAlreadyExists = false;
			} else {
				$scope.accountAlreadyExists = true;
				$scope.newAccountCreated = false;
			}
			$scope.newUsername = "";
			$scope.newPassword = "";
		});
	}
});