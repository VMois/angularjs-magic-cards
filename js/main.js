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

mcardsApp.service('cardsHelper', function($compile, $timeout) {
    /**
    * Generate UniqueID as string.
    */
    this.generateUniqueId = function() {
        return Math.random().toString(36).substr(2, 9);
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
        const sortedCards = [];
        if (cards.length === 0) {
            return cardsList;
        }
        // data structure = linked list
        // TODO: Write in more pretty way
        function findInArray(prevId, arr) {
            for (var k = 0; k < arr.length; k ++) {
                if (arr[k].prev === prevId) return arr[k];
            }
        }
        var startIndex = 0;
        var tempCard = cards[startIndex];
        sortedCards[startIndex] = tempCard;
        var tempId = tempCard.id;
        startIndex++;
        for(var i = 1; i < cards.length; i++) {
            var tempCard = findInArray(tempId, cards);
            sortedCards[startIndex] = tempCard;
            var tempId = tempCard.id;
            startIndex++;
        }
        sortedCards.forEach(function(card, index) {
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
            restoredCard.css({
                zIndex: index
            });
            $timeout(function () {
                restoredCard.find("div").html(card.text);
            }, 100);
            var newObj = {
                el: restoredCard
            };
            cardsList.push(newObj);
        });
        for (var i = 0; i < cardsList.length; i++) {
            rootTable.append(cardsList[i].el);
        }
        return cardsList;
    }
});

mcardsApp.service('cardsApi', function($http) {
    this.createCard = function(card) {
        const payload = `cardX=${card.x}&cardY=${card.y}&width=${card.width}&height=${card.height}&text=${card.text}&tableId=${card.tableId}&prevId=${card.prev}`;
        return new Promise(function (resolve, reject) {
            $http.post(mainSettings.rootApiPath + "cards/", payload, {
                // change default content-type from json to x-www-form
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                resolve(response.data);
            }, function(response) {
                reject(response);
            });
        });
    }

    this.deleteCard = function(cardId) {
        const payload = `cardId=${cardId}`;
        return new Promise(function (resolve, reject) {
            $http.post(mainSettings.rootApiPath + "cards/", payload, {
                // change default content-type from json to x-www-form
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                resolve(response);
            }, function(response) {
                reject(response);
            });
        });
    }

    this.updateCardPosition = function(cardId, x, y) {
        const payload = `cardId=${cardId}&cardX=${x}&cardY=${y}`;
        return new Promise(function (resolve, reject) {
            $http.post(mainSettings.rootApiPath + "cards/", payload, {
                // change default content-type from json to x-www-form
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                resolve(response);
            }, function(response) {
                reject(response);
            });
        });
    }

    this.updateCardSize = function(cardId, width, height) {
        const payload = `cardId=${cardId}&cardWidth=${width}&cardHeight=${height}`;
        return new Promise(function (resolve, reject) {
            $http.post(mainSettings.rootApiPath + "cards/", payload, {
                // change default content-type from json to x-www-form
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                resolve(response);
            }, function(response) {
                reject(response);
            });
        });
    }

    this.updateCardZindex = function(firstCardId, secondCardId, firstCardPrev, secondCardPrev) {
        const payload = `firstCardId=${firstCardId}&secondCardId=${secondCardId}&firstCardPrev=${firstCardPrev}&secondCardPrev=${secondCardPrev}`;
        return new Promise(function (resolve, reject) {
            $http.post(mainSettings.rootApiPath + "cards/", payload, {
                // change default content-type from json to x-www-form
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                resolve(response);
            }, function(response) {
                reject(response);
            });
        });
    }

    this.updateText = function(cardId, text) {
        const payload = `text=${text}&cardId=${cardId}`;
        return new Promise(function (resolve, reject) {
            $http.post(mainSettings.rootApiPath + "cards/", payload, {
                // change default content-type from json to x-www-form
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                resolve(response);
            }, function(response) {
                reject(response);
            });
        });
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
            var editor = angular.element(document.getElementById('editor'));
            editor = editor.find("div");
            scope.$parent.editCardEnd(editor.html(), scope.el);
        };

        scope.cancel = function () {
            scope.$parent.editCardEnd();
        };

        scope.$watch("details", function(newValue, oldValue) {
            if (newValue && scope.quill) {
                var editor = angular.element(document.getElementById('editor')).find("div");
                scope.el = newValue.el;
                scope.text = newValue.text;
                if (editor) {
                    editor.html(scope.text);
                }
            }
        });
        scope.quill = new Quill('#editor', {
            theme: 'snow'
        });
      }
    }
}]);

