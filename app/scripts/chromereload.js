'use strict';

// Reload client for Chrome Apps & Extensions.
// The reload client has a compatibility with livereload.
// WARNING: only supports reload command.

var LIVERELOAD_HOST = 'localhost:';
var LIVERELOAD_PORT = 35729;
var connection = new WebSocket('ws://' + LIVERELOAD_HOST + LIVERELOAD_PORT + '/livereload');
connection.onerror = function (error) {
  console.log('reload connection got error' + JSON.stringify(error)); //
};
connection.onopen = function (event) {
  //var hello = {
  //  command: 'hello',
  //  protocols: ['http://livereload.com/protocols/official-7']
  //};
  //
  //connection.send(JSON.stringify(hello));
};
connection.onmessage = function (e) {
  console.log("Recieved new message");
  if (e.data) {
    var data = JSON.parse(e.data);
    console.log(e);
    if (data && data.command === 'reload') {
      //console.log("Reloading.......");
      chrome.runtime.reload();
    }
  }
};
function done() {

}
connection.onclose = done.bind(null, null);