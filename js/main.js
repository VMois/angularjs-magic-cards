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

mcardsApp.service('cardsHelper', function($compile) {
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
    this.updateZindex = function (list) {
        for (var i = 0; i < list.length; i++) {
            var cardObject = list[i];
            cardObject.el.css({
                zIndex: i
            });
        }
    };

    /**
     * Restore cards from database on board
     * @param {array} cards 
     */
    this.restoreCards = function(cards, scope) {
        const rootTable = angular.element(document.getElementById('rootTable'));
        const cardsList = [];
        cards.forEach(function(card) {
            var restoredCard = $compile("<div card class='base_card'></div>")( scope );
            restoredCard.attr('data-uid', card.id);
            restoredCard.css({
                width: card.width + 'px',
                height: card.height + 'px'
            });
            restoredCard.css({
                top: card.y + 'px',
                left: card.x + 'px'
            });
            rootTable.append(restoredCard);
            restoredCard.text(card.text);
            var newObj = {
                el: restoredCard
            };
            cardsList.push(newObj);
        });
        return cardsList;
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
                const res = {
                    exists: response.data.num_rows !== 0,
                    data: response.data
                }
                resolve(res);
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
                var data = response.data;
                resolve(data);
            }, function(response) {
                reject();
            });
        });
    }
});

mcardsApp.directive('edit', ['$document', function($document) {
    return {
      templateUrl: 'edit.html',
      scope: {
          details: '='
      },
      link: function(scope, element, attr) {
        scope.save = function () {
            scope.$parent.editCardEnd(scope.text, scope.el);
        };

        scope.cancel = function () {
            scope.$parent.editCardEnd();
        };

        scope.$watch("details", function(newValue, oldValue) {
            if (newValue) {
                scope.el = newValue.el;
                scope.text = newValue.text;
            }
        });
      }
    }
}]);

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
        var x = element[0].offsetLeft;
        var y = element[0].offsetTop;
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

        scope.editCard = function () {
            // TODO: Find a better way to get text from card
            const text = element.find("div").text();
            scope.$parent.editCard(text, element);
        };

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
    var cardsList = [];

    // set default background image
    viewPreferences.setTableBackground(mainSettings.defaultBackgroundImage);

    // default values for table statistics
    $scope.table = {
        count: 0,
        onboard: 0
    };

    $scope.isEdit = false;

    tableApi.checkIfExists(tableName)
    .then(function (res) {
        const data = res.data;
        if (!res.exists) {
            tableApi.createTable(tableName)
            .then((createData) => {
                if (createData) {
                    $scope.$apply(function () {
                        $scope.table = createData;
                        cardsList = cardsHelper.restoreCards(createData.cards, $scope);
                    });
                }
            })
            .catch(() => {
                console.log("[!] Error - table create");
            })
        } else {
            if (data) {
                $scope.$apply(function () {
                    $scope.table = data;
                    cardsList = cardsHelper.restoreCards(data.cards, $scope);
                });
            }
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
        cardsList.push(newCardObject);
        rootTable.append(newCard);
        cardsHelper.updateZindex(cardsList);
    }

    $scope.setCardFocus = function(element) {
        cardsList.forEach(function(elObj) {
            elObj.el.removeClass('active-card');
        });

        const deleteId = cardsHelper.findListIdByUniqueID(element.attr('data-uid'), cardsList);

        element.addClass('active-card');

        cardsList.push(cardsList[deleteId]);
        cardsList.splice(deleteId, 1);

        cardsHelper.updateZindex(cardsList);
    };

    $scope.deleteCardFromList = function(element) {
        const deleteId = cardsHelper.findListIdByUniqueID(element.attr('data-uid'), cardsList);
        cardsList.splice(deleteId, 1);
        cardsHelper.updateZindex(cardsList);
    };

    $scope.editCard = function (text, element) {
        $scope.editDetails = { 
            text: text,
            el: element
        };
        $scope.isEdit = true;
    };

    $scope.editCardEnd = function(text, element) {
        // TODO: Write new data to database
        $scope.isEdit = false;
        if (element) {
            element.find("div").text(text);
        }
    }
});