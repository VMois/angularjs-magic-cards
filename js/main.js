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

mcardsApp.directive('card', ['$document', function($document) {
    return {
      templateUrl: 'card.html',
      link: function(scope, element, attr) {
        var startX = 0, startY = 0; 
        // default start x and y
        var x = 200;
        var y = 200;
        element.on('mousedown', function(event) {
          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });
  
        function mousemove(event) {
          var testX = event.pageX - x;
          var testY = event.pageY - y;
          if (testX < 0 || testY < 0) {
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
            return;
          }
          y = event.pageY - startY;
          x = event.pageX - startX;
          element.css({
            top: y + 'px',
            left: x + 'px'
          });
        }
  
        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }

        scope.deleteThisCard = function () {
            // TODO: Add database call to delete
            element.remove();
        }
      }
    };
  }]);

mcardsApp.controller('tableController', function($routeParams, $scope, $http, tableApi, $compile) {
    const tableName = $routeParams.tableName;
    const rootTable = angular.element(document.getElementById('rootTable'));

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
    });

    $scope.addNewCard = function() {
        // TODO: Add database call to create new card
        var newCard = $compile("<div card class='base_card'></div>")( $scope );
        rootTable.append(newCard);
    }
});