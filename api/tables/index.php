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

        // set default numRows
        $numRows = 0;

        // execute query
        $result = $conn->query($sql); 

        // check if exactly one row is returned
        if ($result->num_rows == 1) {
            $numRows = 1;

            // update new object
            while($row = $result->fetch_assoc()) {
                $returnObject->id = (int) $row["id"];
                $returnObject->count = (int) $row["count"];
                $returnObject->onboard = (int) $row["onboard"];
                $returnObject->name = $row["name"];
            }
        }

        // update num_rows
        $returnObject->num_rows = $numRows;

        $cards_sql = "SELECT * FROM mcards WHERE table_id=".$returnObject->id;
        $result = $conn->query($cards_sql);
        $returnObject->cards = array();
        if($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $temp = new StdClass;
                $temp->id = (int) $row['id'];
                $temp->x = (int) $row['x'];
                $temp->y = (int) $row['y'];
                $temp->width = (int) $row['width'];
                $temp->height = (int) $row['height'];
                $temp->text = $row['text'];
                $temp->prev = (int) $row['prev'];
                array_push($returnObject->cards, $temp);
            }
        }

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
        $afterSql = "SELECT id, name, count, onboard FROM mtables WHERE name='".$name."'";
        if ($conn->query($sql) == TRUE) {
            http_response_code(200);
            $result = $conn->query($afterSql);
            if ($result->num_rows == 1) {
                // update new object
                while($row = $result->fetch_assoc()) {
                    $returnObject->id = (int) $row["id"];
                    $returnObject->count = (int) $row["count"];
                    $returnObject->onboard = (int) $row["onboard"];
                    $returnObject->name = $row["name"];
                }
            }
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