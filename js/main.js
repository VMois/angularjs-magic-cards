const mcardsApp = angular.module("mcardsApp", ["ngRoute"]);
mcardsApp.run();
mcardsApp.config(function($routeProvider) {
    $routeProvider.
    when("/", {
        templateUrl: "main.html",
        controller: "mainController"
    })
    .when("/table/:tableName", {
        templateUrl: "table.html",
        controller: "tableController"
    })
    .otherwise("/");
});

mcardsApp.controller('mainController', function($scope, $location) {
    $scope.chooseTable = function() {
        $location.path("/table/" + $scope.tableName);
    }
});

mcardsApp.controller('tableController', function($routeParams, $scope, $http) {
    const tableName = $routeParams.tableName;
    $http.get(mainSettings.rootApiPath + "tables/", {
        params: {
            name: tableName
        }
    })
    .then(function(response){
        var data = response.data;
        if (data.num_rows === 0) {
            var payload = "name=" + tableName;
            $http.post(mainSettings.rootApiPath + "tables/", payload, {
                // change default content-type from json to x-www-form
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(response){
                $scope.table = response.data;
            });
        } else {
            $scope.table = data;
        }
    });
});