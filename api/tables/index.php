<?php 
require("../../connection.php");
require("../../utils/clear_value.php");

$method = $_SERVER['REQUEST_METHOD'];

// default returned content-type is json
header('Content-Type: application/json');

$errorObject = new StdClass;
$returnObject = new StdClass;

// get table 
if ($method == "GET") {
    if (isset($_GET['name'])) {

        // clear value
        $name = clearValue($_GET['name']);

        // create sql query
        $sql = "SELECT id, name, count, onboard FROM mtables WHERE name='".$name."'";
        $cards_sql = "SELECT * FROM mcards WHERE table_id=";

        // set default numRows
        $numRows = 0;

        // execute query
        $result = $conn->query($sql); 

        // check if exactly one row is returned
        if ($result->num_rows == 1) {
            $numRows = 1;

            // update new object
            while($row = $result->fetch_assoc()) {
                $returnObject->id = $row["id"];
                $returnObject->count = $row["count"];
                $returnObject->onboard = $row["onboard"];
                $returnObject->name = $row["name"];
                $cards_sql = $cards_sql.$row["id"];
            }
        }

        // update num_rows
        $returnObject->num_rows = $numRows;

        $json_to_return = json_encode( (array)$returnObject );

        // set response code to HTTP 200
        http_response_code(200);

        echo $json_to_return;
    } else {
        $errorObject->message = "name is required in GET request";
        http_response_code(404);
        echo json_encode( (array)$errorObject );
    }
// create table
} else if ($method == "POST") {
    if (isset($_POST['name'])) {
        $name = clearValue($_POST['name']);
        $sql = "INSERT INTO mtables (name) VALUES ('".$name."')";
        if ($conn->query($sql) == TRUE) {
            http_response_code(200);
            $returnObject->name = $name;
            $returnObject->count = 0;
            $returnObject->onboard = 0;
            echo json_encode( (array)$returnObject );
        } else {
            http_response_code(500);
            $errorObject->message = "Something wrong... :(";
            echo json_encode( (array)$errorObject );
        }
    } else {
        $errorObject->message = "name is required in POST request";
        http_response_code(404);
        echo json_encode( (array)$errorObject );
    }
} else {
    http_response_code(405);
}

?>