<?php
  function clearValue($raw_value) {
    $value_to_return = trim($raw_value);
    $value_to_return = strip_tags($value_to_return);
    $value_to_return = htmlspecialchars($value_to_return);
    return $value_to_return;
  }
?>