<?php

     require_once('../lib/crypto.php');

     $workspaceID = $_COOKIE["genesis_workspaceID"];
     $path = $_GET['path'];


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
     $workspace_result = mysqli_fetch_array($results);
     $workspace_userID =  $workspace_result["userID"];
     $workspace_name = $workspace_result["name"];
     
     if($workspace_userID == $userID || $workspace_userID == ''){
          $path = "../../docker/volumes/" . $workspaceID . $path;
          $authPath = realpath("../../docker/volumes/");

          if(substr(realpath($path), 0, strlen($authPath)) == $authPath){
               if(is_dir($path)){
                    zipandsend($path, $workspaceID, $workspace_name);
               }else{
                    if (file_exists($path)) {
                         header('Content-Description: File Transfer');
                         header('Content-Type: application/octet-stream');
                         header('Content-Disposition: attachment; filename="'.basename($path).'"');
                         header('Expires: 0');
                         header('Cache-Control: must-revalidate');
                         header('Pragma: public');
                         header('Content-Length: ' . filesize($path));
                         readfile($path);
                         exit;
                    }
               }
          }
     }

     function zipandsend($path, $workspaceID, $workspace_name){
          $pathname = $path;
          if(basename($path) == $workspaceID){
               $pathname = $workspace_name;
          }

          $zip_file = $pathname . ".zip";

          // Get real path for our folder
          $rootPath = realpath($path);

          // Initialize archive object
          $zip = new ZipArchive();
          $zip->open($zip_file, ZipArchive::CREATE | ZipArchive::OVERWRITE);

          // Create recursive directory iterator
          /** @var SplFileInfo[] $files */
          $files = new RecursiveIteratorIterator(
               new RecursiveDirectoryIterator($rootPath),
               RecursiveIteratorIterator::LEAVES_ONLY
          );

          foreach ($files as $name => $file){
               if (!$file->isDir()){
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($rootPath) + 1);

                    $zip->addFile($filePath, $relativePath);
               }
          }
          $zip->close();
          ob_clean();

          ob_end_flush();
          ob_start();

          header('Content-Description: File Transfer');
	     header('Content-Type: application/octet-stream');
	     header('Content-Disposition: attachment; filename='.basename($zip_file));
	     header('Content-Transfer-Encoding: binary');
	     header('Expires: 0');
	     header('Cache-Control: must-revalidate');
	     header('Pragma: public');
	     header('Content-Length: ' . filesize($zip_file));

          flush();
	     readfile($zip_file);
	     unlink($zip_file);
          ob_end_flush();
     }
?>
