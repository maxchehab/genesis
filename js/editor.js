$(document).ready(function() {
     $('.modal').modal({
          complete: function() {
               loginCallback();
          }
     });
});

var lCallback = null;

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
     var username = $("#login-username").val();
     var password = $("#login-password").val();

     $.ajax({
          url: './php/api/register.php',
          type: 'POST',
          data: {
               username: username,
               password: password
          },
          success: function(data) {
               console.log(data);
               $('#login-modal').modal('close');
          }
     });
})

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
                    password: password
               },
               success: function(data) {
                    console.log(data);
                    data = JSON.parse(data);
                    if (data.success) {
                         createCookie("genesis_session", data.cookie, 1);
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
          $("#terminal").focus();
     } else {
          $("#container").removeClass("terminal-show");
          $("#container").addClass("terminal-hide");
     }
}

function login(callback) {
     if (readCookie("genesis_session") != null) {
          callback();
     }else{
          lCallback = callback;
          $('#login-modal').modal('open');
     }
}

function loginCallback() {
     if (readCookie("genesis_session") != null && lCallback != null) {
          lCallback();
     } else {
          lCallback = null;
     }
}

function createCookie(name, value, days) {
     var expires = "";
     if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          expires = "; expires=" + date.toUTCString();
     }
     document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
     var nameEQ = name + "=";
     var ca = document.cookie.split(';');
     for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ')
               c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0)
               return c.substring(nameEQ.length, c.length);
          }
     return null;
}

function eraseCookie(name) {
     createCookie(name, "", -1);
}
