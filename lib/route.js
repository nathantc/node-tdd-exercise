var express = require('express'),
    app = express(),
    user = require('./user');

app.use(express.logger());
app.use(express.cookieParser('pathfinder-ninja'));
app.use(express.cookieSession());
app.use(express.bodyParser());

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.send('Unauthorized request', 403);
    }
}

app.post('/register', user.register);
app.post('/login', user.login);
app.get('/logout', user.logout);

app.get('/user', restrict, user.currentUser);
app.post('/user', restrict, user.update)

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});
