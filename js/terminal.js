var terminal = {
     socket: {},
     pwd: "genesis@maxchehab:~$",
     awaiting: false,
     log: function(msg) {
          console.log(msg);
          let terminal = document.getElementById("terminal");
          terminal.value += msg + this.pwd + " ";
          terminal.scrollTop = terminal.scrollHeight;
     },

     init: function() {
          var host = "ws://104.236.141.69:61599";
          that = this;
          try {
               that.socket = new WebSocket(host);
               console.log('WebSocket - status ' + that.socket.readyState);
               that.socket.onopen = function(msg) {
                    console.log("Welcome - status " + this.readyState);
               };
               that.socket.onmessage = function(msg) {
                    if(msg.data.length > 0 || that.awaiting){
                         that.awaiting = false;
                         console.log(msg.data);
                         that.log(msg.data);
                    }
               };
               that.socket.onclose = function(msg) {
                    console.log("Disconnected - status " + this.readyState);
               };
          } catch (ex) {
               that.log(ex);
          }

          $('#terminal').keypress(function(e) {
               if (e.which == 13) {
                    var content = this.value;
                    var lastLine = content.substr(content.lastIndexOf("\n") + 1);
                    that.send(lastLine.substr(that.pwd.length + 1));
               }
          });
     },

     send: function(msg) {
          createCookie("test", "asdfa", 2);
          try {
               this.socket.send(msg);
               this.awaiting = true;
          } catch (ex) {
               this.log(ex);
          }
     },

     quit: function() {
          if (this.socket != null) {
               this.socket.close();
               this.socket = null;
          }
     },

     reconnect: function() {
          this.quit();
          this.init();
     }
};

terminal.init();

function request(command){
     this.cookie = readCookie("genesis_session");
     this.command = command;
}
