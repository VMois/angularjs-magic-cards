<?php 
require("../../connection.php");
require("../../utils/clear_value.php");

$method = $_SERVER['REQUEST_METHOD'];

// default returned content-type is json
header('Content-Type: application/json');

$errorObject = new StdClass;
$returnObject = new StdClass;
$error = false; 

// get table and related cards
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
        if ($numRows > 0) {
            $cards_sql = "SELECT * FROM mcards WHERE table_id=".$returnObject->id." ORDER BY prev";
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
                    $temp->text = html_entity_decode($row['text']);
                    $temp->prev = (int) $row['prev'];
                    array_push($returnObject->cards, $temp);
                }
            }
        }
        http_response_code(200);
    } else {
        $errorObject->message = "name of table is required in GET request";
        http_response_code(404);
        $error = true;
    }
// create table
} else if ($method == "POST") {
    if (isset($_POST['name'])) {
        $name = clearValue($_POST['name']);

        $sql = "INSERT INTO mtables (name) VALUES ('".$name."')";

        if ($conn->query($sql) == TRUE) {
            http_response_code(200);
            $returnObject->id = $conn->insert_id;
            $returnObject->count = 0;
            $returnObject->onboard = 0;
            $returnObject->name = $name;
        } else {
            http_response_code(500);
            $errorObject->message = "Error while table creation :(";
            $errorObject->detailedMessage = $conn->error;
            $error = true;
        }
    } else {
        $errorObject->message = "name is required in POST request";
        http_response_code(404);
        $error = true;
    }
} else {
    http_response_code(405);
}

$conn->close();

if ($error) {
    echo json_encode( (array)$errorObject );
} else  {
    echo json_encode( (array)$returnObject );
}

?>