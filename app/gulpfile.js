/**
 * Created by Reza on 1/31/2015.
 */
var gulp = require('gulp');
var tinylr = require('tiny-lr');
var EXPRESS_PORT = 4000;
var EXPRESS_ROOT = __dirname;

function startExpress() {

  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')());
  app.use(express.static(EXPRESS_ROOT));
  app.listen(EXPRESS_PORT);
}

gulp.task('dev', function () {
  startExpress();
  var lr = tinylr();
  var port = 35729;

  lr.listen(port);
  gulp.watch(['**/*.{js,css,html,json}'], function (evt) {
    console.log('Event path: ' + evt);
    lr.changed({
      body: {
        files: [evt.path]
      }
    });
  });
});