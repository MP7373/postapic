var app = angular.module("waifus", []);

app.controller("waifusController", function ($scope, $http) {
	updateWaifusFeed();

	$scope.submitWaifu = function () {
		$http.post("/waifus", {newWaifuName: $scope.newWaifuName, newWaifuPic: $scope.newWaifuPic});
		$scope.newWaifuName = "";
		$scope.newWaifuPic = "";
		updateWaifusFeed();
	}
	
	$scope.deleteWaifu = function (waifu) {
		$http.put("/waifus/delete", {waifuToDeleteId: waifu._id});
		updateWaifusFeed();
	}

	function updateWaifusFeed () {
		$http.get("/waifus").then(function(response) {
			$scope.waifus = response.data;
		});
	}
});