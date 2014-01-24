
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();
var passport = require('passport');
var passportSocketIo = require("passport.socketio");


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'tobo!', maxAge: 90000000 }));
//app.use(express.session({ secret: 'some big secret in here' }));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);


require('./routes/router')(app,passport);
require('./routes/sockets')(io);

