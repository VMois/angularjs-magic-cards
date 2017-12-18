<?php 
require("../../connection.php");
require("../../utils/clear_value.php");

$method = $_SERVER['REQUEST_METHOD'];

// default returned content-type is json
header('Content-Type: application/json');

$errorObject = new StdClass;
$returnObject = new StdClass;
$error = false;

if ($method == "POST") {
    if (isset($_POST['cardX']) && isset($_POST['cardY']) && isset($_POST['text']) 
    && isset($_POST['prevId']) && isset($_POST['tableId']) && isset($_POST['width']) 
    && isset($_POST['height'])) {
        $cardX = clearValue($_POST['cardX']);
        $cardY = clearValue($_POST['cardY']);
        $width = clearValue($_POST['width']);
        $height = clearValue($_POST['height']);
        $prevId = clearValue($_POST['prevId']);
        $tableId = clearValue($_POST['tableId']);
        if ($prevId == "0") {
            $prevId = null;
        }
        $sql = "INSERT INTO mcards (x, y, prev, table_id, width, height) 
                    VALUES (".$cardX.",".$cardY.",".$prevId.",".$tableId.",".$width.",".$height.")";
        if ($conn->query($sql) == TRUE) {
            $returnObject->id = $conn->insert_id;
            http_response_code(200);
        } else {
            http_response_code(500);
            $errorObject->message = "Something wrong... :(";
            $errorObject->detailedMessage = $conn->error;
            $error = true;
        }
    } else if (isset($_POST['cardX']) && isset($_POST['cardY']) && isset($_POST['cardId'])) {
        $cardId = clearValue($_POST['cardId']);
        $cardX = clearValue($_POST['cardX']);
        $cardY = clearValue($_POST['cardY']);
        $sql = "UPDATE mcards SET x=".$cardX.", y=".$cardY." WHERE id=".$cardId;
        if ($conn->query($sql) == TRUE) {
            http_response_code(200);
            $returnObject->status = "UPDATED";
        } else {
            http_response_code(500);
            $errorObject->message = "Something wrong... :(";
            $errorObject->detailedMessage = $conn->error;
            $error = true;
        }
    } else if (isset($_POST['cardWidth']) && isset($_POST['cardHeight']) && isset($_POST['cardId'])) {
        $cardId = clearValue($_POST['cardId']);
        $cardWidth = clearValue($_POST['cardWidth']);
        $cardHeight = clearValue($_POST['cardHeight']);
        $sql = "UPDATE mcards SET width=".$cardWidth.", height=".$cardHeight." WHERE id=".$cardId;
        if ($conn->query($sql) == TRUE) {
            http_response_code(200);
            $returnObject->status = "UPDATED";
        } else {
            http_response_code(500);
            $errorObject->message = "Something wrong... :(";
            $errorObject->detailedMessage = $conn->error;
            $error = true;
        }
    } else if (isset($_POST['cardId'])) {
        $cardId = clearValue($_POST['cardId']);
        $sql = "DELETE FROM mcards WHERE id=".$cardId;
        if ($conn->query($sql) == TRUE) {
            http_response_code(200);
            $returnObject->status = "DELETED";
        } else {
            http_response_code(500);
            $errorObject->message = "Something wrong... :(";
            $errorObject->detailedMessage = $conn->error;
            $error = true;
        }
    } else {
        $errorObject->message = "Something wrong in your input";
        http_response_code(404);
        $error = true;
    }
} else {
    $errorObject->message = "Method is not allowed";
    http_response_code(405);
    $error = true;
}

if ($error) {
    echo json_encode( (array)$errorObject );
} else {
    echo json_encode( (array)$returnObject );
}
?>