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
    });
});