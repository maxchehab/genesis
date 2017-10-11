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
var createPath = null;
var editor = ace.edit("editor");

var currentFile = 'default';
var deletePathTemp = null;

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
               console.log("open: " + data);
               data = JSON.parse(data);
               if (data.success) {
                    editor.setValue(data.file, -1);

                    currentFile = data.path;
                    editor.setReadOnly(false);
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
               console.log("directory: " + data);
               data = JSON.parse(data);
               if (data.success) {
                    createUIDirectory(data.directory, $("#initial_workspace"), "");
                    for (var i = 0; i < directories.length; i++) {
                         if (tempDirectories.indexOf(directories[i]) == -1) {
                              $(document.getElementById(directories[i])).parent().remove();
                         }
                    }
                    directories = tempDirectories;
                    tempDirectories = [];

                    if (directories.indexOf(currentFile) == -1 && currentFile != null) {
                         editor.setReadOnly(true);
                         editor.setValue(currentFile + " is not available. Please select a different file to edit.");
                         currentFile = null;
                    }

                    $(".file").click(function() {
                         var path = $(this).attr('data-path');
                         if (currentFile != path || (directories.indexOf(currentFile) != -1 && currentFile != path)) {
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

$(".cancel-delete-action").click(function() {
     deletePathTemp = null;
})

$(".create-directory-action").click(function(){
     createDirectory($("#create-directory-input").val());
})
$(".create-file-action").click(function(){
     createFile($("#create-file-input").val());
})

$(".delete-action").click(function() {
     deletePath(deletePathTemp);
     deletePathTemp = null;
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
                    console.log("login: " + data);
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
                    console.log("register: " + data);
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

          if (directories.indexOf(currentFile) != -1) {
               $.ajax({
                    url: './php/api/save.php',
                    type: 'POST',
                    data: {
                         file: currentFile,
                         data: editor.getSession().getValue()
                    },
                    success: function(data) {
                         console.log("save: " + data);
                         data = JSON.parse(data);
                         if (!data.success) {
                              alert(data.errors.join('\n'));
                         }
                    }
               });
          }

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

          $("#container").removeClass("terminal-show");
          $("#container").addClass("terminal-hide");
     }

     window.dispatchEvent(new Event('resize'));
}

var directories = [];
var tempDirectories = [];

function createUIDirectory(directory, root, path) {
     $(root).children(".file").remove();
     if (directory.length > 0) {
          for (var i = 0; i < directory.length; i++) {
               var tempFile = path + "/" + directory[i];
               if (directories.indexOf(tempFile) == -1) {
                    directories.push(tempFile);
               }
               $(root).append("<li data-path=\"" + tempFile + "\" id=\"" + tempFile + "\" class=\"file closed open context-file\"> <a data-path=\"" + tempFile + "\" class=\"file context-file\" href=\"#!\">" + directory[i] + "</a> </li>");
               tempDirectories.push(tempFile);

          }
     } else {
          for (var property in directory) {
               if (directory.hasOwnProperty(property)) {
                    if (directory[property].constructor !== String) {
                         var tempPath = path + "/" + property;
                         if (directories.indexOf(tempPath) == -1) {
                              directories.push(tempPath);
                              $(root).append("<li data-path=\"" + tempPath + "\" class=\"folder-root folder closed context-file\"><a class=\"context-file folder\" href=\"#\" data-path=\"" + tempPath + "\" >" + property + "</a><ul id=\"" + tempPath + "\"></ul></li>");
                         }
                         tempDirectories.push(tempPath);
                         createUIDirectory(directory[property], document.getElementById(tempPath), tempPath);
                    } else {
                         var tempFile = path + "/" + directory[property];
                         if (directories.indexOf(tempFile) == -1) {
                              directories.push(tempFile);
                         }
                         $(root).append("<li data-path=\"" + tempFile + "\" id=\"" + tempFile + "\" class=\"file closed open context-file\"> <a data-path=\"" + tempFile + "\" class=\"file context-file\" href=\"#!\">" + directory[property] + "</a> </li>");
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

function deletePath(path) {
     $.ajax({
          url: './php/api/delete.php',
          type: 'POST',
          data: {
               path: path
          },
          success: function(data) {
               console.log("delete: " + data);
               data = JSON.parse(data);
               if (!data.success) {
                    alert(data.errors.join('\n'));
               } else {
                    if (data.isFile) {
                         Materialize.toast('Deleted file ' + path, 4000)
                    } else {
                         Materialize.toast('Deleted directory ' + path, 4000)

                    }
               }
          }
     });
}

function downloadPath(path) {
     $("body").append('<iframe style="display:none;" src="./php/api/download.php?path=' + path + '"></iframe>');
}

$('#rc-context-menu').addClass('hidden');

var contextElement = null;
$(document).bind("contextmenu", function(event) {
     if ($(event.target).hasClass("context-file")) {
          contextElement = event.target;
          event.preventDefault();
          var path = $(event.target).attr("data-path")
          if (path == "/") {
               $("#rc-context-menu").addClass("root");

          } else {
               $("#rc-context-menu").removeClass("root");

          }
          if ($(event.target).hasClass("folder")) {
               $("#rc-context-menu").addClass("directory");
               $("#rc-context-menu").removeClass("del-file");
          } else {
               $("#rc-context-menu").addClass("del-file");
               $("#rc-context-menu").removeClass("directory");
          }
          $("#rc-context-menu").finish().toggleClass('hidden').css({
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
               downloadPath($(contextElement).attr("data-path"));
               break;
          case "delete":
               deletePathTemp = $(contextElement).attr("data-path");
               break;
          case "createFile":
               var path = $(contextElement).attr("data-path");
               if (path.slice(-1) != "/") {
                    path += '/';
               }
               $("#create-file-input").val(path);
               $("#create-file-input").focus();

               break;
          case "createDirectory":
               var path = $(contextElement).attr("data-path");
               if (path.slice(-1) != "/") {
                    path += '/';
               }
               $("#create-directory-input").val(path);
               $("#create-directory-input").focus();
               break;

     }

     // Hide it AFTER the action was triggered
     $("#rc-context-menu").addClass('hidden');
});

function createFile(path) {
     $.ajax({
          url: './php/api/createfile.php',
          type: 'POST',
          data: {
               path: path
          },
          success: function(data) {
               console.log("createfile: " + data);
               data = JSON.parse(data);
               if (!data.success) {
                    alert(data.errors.join('\n'));
               } else {
                    Materialize.toast('Created file ' + path, 4000);
               }
          }
     });
}
function createDirectory(path) {
     $.ajax({
          url: './php/api/createdirectory.php',
          type: 'POST',
          data: {
               path: path
          },
          success: function(data) {
               console.log("createdirectory: " + data);
               data = JSON.parse(data);
               if (!data.success) {
                    alert(data.errors.join('\n'));
               } else {
                    Materialize.toast('Created directory ' + path, 4000);
               }
          }
     });
}
