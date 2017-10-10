<!DOCTYPE html>
<html lang="en">

<head>
     <title>GENESIS</title>
     <link rel="shortcut icon" href="./static/genesis_logo.png">

     <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
     <script src="./js/cookie.js"></script>

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

          $workspaceID = uuid();

          mkdir("./docker/volumes/" . $workspaceID);
          copy("./docker/templates/main.cpp","./docker/volumes/" . $workspaceID . "/main.cpp");
          //echo shell_exec ("sudo chown -R genesis:genesis ./docker/volumes/" . $workspaceID);

          $query = mysqli_query($link,"INSERT INTO `workspaces` (`workspaceID`, `userID`, `name`)
                                   VALUES ('$workspaceID', '$userID', 'Untitled Workspace')");
     ?>
          <script>
               createCookie("genesis_workspaceID", "<?php echo $workspaceID; ?>", 1);
          </script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/js/materialize.min.js"></script>
          <link href="https://fonts.googleapis.com/css?family=Source+Code+Pro|Ubuntu+Mono|Overpass+Mono|Material+Icons" rel="stylesheet">

          <link href="http://www.jqueryscript.net/css/jquerysctipttop.css" rel="stylesheet" type="text/css">
          <link href="./plugins/file-explore/file-explore.css" rel="stylesheet" type="text/css">
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
          <link rel="stylesheet" href="./plugins/contextmenu/contextmenu.css">


          <link href="./css/editor.css" rel="stylesheet">
          <script src="./plugins/mousetrap/mousetrap.js" type="text/javascript" charset="utf-8"></script>

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

     <div id="delete-file-modal" class="modal modal-small modal-fixed-footer">
          <div class="modal-content">
               <h4>Attention!</h4>
               <p>Are you sure you want to delete this file?</p>
          </div>
          <div class="modal-footer">
                    <a href="#!" class="cancel-delete-action modal-action modal-close waves-effect waves-green btn-flat">Cancel.</a>
                    <a href="#!" class="delete-action modal-action modal-close waves-effect waves-green btn-flat">Delete.</a>
          </div>
     </div>
     <div id="delete-directory-modal" class="modal modal-small modal-fixed-footer">
          <div class="modal-content">
               <h4>Attention!</h4>
               <p>Are you sure you want to delete this directory?</p>
               <p>All files and directories within this directory will be removed.</p>
          </div>
          <div class="modal-footer">
               <a href="#!" class="cancel-delete-action modal-action modal-close waves-effect waves-green btn-flat">Cancel.</a>
               <a href="#!" class="delete-action modal-action modal-close waves-effect waves-green btn-flat">Delete.</a>

          </div>
     </div>
     <nav id="navbar">
          <div class="nav-wrapper">
               <a href="#" class="genesis brand-logo center">GENESIS</a>
               <ul id="nav" class="left">
                    <li><a id="terminal-button" class="genesis waves-effect waves-light"><i class="material-icons right">keyboard</i>TERMINAL</a></li>
               </ul>
               <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><a class="genesis" href="#share"><i class="material-icons right">share</i>SHARE</a></li>

               </ul>
          </div>
     </nav>
     <div class="directory-show" id="parent">
          <div id="directory">
               <ul class="file-tree">
                    <li class="context-file" data-path="/"><a class="context-file" data-path="/" href="#">Untitled Workspace</a>
                         <ul id="initial_workspace">

                         </ul>
                    </li>
               </ul>
          </div>
          <div class="terminal-hide" id="container">

               <div id="editor"></div>
               <div class="mousetrap" spellcheck="false" id="terminal"></div>
          </div>
     </div>

     <div class="root" id="rc-context-menu">
          <div id="menu-item-file" class="menu-item" data-rc-launch="delete">
               <i class="material-icons">insert_drive_file</i>
               <div class="ripple">
                    Create File
               </div>
          </div>
          <div id="menu-item-directory" class="menu-item" data-rc-launch="delete">
               <i class="material-icons">create_new_folder</i>
               <div class="ripple">
                    Create Directory
               </div>
          </div>

          <div id="menu-item-rename" class="menu-item" data-rc-launch="delete">
               <i class="material-icons">mode_edit</i>
               <div class="ripple">
                    Rename
               </div>
          </div>

          <div id="menu-item-download" class="menu-item" data-rc-launch="download">
               <i class="material-icons">file_download</i>
               <div class="ripple">
                    Download
               </div>
          </div>
          <div class="menu-item-delete separator"></div>
          <div class="menu-item-delete-directory menu-item" data-rc-launch="delete">
               <i class="material-icons red-text">delete_forever</i>
               <div class="ripple modal-trigger" href="#delete-directory-modal">
                    Delete
               </div>
          </div>
          <div class="menu-item-delete-file menu-item" data-rc-launch="delete">
               <i class="material-icons red-text">delete_forever</i>
               <div class="ripple modal-trigger" href="#delete-file-modal">
                    Delete
               </div>
          </div>
     </div>

     <script src="./plugins/file-explore/file-explore.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js" type="text/javascript" charset="utf-8"></script>
     <script src="./js/editor.js" type="text/javascript" charset="utf-8"></script>
     <script src "./plugins/contextmenu/contextmenu.js"></script>
</body>

</html>
