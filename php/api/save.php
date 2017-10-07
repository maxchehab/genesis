<?php

     require_once('../lib/crypto.php');

     $response = array();
     $response["errors"] = array();

     $workspaceID = $_COOKIE["genesis_workspaceID"];
     $data = $_POST["data"];

     $link = mysqli_connect("localhost", "genesis", "genesis", "genesis");

     $userID = '';

     if(isset($_COOKIE["genesis_session"], $_COOKIE["genesis_user"])){
          $cookie = $_COOKIE["genesis_session"];
          $username = encrypt_decrypt('encrypt', $_COOKIE["genesis_user"]);

          $users = mysqli_query($link,"SELECT * FROM `users` WHERE `username`='$username'");
          while ($user = mysqli_fetch_array($users)) {
               if($cookie == $user['cookie']){
                    $userID = $user['userID'];
                    break;
               }
          }
     }
     $results = mysqli_query($link,"SELECT * FROM `workspaces` WHERE `workspaceID`='2e1f40db-23db-4c4c-9870-2da463962dad'");
     $workspace_userID =  mysqli_fetch_array($results)["userID"];

     if($workspace_userID == $userID || $workspace_userID == ''){
          file_put_contents("../../docker/volumes/" . $workspaceID . "/main.cpp", $data);
          $response["success"] = true;
     }else{
          error("You do not have authorization to access this file.", $response);
     }



     echo json_encode($response);

     function error($error, $response){
          $response["success"] = false;
          array_push($response["errors"], $error);
          return $response;
     }
?>
