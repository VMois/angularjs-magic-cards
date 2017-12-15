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

mcardsApp.service('viewPreferences', function() {
    this.setTableBackground = function(pathToStaticFile) {
        document.documentElement.style.setProperty("background-image", "url('" + pathToStaticFile + "')");
        document.documentElement.style.setProperty("background-size", "cover");
    };
});

mcardsApp.service('cardsHelper', function() {
    /**
    * Generate UniqueID as string.
    */
    this.generateUniqueId = function() {
        return "_" + Math.random().toString(36).substr(2, 9);
    };

    /**
    * Find Id of element in given list by Unique ID.
    * @param {string} uid - Unique ID of element to find.
    * @param {array} list - List of objects (object -> with el property, as angular element)
    */
    this.findListIdByUniqueID = function (uid, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].el.attr('data-uid') === uid) {
                return i;
            }
        }
    };

    /**
    * Check if table exists.
    * @param {string} tableName - The name of the table.
    */
    this.updateZindex = function (startId, list) {
        for (var i = startId; i < list.length; i++) {
            var cardObject = list[i];
            cardObject.el.css({
                zIndex: i
            });
        }
    };

    this.deleteCardFromList = function (uid, list) {

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
      scope: {},
      link: function(scope, element, attr) {
        var startX = 0, startY = 0; 
        var startResizeX = 0, startResizeY = 0;

        var cardWidth = element[0].clientWidth;
        var cardHeight = element[0].clientHeight;

        // default start x and y
        var x = 200;
        var y = 200;
        element.on('mousedown', function(event) {
          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
          scope.$parent.setCardFocus(element);
        });
  
        function mousemove(event) {
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

        scope.deleteThisCard = function (ev) {
            // TODO: Add database call to delete
            ev.path[1].remove();
            scope.$parent.deleteCardFromList(element);
        }
        scope.resizeMouseDown = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            startResizeX = ev.pageX;
            startResizeY = ev.pageY;
            $document.on('mousemove', resizeMouseMove);
            $document.on('mouseup', resizeMouseUp);
            scope.$parent.setCardFocus(element);
        };
        function resizeMouseMove(ev) {
            var currentX = ev.pageX;
            var currentY = ev.pageY;
            var xResize = currentX - startResizeX;
            var yResize = currentY - startResizeY;

            startResizeX = currentX;
            startResizeY = currentY;

            cardWidth += xResize;
            cardHeight += yResize;
            element.css({
                width: cardWidth + 'px',
                height: cardHeight + 'px'
            });
        };
        function resizeMouseUp(ev) {
            // TODO: Write size of the card to database
            // Check if size is changed and after that send data to server
            $document.off('mousemove', resizeMouseMove);
            $document.off('mouseup', resizeMouseUp);
        };
      }
    };
  }]);

mcardsApp.controller('tableController', function($routeParams, $scope, $http, tableApi, $compile, viewPreferences, cardsHelper) {
    const tableName = $routeParams.tableName;
    const rootTable = angular.element(document.getElementById('rootTable'));
    const cardsList = [];

    // set default background image
    viewPreferences.setTableBackground(mainSettings.defaultBackgroundImage);

    // default values for table statistics
    $scope.all_cards_count = 0;
    $scope.current_cards_count = 0;

    tableApi.checkIfExists(tableName)
    .then(function (exists, data) {
        if (!exists) {
            tableApi.createTable(tableName)
            .then((createData) => {
                $scope.table = createData;
                $scope.all_cards_count = createData.count;
                $scope.current_cards_count = createData.onboard;
            })
            .catch(() => {
                console.log("[!] Error - table create");
            })
        } else {
            $scope.table = data;
            $scope.all_cards_count = data.count;
            $scope.current_cards_count = data.onboard;
        }
    })
    .catch(function () {
        console.log("[!] Error - check table");
    });

    $scope.addNewCard = function() {
        // TODO: Add database call to create new card
        var newCardObject = {};

        var newCard = $compile("<div card class='base_card'></div>")( $scope );

        newCardObject.el = newCard;
        newCardObject.el.attr('data-uid', cardsHelper.generateUniqueId());
        newCardObject.el.css({
            zIndex: cardsList.length
        });
        cardsList.push(newCardObject);
        rootTable.append(newCard);
    }

    $scope.setCardFocus = function(element) {
        const deleteId = cardsHelper.findListIdByUniqueID(element.attr('data-uid'), cardsList);

        cardsList.push(cardsList[deleteId]);
        cardsList.splice(deleteId, 1);

        cardsHelper.updateZindex(deleteId, cardsList);
    };

    $scope.deleteCardFromList = function(element) {
        const deleteId = cardsHelper.findListIdByUniqueID(element.attr('data-uid'), cardsList);
        cardsList.splice(deleteId, 1);
        cardsHelper.updateZindex(deleteId, cardsList);
    };
});