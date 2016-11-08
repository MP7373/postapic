var app = angular.module("waifus", []);

app.controller("waifusController", function ($scope, $http) {
	$http.get("/waifus").then(function(response) {
		$scope.waifus = response.data;
	})

	$scope.submitWaifu = function () {
		$http.post("/waifus", {newWaifuName: $scope.newWaifuName, newWaifuPic: $scope.newWaifuPic});
	};
});