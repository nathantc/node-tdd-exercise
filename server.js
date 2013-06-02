//var express =  require('express');
//var app = express();
//app.use(express.logger());
//app.use(express.cookieParser('pathfinder-ninja'));
//app.use(express.cookieSession());
//app.use(express.bodyParser());
//
//app.get('/', function(req, res) {
//    console.log(req.session);
//    res.json({'username': req.session.username});
//});
//
//app.post('/login', function(req, res) {
//    console.log('login request', req.body);
//    req.session.username = req.body.username;
//    res.send();
//});
//
//app.get('/logout', function(req, res) {
//    console.log('logout session', req.session.username)
//    req.session = null;
//    res.send();
//});
//
//var port = process.env.PORT || 5000;
//app.listen(port, function() {
//    console.log('Listening on ' + port);
//}) ;

module.exports = require('./lib/route');