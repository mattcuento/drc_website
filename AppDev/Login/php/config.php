<?php

define('DB_SERVER', 'database1.cmqulrwy2do5.us-west-2.rds.amazonaws.com');
define('DB_USERNAME', 'zoe');
define('DB_PASSWORD', 'Appfordrc2018');
define('DB_NAME', 'database1');

/* Attempt to connect to MySQL database */
$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
?>
