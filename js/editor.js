$.getScript("./docker/terminal.js");

$(document).ready(function() {
     $('.modal').modal({
          complete: function() {
               loginCallback();
          }
     });

     $(".file-tree").filetree();

});

var lCallback = null;
var terminalConnected = false;

var editor = ace.edit("editor");

var currentFile = 'default';

editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/c_cpp");
editor.setFontSize(16);
editor.setOptions({
     fontFamily: "'Source Code Pro', monospace"
});
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
editor.getSession().on('change', function() {
     save();
});

function openFile(fileName) {
     $.ajax({
          url: './php/api/open.php',
          type: 'POST',
          data: {
               file: fileName
          },
          success: function(data) {
               console.log(data);
               data = JSON.parse(data);
               if (data.success) {
                    editor.setValue(data.file, -1);
                    currentFile = fileName;
               } else {
                    alert("There was a problem loading your workspace. Please try again later.")
               }
          }
     });
}
openFile("default");

setInterval(function() {
     $.ajax({
          url: './php/api/directory.php',
          type: 'POST',
          success: function(data) {
               console.log(data);
               data = JSON.parse(data);
               if (data.success) {
                    createDirectory(data.directory, $("#initial_workspace"), "");
                    for (var i = 0; i < directories.length; i++) {
                         if (tempDirectories.indexOf(directories[i]) == -1) {
                              $(document.getElementById(directories[i])).parent().remove();
                         }
                    }
                    directories = tempDirectories;
                    tempDirectories = [];

                    $(".file").click(function() {
                         var path = $(this).attr('id');
                         if (currentFile != path) {
                              openFile(path);
                         }
                    });
               } else {
                    alert("There was a problem loading your workspace. Please try again later.")
               }
          }
     });
}, 200);



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
var delayTimer;

function save() {
     clearTimeout(delayTimer);
     delayTimer = setTimeout(function() {
          $.ajax({
               url: './php/api/save.php',
               type: 'POST',
               data: {
                    file: currentFile,
                    data: editor.getSession().getValue()
               },
               success: function(data) {
                    console.log(data);
                    data = JSON.parse(data);
                    if (!data.success) {
                         alert(data.errors.join('\n'));
                    }
               }
          });
     }, 200);
}

function isEmail(email) {
     var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
     return regex.test(email);
}

function toggleTerminal() {

     if ($("#container").hasClass("terminal-hide")) {
          $("#container").addClass("terminal-show");
          $("#container").removeClass("terminal-hide");

          if (!terminalConnected) {
               connectTerminal();
               terminalConnected = true;
          }

     } else {
          $('#rc-context-menu').addClass('hidden');

          $(document).bind("contextmenu", function(event) {

               // Avoid the real one
               event.preventDefault();

               // Show contextmenu
               $("#rc-context-menu").finish().toggleClass('hidden').

               // In the right position (the mouse)
               css({
                    top: event.pageY + "px",
                    left: event.pageX + "px"
               });
          });


          // If the document is clicked somewhere
          $(document).bind("mousedown", function(e) {

               // If the clicked element is not the menu
               if (!$(e.target).parents("#rc-context-menu").length > 0) {

                    // Hide it
                    $("#rc-context-menu").addClass('hidden');
               }
          });


          // If the menu element is clicked
          $("#rc-context-menu div").click(function() {

               // This is the triggered action name
               switch ($(this).attr("data-rc-launch")) {

                    // A case for each action. Your actions here
                    case "first":
                         alert("first");
                         break;
                    case "second":
                         alert("second");
                         break;
                    case "third":
                         alert("third");
                         break;
               }

               // Hide it AFTER the action was triggered
               $("#rc-context-menu").addClass('hidden');
          });
          $("#container").removeClass("terminal-show");
          $("#container").addClass("terminal-hide");
     }

     window.dispatchEvent(new Event('resize'));
}

var directories = [];
var tempDirectories = [];

function createDirectory(directory, root, path) {
     $(root).children(".file").remove();
     if (directory.length > 0) {
          for (var i = 0; i < directory.length; i++) {
               var tempFile = path + "/" + directory[i];
               if (directories.indexOf(tempFile) == -1) {
                    directories.push(tempFile);
               }
               $(root).append("<li data-path=\"" + tempFile + "\" id=\"" + tempFile + "\" class=\"file closed open context-file\"> <a data-path=\"" + tempFile + "\" class=\"context-file\" href=\"#!\">" + directory[i] + "</a> </li>");
               tempDirectories.push(tempFile);

          }
     } else {
          for (var property in directory) {
               if (directory.hasOwnProperty(property)) {
                    if (directory[property].constructor !== String) {
                         var tempPath = path + "/" + property;
                         if (directories.indexOf(tempPath) == -1) {
                              directories.push(tempPath);
                              $(root).append("<li data-path=\"" + tempPath + "\" class=\"folder-root closed context-file\"><a class=\"context-file\" href=\"#\" data-path=\"" + tempPath + "\" >" + property + "</a><ul id=\"" + tempPath + "\"></ul></li>");
                         }
                         tempDirectories.push(tempPath);
                         createDirectory(directory[property], document.getElementById(tempPath), tempPath);
                    } else {
                         var tempFile = path + "/" + directory[property];
                         if (directories.indexOf(tempFile) == -1) {
                              directories.push(tempFile);
                         }
                         $(root).append("<li data-path=\"" + tempFile + "\" id=\"" + tempFile + "\" class=\"file closed open context-file\"> <a data-path=\"" + tempFile + "\" class=\"context-file\" href=\"#!\">" + directory[property] + "</a> </li>");
                         tempDirectories.push(tempFile);
                    }
               }
          }
     }
}

function login(callback) {
     if (readCookie("genesis_session") != null && readCookie("genesis_user") != null) {
          callback();
     } else {
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

function remove(id) {
     var elem = document.getElementById(id);
     return elem.parentNode.removeChild(elem);
}

function deletePath(path){
     $.ajax({
          url: './php/api/delete.php',
          type: 'POST',
          data: {
               path: path,
          },
          success: function(data) {
               console.log(data);
               data = JSON.parse(data);
               if (!data.success) {
                    alert(data.errors.join('\n'));
               }
          }
     });
}

function downloadPath(path){
     $("body").append('<iframe style="display:none;" src="./php/api/download.php?path=' + path + '"></iframe>');
}

$('#rc-context-menu').addClass('hidden');

var contextElement = null;
$(document).bind("contextmenu", function(event) {
     if ($(event.target).hasClass("context-file")) {
          contextElement = event.target;
          console.log(contextElement);
          event.preventDefault();
          $("#rc-context-menu").finish().toggleClass('hidden').

          css({
               top: event.pageY + "px",
               left: event.pageX + "px"
          });
     }
});

$(document).bind("mousedown", function(e) {
     if (!$(e.target).parents("#rc-context-menu").length > 0) {
          $("#rc-context-menu").addClass('hidden');
          contextElement = null;
     }
});


// If the menu element is clicked
$("#rc-context-menu div").click(function() {

     // This is the triggered action name
     switch ($(this).attr("data-rc-launch")) {
          // A case for each action. Your actions here
          case "download":
               downloadPath( $(contextElement).attr("data-path"));
               break;
          case "delete":
               deletePath( $(contextElement).attr("data-path"))
               break;
     }

     // Hide it AFTER the action was triggered
     $("#rc-context-menu").addClass('hidden');
});
