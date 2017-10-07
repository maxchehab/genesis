$.getScript("./docker/terminal.js");

$(document).ready(function() {
     $('.modal').modal({
          complete: function() {
               loginCallback();
          }
     });
});

var lCallback = null;
var terminalConnected = false;

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/c_cpp");
editor.setFontSize(16);
editor.setOptions({fontFamily: "'Source Code Pro', monospace"});
editor.commands.addCommand({
     name: "terminal",
     bindKey: {
          win: "Ctrl-Alt-T",
          mac: "Command-Option-T"
     },
     exec: function(editor) {
          login(toggleTerminal);
     }
});

$("#change-register").click(function() {
     $("#login-modal").addClass("register").removeClass("login");
});

$("#run-button").click(function() {
     login(toggleTerminal);
})

$("#change-login").click(function() {
     $("#login-modal").addClass("login").removeClass("register");
})

$("#terminal-button").click(function() {
     login(toggleTerminal);
})

Mousetrap.bind('ctrl+alt+t', function(e) {
     login(toggleTerminal);
     return false;
});

$("#login").click(function() {
     var valid = true;

     var username = $("#login-username").val();
     var password = $("#login-password").val();

     if (username.length == 0) {
          $("#login-username-label").attr("data-error", "Username cannot be empty.");
          $("#login-username").addClass("invalid");
          valid = false;
     }

     if (password.length == 0) {
          $("#login-password-label").attr("data-error", "Password cannot be empty.");
          $("#login-password").addClass("invalid");
          valid = false;
     }

     if (valid) {
          $.ajax({
               url: './php/api/login.php',
               type: 'POST',
               data: {
                    username: username,
                    password: password,
                    workspaceID: readCookie('genesis_workspaceID')
               },
               success: function(data) {
                    console.log(data);
                    data = JSON.parse(data);
                    if (data.success) {
                         createCookie("genesis_session", data.cookie, 1);
                         createCookie("genesis_user", username, 1);
                         $('#login-modal').modal('close');
                    } else {
                         for (var i = 0; i < data.errors.length; i++) {
                              if (data.errors[i] == "No match.") {
                                   $("#login-username-label").attr("data-error", "No match.");
                                   $("#login-username").addClass("invalid");
                                   $("#login-password-label").attr("data-error", "No match.");
                                   $("#login-password").addClass("invalid");
                              } else {
                                   alert("Please try again later.\n\n" + data.errors[i]);
                              }
                         }
                    }
               }
          });
     }
});

$("#register").click(function() {
     var valid = true;

     var username = $("#register-username").val();
     var email = $("#register-email").val().trim();
     var password = $("#register-password").val();

     if (username.includes(" ")) {
          $("#register-username-label").attr("data-error", "Username cannot contain any white spaces.");
          $("#register-username").addClass("invalid");
          valid = false;
     }

     if (username.length == 0) {
          $("#register-username-label").attr("data-error", "Username cannot be empty.");
          $("#register-username").addClass("invalid");
          valid = false;
     }

     if (!isEmail(email)) {
          $("#register-email-label").attr("data-error", "Invalid email.");
          $("#register-email").addClass("invalid");
          valid = false;
     }

     if (password.length == 0) {
          $("#register-password-label").attr("data-error", "Password cannot be empty.");
          $("#register-password").addClass("invalid");
          valid = false;
     }

     if (valid) {
          $.ajax({
               url: './php/api/register.php',
               type: 'POST',
               data: {
                    username: username,
                    email: email,
                    password: password,
                    workspaceID: readCookie('genesis_workspaceID')
               },
               success: function(data) {
                    console.log(data);
                    data = JSON.parse(data);
                    if (data.success) {
                         createCookie("genesis_session", data.cookie, 1);
                         createCookie("genesis_user", username, 1);

                         $('#login-modal').modal('close');
                    } else {
                         for (var i = 0; i < data.errors.length; i++) {
                              if (data.errors[i] == "Email is taken.") {
                                   $("#register-email-label").attr("data-error", "Email is taken.");
                                   $("#register-email").addClass("invalid");
                              } else if (data.errors[i] == "Username is taken.") {
                                   $("#register-username-label").attr("data-error", "Username is taken.");
                                   $("#register-username").addClass("invalid");
                              } else {
                                   alert("Please try again later.\n\n" + data.errors[i]);
                              }
                         }
                    }
               }
          });
     }
});

function isEmail(email) {
     var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
     return regex.test(email);
}

function toggleTerminal() {

     if ($("#container").hasClass("terminal-hide")) {
          $("#container").addClass("terminal-show");
          $("#container").removeClass("terminal-hide");

          if(!terminalConnected){
               connectTerminal();
               terminalConnected = true;
          }

     } else {
          $("#container").removeClass("terminal-show");
          $("#container").addClass("terminal-hide");
     }

	window.dispatchEvent(new Event('resize'));
}

function login(callback) {
     if (readCookie("genesis_session") != null && readCookie("genesis_user") != null) {
          callback();
     }else{
          lCallback = callback;
          $('#login-modal').modal('open');
     }
}

function loginCallback() {
     if (readCookie("genesis_session") != null && readCookie("genesis_user") != null && lCallback != null) {
          lCallback();
     } else {
          lCallback = null;
     }
}
