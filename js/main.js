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

mcardsApp.service('tableApi', function($http) {
    /**
    * Check if table exists.
    * @param {string} tableName - The name of the table.
    */
    this.checkIfExists = function (tableName) {
        return new Promise(function (resolve, reject) {
            $http.get(mainSettings.rootApiPath + "tables/", {
                params: {
                    name: tableName
                }
            }).then(function(response) {
                const data = response.data;
                resolve(data.num_rows !== 0, data);
            }, function(response) {
                reject();
            });
        });
    }

    /**
    * Create new table with the given name.
    * @param {string} tableName - The name of the table.
    */
    this.createTable = function (tableName) {
        const payload = "name=" + tableName;
        return new Promise(function (resolve, reject) {
            $http.post(mainSettings.rootApiPath + "tables/", payload, {
                // change default content-type from json to x-www-form
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                const data = response.data;
                resolve(data);
            }, function(response) {
                reject();
            });
        });
    }
});

mcardsApp.controller('tableController', function($routeParams, $scope, $http, tableApi) {
    const tableName = $routeParams.tableName;
    tableApi.checkIfExists(tableName)
    .then(function (exists, data) {
        if (!exists) {
            tableApi.createTable(tableName)
            .then((createData) => {
                $scope.table = createData;
            })
            .catch(() => {
                console.log("[!] Error - table create");
            })
        } else {
            $scope.table = data;
        }
    })
    .catch(function () {
        console.log("[!] Error - check table");
    })
});