mcardsApp.directive('card', ['$document', 'cardsApi', '$timeout', function($document, cardsApi, $timeout) {
    return {
      templateUrl: 'card.html',
      scope: {},
      link: function(scope, element, attr) {
        var startX = 0, startY = 0, startPageX, startPageY; 
        var startResizeX = 0, startResizeY = 0;

        var cardWidth = element[0].clientWidth;
        var cardHeight = element[0].clientHeight;

        // default start x and y
        var x = element[0].offsetLeft;
        var y = element[0].offsetTop;

        // Terrible solution, I know (
        var cardId = parseInt(element.attr('data-uid'));
        if(isNaN(cardId)) {
            cardId = 0;
        };
        function run() {
            cardId = parseInt(element.attr('data-uid'));
            cardWidth = element[0].clientWidth;
            cardHeight = element[0].clientHeight;
            x = element[0].offsetLeft;
            y = element[0].offsetTop;
        }
        $timeout(run, 100);

        element.on('mousedown', function(event) {
          event.preventDefault();
          event.stopPropagation(); 
          x = element[0].offsetLeft;
          y = element[0].offsetTop;      
          startX = event.pageX - x;
          startY = event.pageY - y;
          startPageX = event.pageX;
          startPageY = event.pageY;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
          scope.$parent.setCardFocus(element);
          scope.$parent.recalculatePositions();
        });
  
        function mousemove(event) {
          y = event.pageY - startY;
          x = event.pageX - startX;
          scope.$parent.moveGroup(event.pageX - startPageX, event.pageY - startPageY);
          element.css({
            top: y + 'px',
            left: x + 'px'
          });
        }
  
        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
          cardsApi.updateCardPosition(cardId, x, y)
          .catch(function(err) {
              console.error(err);
          });
          scope.$parent.writeGroupToDataBase(cardId);
        }

        scope.deleteThisCard = function (ev) {
            scope.$parent.deleteCardFromList(element);
            ev.path[1].remove();
        }

        scope.editCard = function () {
            const text = element.find("div").html();
            scope.$parent.editCard(text, element);
        };

        scope.resizeMouseDown = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            startResizeX = ev.pageX;
            startResizeY = ev.pageY;
            scope.$parent.stopMoveGroup();
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
            cardsApi.updateCardSize(cardId, cardWidth, cardHeight)
            .catch(function(err) {
                console.error(err);
            });
        };
      }
    };
  }]);

