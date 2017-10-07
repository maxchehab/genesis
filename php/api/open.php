<?php
     $response = array();
     $response["success"] = true;
     try{
          $workspaceID = $_COOKIE["genesis_workspaceID"];
          $file = file_get_contents("../../docker/volumes/" . $workspaceID . "/main.cpp");
          $response["file"] = $file;
     }catch(Exception $ex){
          error($ex, $response);
     }

     echo json_encode($response);

     function error($error, $response){
          $response["success"] = false;
          array_push($response["errors"], $error);
          return $response;
     }
?>
