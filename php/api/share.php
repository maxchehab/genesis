<?php

     require_once('../lib/crypto.php');

     $response = array();
     $response["errors"] = array();

     $workspaceID = $_COOKIE["genesis_workspaceID"];
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

     $results = mysqli_fetch_array(mysqli_query($link,"SELECT * FROM `workspaces` WHERE `workspaceID`='$workspaceID'"));
     $workspace_userID =  $results["userID"];
     $workspace_shareID = $results["shareID"];

     if($workspace_shareID != ''){
          $response["success"] = true;
          $response["shareID"] = $workspace_shareID;
     }else{
          if($workspace_userID == $userID){
               $shareID = uuid();
               mysqli_query($link, "UPDATE `workspaces` SET `shareID`='$shareID' WHERE `workspaceID`='$workspaceID'");
               $response["success"] = true;
               $response["shareID"] = $shareID;
          }else{
               error("You do not have authorization to share this workspace.", $response);
          }
     }



     echo json_encode($response);

     function error($error, &$response){
          $response["success"] = false;
          array_push($response["errors"], $error);
          return $response;
     }
?>
