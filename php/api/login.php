<?php
     require_once('../lib/crypto.php');

     $response = array();
     $response["success"] = true;
     $response["errors"] = array();

     $username = encrypt_decrypt('encrypt', $_POST["username"]);
     $password = $_POST["password"];

     $link = mysqli_connect("localhost", "genesis", "genesis", "genesis");

     if (mysqli_connect_errno()){
          $response = error("Failed to connect to MySQL: " . mysqli_connect_error(), $response);
     }

     $users = mysqli_query($link,"SELECT * FROM `users` WHERE `username`='$username'");

     $found = false;
     $userID = '';
     while ($user = mysqli_fetch_array($users)) {
          if(hashword($password, $user['salt']) == $user['password']){
               $userID = $user['userID'];
               $found = true;
               break;
          }
     }

     $response["success"] = $found;

     if($response["success"]){
          $cookie = uuid();
          $query = mysqli_query($link,"UPDATE `users` SET `cookie`='$cookie' WHERE `username`='$username'");
          if(!$query){
               $response = error("Database error: " . mysqli_error($link), $response);
          }else{
               $response["cookie"] = $cookie;
               if(isset($_POST["workspaceID"])){
                    $workspaceID = $_POST['workspaceID'];
                    $query = mysqli_query($link,"UPDATE `workspaces` SET `userID`='$userID' WHERE `workspaceID`='$workspaceID'");
                    if(!$query){
                         error("Database error: " . mysqli_error($link), $response);
                    }
               }
          }
     }else{
          error("No match.", $response);
     }

     echo json_encode($response);

     function error($error, &$response){
          $response["success"] = false;
          array_push($response["errors"], $error);
          return $response;
     }

?>
