<?php 
require("connection.php");
?>

<!DOCTYPE html>
<html>
    <head>
        <title>Magic Cards - Main</title>
        <meta charset="UTF-8">
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-route.js"></script>
    </head>
    <body ng-app="mcardsApp">
        <div ng-view></div>
        <script src="js/settings.js"></script>
        <script src="js/main.js"></script>
    </body>
</html>