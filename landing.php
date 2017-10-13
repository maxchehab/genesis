<?php
     require_once('./php/lib/crypto.php');

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

     if($userID == ''){
          header('Location: /genesis/');
     }

     $workspaces = mysqli_query($link, "SELECT * FROM `workspaces` WHERE `userID`='$userID'");
?>




<!DOCTYPE html>
<html lang="en">

<head>
     <title>GENESIS</title>
     <link rel="shortcut icon" href="./static/genesis_logo.png">

     <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
     <script src="./js/cookie.js"></script>
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css">
     <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/js/materialize.min.js"></script>
     <link href="https://fonts.googleapis.com/css?family=Source+Code+Pro|Ubuntu+Mono|Overpass+Mono|Material+Icons" rel="stylesheet">

     <link href="http://www.jqueryscript.net/css/jquerysctipttop.css" rel="stylesheet" type="text/css">

     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
     <link href="./css/editor.css" rel="stylesheet">

</head>

<body>
     <div id="login-modal" class="login modal">
          <div class="modal-content">
               <div class="row">
                    <form id="register-form" class="col s12">
                         <h3 class="genesis">Please login for terminal access.</h3>
                         <div class="row">
                              <div class="input-field col s12">
                                   <input id="register-username" type="text" class="validate">
                                   <label id="register-username-label" for="email">Username</label>
                              </div>
                         </div>
                         <div class="row">
                              <div class="input-field col s12">
                                   <input id="register-email" type="email" class="validate">
                                   <label id="register-email-label" for="register-email">Email</label>
                              </div>
                         </div>
                         <div class="row">
                              <div class="input-field col s12">
                                   <input id="register-password" type="password" class="validate">
                                   <label id="register-password-label" for="register-password">Password</label>
                              </div>
                         </div>
                         <div class="row">
                              <div class="input-field col s12">
                                   <a id="register" class="waves-effect waves-light btn">Register</a>
                                   <a id="change-login" class="waves-effect waves-teal btn-flat">I have an account.</a>
                              </div>
                         </div>
                    </form>
                    <form id="login-form" class="col s12">
                         <h3 class="genesis">Please login for terminal access.</h3>
                         <div class="row">
                              <div class="input-field col s12">
                                   <input id="login-username" type="text" class="validate">
                                   <label for="login-username">Username</label>
                              </div>
                         </div>
                         <div class="row">
                              <div class="input-field col s12">
                                   <input id="login-password" type="password" class="validate">
                                   <label for="login-password">Password</label>
                              </div>
                         </div>

                         <div class="row">
                              <div class="input-field col s12">
                                   <a id="login" class="waves-effect waves-light btn">Login</a>
                                   <a id="change-register" class="waves-effect waves-teal btn-flat">I don't have an account.</a>
                              </div>
                         </div>
                    </form>
               </div>
          </div>

     </div>

     <nav id="navbar">
          <div class="nav-wrapper">
               <a href="#!" class="genesis brand-logo center">GENESIS</a>
               <ul id="nav" class="left">
                    <li><a href="/genesis/" class="genesis waves-effect waves-light"><i class="material-icons right">create</i>NEW</a></li>
               </ul>
               <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><a class="genesis" target="_blank" href="https://github.com/maxchehab/genesis"><i class="fa fa-github fa-3x" aria-hidden="true"></i></a></li>
               </ul>
          </div>
     </nav>
     <div class="container">
          <div class="row">
          <?php
               $i = 0;
               while ($workspace = mysqli_fetch_array($workspaces)) {
                    if($i % 3 == 0 && $i != 0){?>
                         </div>
                         <div class="row">
               <?php } ?>

               <div class="col s12 l4">
                    <div class="card small">
                         <div class="card-image">
                              <img src="https://isocpp.org/files/img/cpp_logo.png">
                         </div>
                         <div class="card-content">
                              <p><?php echo $workspace["name"] ?></p>
                         </div>
                         <div class="card-action">
                              <a href="/genesis/?open=<?php echo $workspace["workspaceID"]; ?>">Open</a>
                         </div>
                    </div>
               </div>

          <?php $i++;
          }?>


     </div>


</body>

</html>
