<?php
  function clearValue($raw_value) {
    $value_to_return = trim($raw_value);
    $value_to_return = htmlentities($value_to_return);
    return $value_to_return;
  }
?>