mcardsApp.controller('tableController', function($document, $routeParams, $scope, $http, tableApi, $compile, viewPreferences, cardsHelper, cardsApi) {
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
        var prevId = 0;
        if (cardsList.length > 0) {
            prevId = parseInt(cardsList[cardsList.length - 1].el.attr('data-uid'));
        }
        
        var card = {
            width: 200,
            height: 200,
            x: 200,
            y: 200,
            text: "",
            prev: prevId,
            tableId: $scope.table.id
        };

        cardsApi.createCard(card)
        .then(function(data){
            $scope.$apply(function () {
                var newId = data.id;
                newCardObject.el = newCard;
                $scope.table.onboard += 1;
                $scope.table.count += 1;
                newCardObject.el.attr('data-uid', newId);
                cardsList.push(newCardObject);
                cardsHelper.updateZindex(cardsList);
                rootTable.append(newCardObject.el);
            });
        })
        .catch(function(err) {
            console.error(err);
            newCard.remove();
        });
    }

    $scope.setCardFocus = function(element) {
        cardsList.forEach(function(elObj) {
            elObj.el.removeClass('active-card');
        });
        const deleteId = cardsHelper.findListIdByUniqueID(element.attr('data-uid'), cardsList);

        element.removeClass('group-active-card');
        element.addClass('active-card');

        cardsList.push(cardsList[deleteId]);
        cardsList.splice(deleteId, 1);
        var firstCardId = parseInt(cardsList[deleteId].el.attr('data-uid'));
        var firstCardPrev = 0;
        if (deleteId > 0) {
            firstCardPrev = parseInt(cardsList[deleteId - 1].el.attr('data-uid'));
        }
        var secondCardId = parseInt(element.attr('data-uid'));
        var secondCardPrev = 0;
        if (cardsList.length > 1) {
            secondCardPrev = cardsList[cardsList.length - 2].el.attr('data-uid');
        }
        cardsHelper.updateZindex(cardsList);

        cardsApi.updateCardZindex(firstCardId, secondCardId, firstCardPrev, secondCardPrev)
        .catch(function(err) {
            console.error(err);
        });
    };

    $scope.deleteCardFromList = function(element) {
        const cardId = element.attr('data-uid');
        cardsApi.deleteCard(cardId)
        .then(function() {
            element.remove();
            const deleteId = cardsHelper.findListIdByUniqueID(cardId, cardsList);
            cardsList.splice(deleteId, 1);
            cardsHelper.updateZindex(cardsList);
            $scope.$apply(function () {
                $scope.table.onboard -= 1;
            });
        });
    };

    $scope.editCard = function (text, element) {
        $scope.editDetails = { 
            text: text,
            el: element
        };
        $scope.isEdit = true;
    };

    $scope.editCardEnd = function(html, element) {
        if (element) {
            const cardId = parseInt(element.attr('data-uid'));
            cardsApi.updateText(cardId, html)
            .then(function() {
                element.find("div").html(html);
            })
            .catch(function(err) {
                console.error(err);
            });
        }
        $scope.isEdit = false;
    }

    var startGroupX, startGroupY = 0;
    var groupElement = angular.element(document.createElement("div"));
    groupElement.addClass("group");
    var moveGroupList = [];
    rootTable.append(groupElement);

    function groupmousemove(event) {
        y = event.pageY - startGroupY;
        x = event.pageX - startGroupX;
        cardsList.forEach(function(card, index) {
            var offLeft = card.el[0].offsetLeft;
            var offTop = card.el[0].offsetTop;
            if ((offLeft >= startGroupX && offTop >= startGroupY
            && offLeft <= event.pageX && offTop <= event.pageY)) {
                card.el.removeClass('active-card');
                card.el.addClass('group-active-card');
                moveGroupList[index] = {
                    el: card.el,
                    left: offLeft,
                    top: offTop
                };
            } else {
                card.el.removeClass('group-active-card');
            }
        });
        if (x < 0 && y < 0) {
            groupElement.css({
                top: event.pageY + 'px',
                left: event.pageX + 'px'
            });
            groupElement.css({
                height: (startGroupY - event.pageY) + 'px',
                width: (startGroupX - event.pageX) + 'px'
            });
        } else if (y < 0) {
            groupElement.css({
                top: event.pageY + 'px'
            });
            groupElement.css({
                height: (startGroupY - event.pageY) + 'px'
            });
        } else if (x < 0) {
            groupElement.css({
                left: event.pageX + 'px'
            });
            groupElement.css({
                width: (startGroupX - event.pageX) + 'px'
            });
        } else {
            groupElement.css({
                height: y + 'px',
                width: x + 'px'
            });
        }
    }
    $scope.writeGroupToDataBase = function (authorId) {
        moveGroupList.forEach(function(card) {
            var cardId = parseInt(card.el.attr('data-uid'));
            if (cardId !== authorId) {
                var cardx = parseInt(card.el[0].offsetLeft);
                var cardy = parseInt(card.el[0].offsetTop);
                cardsApi.updateCardPosition(cardId, cardx, cardy)
                .catch(function(err) {
                    console.error(err);
                });
            }
        });
    };

    function groupmouseup(event) {
        groupElement.css({
            width: '0px',
            height: '0px',
            top: '0px',
            left: '0px',
            display: 'none'
        });
        $document.off('mousemove', groupmousemove);
        $document.off('mouseup', groupmouseup);
    }

    rootTable.on('mousedown', function(event) {
        startGroupX = event.pageX - groupElement[0].offsetLeft;
        startGroupY = event.pageY - groupElement[0].offsetTop;
        moveGroupList = [];
        groupElement.css({
            top: startGroupY + 'px',
            left: startGroupX + 'px',
            display: 'block',
            position: 'absolute'
        });
        $document.on('mousemove', groupmousemove);
        $document.on('mouseup', groupmouseup);
    });

    $scope.moveGroup = function(posX, posY) {
        moveGroupList.forEach(function(card) {
            if (card) {
                card.el.css({
                    top: (card.top + posY) + 'px',
                    left: (card.left + posX) + 'px'
                });
            }
        });
    };

    $scope.stopMoveGroup = function() {
        moveGroupList.forEach(function(card) {
            if (card) {
                card.el.removeClass('group-active-card');
            }
        });
        $scope.writeGroupToDataBase();
        moveGroupList = [];
    }

    $scope.recalculatePositions = function() {
        moveGroupList.forEach(function(card, index) {
            if (card) {
                moveGroupList[index] = {
                    el: card.el,
                    top: card.el[0].offsetTop,
                    left: card.el[0].offsetLeft
                };
            }
        });
    }
});