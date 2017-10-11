<?php

     require_once('../lib/crypto.php');

     $response = array();
     $response["errors"] = array();

     $workspaceID = $_COOKIE["genesis_workspaceID"];

     $newPath = $_POST["newPath"];
     $oldPath = $_POST["oldPath"];

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

     $results = mysqli_query($link,"SELECT * FROM `workspaces` WHERE `workspaceID`='$workspaceID'");
     $workspace_userID =  mysqli_fetch_array($results)["userID"];

     if($workspace_userID == $userID || $workspace_userID == ''){

          if($oldPath == "/"){
               mysqli_query($link,"UPDATE `workspaces` SET `name`='$newPath' WHERE `workspaceID`='$workspaceID'");
               $response["success"] = true;
          }else{
               $authPath = realpath("../../docker/volumes/" . $workspaceID);
               $oldPath = realpath("../../docker/volumes/" . $workspaceID . $oldPath);
               $newPath = dirname($oldPath) . "/" . $newPath;
               if(!file_exists($newPath)){
                    touch($newPath);
                    $newPath = realpath($newPath);
                    if(substr($oldPath, 0, strlen($authPath)) == $authPath && substr($newPath, 0, strlen($authPath)) == $authPath ){
                         rename($oldPath, $newPath);
                         $response["success"] = true;
                    }else{
                         unlink($newPath);
                         error("You do not have authorization to access this file.", $response);
                    }
               }else{
                    error("File exists. If you wish to rename this file please use the command line.", $response);
               }
          }
     }else{
          error("You do not have authorization to access this file.", $response);
     }

     echo json_encode($response);

     function error($error, &$response){
          $response["success"] = false;
          array_push($response["errors"], $error);
          return $response;
     }
?>
