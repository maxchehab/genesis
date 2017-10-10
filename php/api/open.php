<?php
     $response = array();
     $response["success"] = true;
     $file = $_POST['file'];
     if($file == 'default'){
          $file = '/main.cpp';
     }
     try{
          $workspaceID = $_COOKIE["genesis_workspaceID"];
          $response["path"] = $file;
          
          $file = file_get_contents("../../docker/volumes/" . $workspaceID . $file);

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

     function getRelativePath($from, $to){
          $from = explode('/', $from);
          $to = explode('/', $to);
          foreach($from as $depth => $dir){

               if(isset($to[$depth])){
                    if($dir === $to[$depth]){
                         unset($to[$depth]);
                         unset($from[$depth]);
                    }else{
                         break;
                    }
               }
          }
          //$rawresult = implode('/', $to);
          for($i=0;$i<count($from)-1;$i++){
               array_unshift($to,'..');
          }
          $result = implode('/', $to);
          return $result;
     }
?>
