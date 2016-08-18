'use strict';

/*
 Reload client for Chrome Apps & Extensions.
 The reload client has a compatibility with livereload.
 WARNING: only supports reload command.
 */

var LIVERELOAD_HOST = 'localhost:';
var LIVERELOAD_PORT = 35729;
var connection = new WebSocket('ws://' + LIVERELOAD_HOST + LIVERELOAD_PORT + '/livereload');

//noinspection SpellCheckingInspection
connection.onerror = function (error) {
  console.log('reload connection got error' + JSON.stringify(error)); //
};

//noinspection SpellCheckingInspection
connection.onopen = function (event) {
  /*
   var hello = {
   command: 'hello',
   protocols: ['http://livereload.com/protocols/official-7']
   };

   connection.send(JSON.stringify(hello));
   */
};

//noinspection SpellCheckingInspection
connection.onmessage = function (e) {
  console.log("Relieved new message");
  if (e.data) {
    var data = JSON.parse(e.data);
    console.log(e);
    if (data && data.command === 'reload') {
      chrome.runtime.reload();
    }
  }
};
function done() {

}
connection.onclose = done.bind(null, null);