var express = require('express'),
    app = express(),
    user = require('./user');

app.use(express.logger());
app.use(express.cookieParser('pathfinder-ninja'));
app.use(express.cookieSession());
app.use(express.bodyParser());

app.get('/user', user.currentUser);
app.post('/user', user.update)
app.post('/register', user.register);
app.post('/login', user.login);
app.get('/logout', user.logout);

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});
