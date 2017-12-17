<?php
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "mcards";
    $conn = new mysqli($servername, $username, $password, $dbname);

    if($conn->connect_error) {
        die("Connection failed: ".$conn->connect_error);
    }
    $conn->query('SET NAMES utf8');
    $conn->query('SET CHARACTER_SET utf8_unicode_ci');
?>