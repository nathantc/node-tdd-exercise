var express = require('express'),
    app = express(),
    user = require('./user');

app.use(express.logger());
app.use(express.cookieParser('pathfinder-ninja'));
app.use(express.cookieSession());
app.use(express.bodyParser());

app.post('/register', user.register);
app.post('/login', user.login);
app.get('/logout', user.logout);

app.get('/character/:id', function(req, res) {
    res.send(req.params.id);
})

function auth(req, res, next) {
    if (!req.session.userId) {
        res.send('User is not authorized', 402);
    } else {
        next();
    }
}

app.get('/user', auth, user.currentUser);
app.post('/user', auth, user.update);

//app.use(function (req, res, next) {
//    if (!err) return next();
//    console.log(err);
//    res.send(err.code, err.msg);
//});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});
