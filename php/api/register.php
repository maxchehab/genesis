<?php
     require_once('../lib/crypto.php');

     $response = array();
     $response["success"] = true;
     $response["errors"] = array();

     $userID = uuid();
     $username = encrypt_decrypt('encrypt', $_POST["username"]);
     $email = encrypt_decrypt('encrypt', $_POST["email"]);
     $salt = salt(32);
     $password = hashword($_POST["password"], $salt);
     $cookie = uuid();

     $link = mysqli_connect("localhost", "genesis", "genesis", "genesis");

     if (mysqli_connect_errno()){
          $response = error("Failed to connect to MySQL: " . mysqli_connect_error(), $response);
     }

     $usernameMatches = mysqli_query($link,"SELECT * FROM `users` WHERE `username`='$username'");
     if(mysqli_num_rows($usernameMatches) > 0){
          $response = error("Username is taken.", $response);
     }

     $emailMatches = mysqli_query($link,"SELECT * FROM `users` WHERE `email`='$email'");
     if(mysqli_num_rows($emailMatches) > 0){
          $response = error("Email is taken.", $response);
     }

     if($response["success"]){
          $query = mysqli_query($link,"INSERT INTO `users` (`userID`, `username`, `email`, `password`, `salt`, `cookie`)
                                        VALUES ('$userID', '$username', '$email', '$password', '$salt', '$cookie')");
          if(!$query){
               $response = error("Database error: " . mysqli_error($link), $response);
          }else{
               $response["cookie"] = $cookie;
          }
     }

     echo json_encode($response);

     function error($error, $response){
          $response["success"] = false;
          array_push($response["errors"], $error);
          return $response;
     }

?>
