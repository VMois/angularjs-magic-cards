<?php 
require("../../connection.php");
require("../../utils/clear_value.php");

$method = $_SERVER['REQUEST_METHOD'];

// default returned content-type is json
header('Content-Type: application/json');

$errorObject = new StdClass;

// get table 
if ($method == "GET" && isset($_GET['name'])) {
    if (isset($_GET['name'])) {

        // clear value
        $name = clearValue($_GET['name']);

        // create sql query
        $sql = "SELECT name, count, onboard FROM mtables WHERE name='".$name."'";

        // set default numRows
        $numRows = 0;

        // create basic return object
        $returnObject = new StdClass;

        // execute query
        $result = $conn->query($sql); 

        // check if exactly one row is returned
        if ($result->num_rows == 1) {
            $numRows = 1;

            // update new object
            while($row = $result->fetch_assoc()) {
                $returnObject->count = $row["count"];
                $returnObject->onboard = $row["onboard"];
                $returnObject->name = $row["name"];
            }
        }

        // update num_rows
        $returnObject->num_rows = $numRows;

        $json_to_return = json_encode( (array)$returnObject );

        // set response code to HTTP 200
        http_response_code(200);
        // return json
        echo $json_to_return;
    } else {
        http_response_code(404);
    }
// create table
} else if ($method == "POST") {
    if (isset($_POST['name'])) {

    } else {
        http_response_code(404);
    }
} else {
    http_response_code(405);
}

?>